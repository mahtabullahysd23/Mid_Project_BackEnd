const Transaction = require("../model/TransactionClass");
const Cart = require("../model/CartClass");
const Book = require("../model/BookClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonWebtoken = require("jsonwebtoken");

class TransactionController {
    async create(req, res) {
        function getuserid(req) {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jsonWebtoken.decode(token);
            return decoded.data.user._id;
        }
        try {
        let cartbooks = [];
        let error = [];
        const user_id = getuserid(req);
        const cart_id = await Cart.findOne({ user: user_id }).select({ _id: 1 });
        const cart = await Cart.findById(cart_id);
        if (!cart || cart.books.length == 0) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "You have no items in cart");
        }
        const bookPromises = cart.books.map(async (book) => {
            const extBookstock = await Book.findById(book.book);
            if (extBookstock.stock < book.quantity) {
                return { msg: `Book ${extBookstock.name} stock is less than quantity` };
            }
            return null;
        });
        error = await Promise.all(bookPromises);
        error = error.filter((e) => e != null);
        if (error.length > 0) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", error);
        }
        cart.books.forEach(book => {
            cartbooks.push({
                book: book.book,
                quantity: book.quantity
            })
        })
        const order = {
            user: cart.user,
            cart: cart,
            books: cartbooks,
            total: cart.total
        }
        const created = (await Transaction.create(order));
        const resData = created.toObject();
        delete resData.cart;
        if (created) {
            await Cart.deleteOne({ _id: cart_id });
            cart.books.forEach(async book => {
                await Book.updateOne({ _id: book.book }, { $inc: { stock: -book.quantity } });
            });
            return response(res, HTTP_STATUS.OK, "successfully Received order", resData);
        }
        return response(res, HTTP_STATUS.BAD_REQUEST, "Transaction not created");
    }
    catch(e) {
        console.log(e);
        return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }
}

    // async getAllTransactions(req, res) {

    //     try {
    //         const orders = await Transaction.find({}).populate('books.id', '-stock -id').populate('user', '-username -password');
    //         orders.forEach(order => {
    //             order.total = (calculatePrice(order));
    //         })
    //         if (orders) {
    //             return res.status(200).send(success("successfully Received orders", orders));
    //         }
    //         return res.status(404).send(failure("Transaction not found"));
    //     }
    //     catch (e) {
    //         console.log(e);
    //         return res.status(500).send(failure("Internal Server Error", e));
    //     }

    // }

    async getMyTransactions (req, res) {
        function getuserid(req) {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jsonWebtoken.decode(token);
            return decoded.data.user._id;
        }
        try {
            const user_id = getuserid(req);
            const orders = await Transaction.find({ user: user_id }).populate('books.book', '-stock -_id -reviews').select({ _id: 1, books: 1, total: 1, createdAt: 1 });
            if (orders.length > 0) {
                return response(res, HTTP_STATUS.OK, "successfully Received orders", orders);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "You have no order history");
        }
        catch (e) {
            console.log(e);
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }
}
module.exports = new TransactionController();
