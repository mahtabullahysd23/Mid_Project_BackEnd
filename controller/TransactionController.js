const Transaction = require("../model/TransactionClass");
const Cart = require("../model/CartClass");
const Book = require("../model/BookClass");
const Discount = require("../model/DiscountClass");
const response = require("../utility/common");
const Wallet = require("../model/WalletClass");
const HTTP_STATUS = require("../constants/statusCodes");
const sendEmail = require("../utility/sendEmail");
const ejs = require("ejs");
const path = require("path");
const {currentdate}=require("../utility/functions");
const { validationResult } = require("express-validator");

const modifyCart = async (cart, req) => {
    try{
    const book_ids = cart.books.map(book => book.book);
    const discount = await Discount.find({ books: { $in: book_ids }, startDate: { $lte: currentdate() }, endDate: { $gte: currentdate() }, eligibleRoles: req.role ,eligibleCountries:req.country});
    cart = cart.toObject();
    const total = cart.books.reduce((accumulator, book) => {
        const founddiscount = discount.find(discount => discount.books.includes(book.book));
        const price = founddiscount ? book.discount_price ? book.discount_price:book.base_price: book.base_price;
        book.price = price;
        book.Item_total = price * book.quantity;
        delete book.base_price;
        delete book.discount_price;
        return accumulator + price * book.quantity;
    }, 0);
    cart.cart_total = total;
    return cart;
    }
    catch(e){
        console.log(e);
    }   
};

class TransactionController {
  async create(req, res) {
    try {
      const errorvalidation = validationResult(req);
      if (!errorvalidation.isEmpty()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Validation Error",
          errorvalidation.array()
        );
      }
      let cartbooks = [];
      let error = [];
      const user_id = req.user;
      const cart_id = await Cart.findOne({ user: user_id }).select({ _id: 1 });
      const wallet = await Wallet.findOne({ user: user_id });
      let cart = await Cart.findById(cart_id);
      if(cart){
        cart = await modifyCart(cart,req);
      }
      if (!cart || cart.books.length == 0) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "You have no items in cart"
        );
      }
      if (!wallet || cart.cart_total > wallet.balance) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "You have insufficient balance"
        );
      }
      const bookPromises = cart.books.map(async (book) => {
        const extBookstock = await Book.findById(book.book);
        if (extBookstock.stock < book.quantity) {
          return {
            msg: `Book ${extBookstock.name} stock is less than quantity`,
          };
        }
        return null;
      });
      error = await Promise.all(bookPromises);
      error = error.filter((e) => e != null);
      if (error.length > 0) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Validation Error",
          error
        );
      }
      cart.books.forEach((book) => {
        cartbooks.push({
          book: book.book,
          quantity: book.quantity,
          price: book.price,
        });
      });
      const order = {
        user: cart.user,
        cart: cart,
        books: cartbooks,
        total: cart.cart_total,
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        zipCode: req.body.zipCode
      };
      const created = await Transaction.create(order);
      const decreaseBalance = await Wallet.findOneAndUpdate(
        { user: user_id },
        {
          $inc: { balance: -cart.cart_total },
          $push: { debitTransactions: created._id },
        }
      );
      const resData = created.toObject();
      delete resData.__v;
      delete resData.cart;
      delete resData.updatedAt;
      if (created && decreaseBalance) {
        await Cart.deleteOne({ _id: cart_id });
        const updateOperations = cart.books.map((book) => ({
          updateOne: {
            filter: { _id: book.book },
            update: { $inc: { stock: -book.quantity } },
          },
        }));
        await Book.bulkWrite(updateOperations);

        let transaction = await Transaction.find({_id:created._id}).populate("user","-password -__v -_id -createdAt -updatedAt").populate("books.book","-stock -_id -reviews -createdAt -updatedAt -__v").select({__v:0,createdAt:0,updatedAt:0,cart:0});
       transaction=transaction[0].toObject();
        const renderedHtml = await ejs.renderFile(
          path.join(__dirname, "../views/transactionEmail.ejs"),
          { transaction }
        );
        await sendEmail(req.email, "Purchase Reciept", renderedHtml);
        delete resData.user;
        return response(
          res,
          HTTP_STATUS.OK,
          "successfully Received order",
          resData
        );
      }
      return response(res, HTTP_STATUS.BAD_REQUEST, "Transaction not created");
    } catch (e) {
      console.log(e);
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async getMyTransactions(req, res) {
    try {
      const user_id =req.user;
      const orders = await Transaction.find({ user: user_id })
        .populate("books.book", "-stock -_id -reviews")
        .select({ _id: 1, books: 1, total: 1, createdAt: 1 ,streetAddress:1,city:1 });
      if (orders.length > 0) {
        return response(
          res,
          HTTP_STATUS.OK,
          "successfully Received orders",
          orders
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "You have no order history");
    } catch (e) {
      console.log(e);
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async getAllTransactions(req, res) {
    try{
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Validation Error",
          error.array()
        );
      }
        let page = parseInt(req.query.page)||1;
        let limit = parseInt(req.query.limit)||10;
        const transactions = await Transaction.find({}).populate("user","-password -__v -_id -createdAt -updatedAt").populate("books.book","-stock -_id -reviews -createdAt -updatedAt -__v").select({__v:0,createdAt:0,updatedAt:0,cart:0})
        .skip((page-1)*limit)
        .limit(limit);
        if(transactions.length>0){
            return response(res,HTTP_STATUS.OK,"successfully Received all transactions",transactions);
        }
        return response(res,HTTP_STATUS.NOT_FOUND,"Transactions not found");
    }
    catch(e){
        console.log(e);
        return response(res,HTTP_STATUS.INTERNAL_SERVER_ERROR,"Internal Server Error");
    }
  }
}
module.exports = new TransactionController();
