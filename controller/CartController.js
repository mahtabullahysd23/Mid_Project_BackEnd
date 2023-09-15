const Cart = require('../model/CartClass');
const Book = require('../model/BookClass');
const response = require('../utility/common');
const { validationResult } = require("express-validator");
const HTTP_STATUS = require('../constants/statusCodes');
const jsonWebtoken = require('jsonwebtoken');

class CartController {
    async add(req, res) {
        function getuserid(req) {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jsonWebtoken.decode(token);
            return decoded.data.user._id;
        }
        try {
            let error = [];
            let totalprev = 0;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
            }
            const cart = req.body;
            cart.user = getuserid(req);
            const extBook = await Book.findById({ _id: cart.book });
            const extCartandBook = await Cart.findOne({ user: cart.user, "books.book": cart.book }).select({ "books.$": 1 });
            const extCart = await Cart.findOne({ user: cart.user });
            if (!extBook) {
                error.push({ msg: "Book does not exist" });
            }
            if (extBook) {
                if (extBook.stock < cart.quantity) {
                    error.push({ msg: "Book stock is less than quantity" });
                }
                else if (extBook.stock == 0) {
                    error.push({ msg: "Book stock is zero" });
                }
                else if (extCartandBook && extBook.stock < extCartandBook.books[0].quantity + cart.quantity) {
                    error.push({ msg: "Book stock is less than quantity" });
                }
            }
            if (error.length > 0) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", error);
            }
            if (extCart) {
                totalprev = extCart.total;
            }
            const cartitem = {
                user: cart.user,
                books:
                {
                    book: cart.book,
                    quantity: cart.quantity
                },
                total: (totalprev + (cart.quantity * extBook.price))
            }
            if (extCart) {
                if (await Cart.findOne({ user: cart.user, "books.book": cart.book })) {
                    const updated = await Cart.updateOne({ user: cart.user, "books.book": cart.book }, { $inc: { "books.$.quantity": cart.quantity } });
                    const updatedtotal = await Cart.updateOne({ user: cart.user }, { $set: { total: cartitem.total } });
                    if (updated && updatedtotal) {
                        const mycart = await Cart.findOne({ user: cart.user });
                        return response(res, HTTP_STATUS.OK, "successfully Added to cart", mycart);
                    }
                    return response(res, HTTP_STATUS.NOT_FOUND, "Cart not updated"); 
                }
                else {
                    const updated = await Cart.updateOne({ user: cart.user }, { $push: { books: cartitem.books } });
                    const updatedtotal = await Cart.updateOne({ user: cart.user }, { $set: { total: cartitem.total } });
                    if (updated && updatedtotal) {
                        const mycart = await Cart.findOne({ user: cart.user });
                        return response(res, HTTP_STATUS.OK, "successfully Added to cart", mycart);
                    }
                    return response(res, HTTP_STATUS.NOT_FOUND, "Cart not updated");
                }
            }
            else {
                const created = await Cart.create(cartitem);
                if (created) {
                    return response(res, HTTP_STATUS.OK, "successfully Added to cart", created);
                }
                return response(res, HTTP_STATUS.NOT_FOUND, "Cart not created");
            }
        }
        catch (e) {
            console.log(e);
            return response (res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }

    async remove(req, res) {
        function getuserid(req) {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jsonWebtoken.decode(token);
            return decoded.data.user._id;
        }
       try {
            let error = [];
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
            }
            const cart = req.body;
            cart.user = getuserid(req);
            const extcart = await Cart.findOne({ user: cart.user });
            if (!extcart) {
                error.push({ msg: "You have no book in the cart" });
            }

            if (extcart) {
                const extBook = await Cart.findOne({ user: cart.user, "books.book": cart.book }).select({ "books.$": 1 });
                if (!extBook) {
                    error.push({ msg: "Book does not exist in the cart" });
                }
                if (extBook) {
                    if (extBook.books[0].quantity < cart.quantity) {
                        error.push({ msg: "Quantity is greater than the quantity in the cart" });
                    }
                }
            }
            if (error.length > 0) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", error);
            }
            const updated = await Cart.updateOne({ user: cart.user, "books.book": cart.book }, { $inc: { "books.$.quantity": -cart.quantity } });
            const extBook = await Book.findById({ _id: cart.book });
            const total = extcart.total - (cart.quantity * extBook.price);
            const updatedtotal = await Cart.updateOne({ user: cart.user }, { $set: { total: total } });
            if (updated && updatedtotal) {
                const mycart = await Cart.findOne({ user: cart.user });
                mycart.books.forEach(book => {
                    if(book.quantity==0){
                        mycart.books.remove(book);
                    }
                });
                 await Cart.updateOne({ user: cart.user }, { $set: {books: mycart.books} });
                 if(mycart.books.length==0){
                    await Cart.deleteOne({ user: cart.user });
                    return response(res, HTTP_STATUS.OK, "successfully Removed from cart", {msg:"Cart is empty"});
                 }
                return response(res, HTTP_STATUS.OK, "successfully Removed from cart", mycart);
            }
        }
        catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }

    }

    async getMyCart(req, res) {
        function getuserid(req) {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jsonWebtoken.decode(token);
            return decoded.data.user._id;
        }
        try {
            const userid = getuserid(req);
            const extcart = await Cart.findOne({ user: userid });
            if (!extcart||extcart.books.length==0) {
                return response(res, HTTP_STATUS.NOT_FOUND, "You have no book in the cart");
            }
            return response(res, HTTP_STATUS.OK, "Cart fetched successfully", extcart);
        }
        catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }
}

module.exports = new CartController();