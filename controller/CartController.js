const Cart = require('../model/CartClass');
const Book = require('../model/BookClass');
const Discount = require('../model/DiscountClass');
const response = require('../utility/common');
const { validationResult } = require("express-validator");
const HTTP_STATUS = require('../constants/statusCodes');
const {currentdate}=require('../utility/functions')

const discountedPrice = async (book_id, req) => {
    const discount = await Discount.find({ books: book_id, startDate: { $lte: currentdate() }, endDate: { $gte: currentdate() }, eligibleRoles: req.role,eligibleCountries:req.country});
    if (discount.length > 0) {
        return discount[discount.length-1].percentage;
    }
    return 0;
}

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
        console.log();
    }   
};

class CartController {
    async add(req, res) {
        try {
            let error = [];
            let discount_price = 0;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
            }
            const cart = req.body;
            cart.user = req.user;
            const extBook = await Book.findById({ _id: cart.book });
            const extCartandBook = await Cart.findOne({ user: cart.user, "books.book": cart.book }).select({ "books.$": 1 });
            const extCart = await Cart.findOne({ user: cart.user });
            const percentage = await discountedPrice(cart.book, req);
            if (percentage) {
                discount_price = extBook.price - (extBook.price * percentage / 100);
            }
            if (!extBook) {
                error.push({ msg: "Book does not exist" });
            }
            if (extBook) {
                if (extBook.stock < cart.quantity) {
                    error.push({ msg: "Book is out of stock" });
                }
                else if (extBook.stock == 0) {
                    error.push({ msg: "Book stock is zero" });
                }
                else if (extCartandBook && extBook.stock < extCartandBook.books[0].quantity + cart.quantity) {
                    error.push({ msg: "Book is out of stock" });
                }
            }
            if (error.length > 0) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", error);
            }
            const cartitem = {
                user: cart.user,
                books:
                {
                    book: cart.book,
                    quantity: cart.quantity,
                    base_price: extBook.price,
                    discount_price: discount_price
                }
            }
            if (extCart) {
                if (await Cart.findOne({ user: cart.user, "books.book": cart.book })) {
                    const updated = await Cart.updateOne({ user: cart.user, "books.book": cart.book }, { $inc: { "books.$.quantity": cart.quantity },$set: { "books.$.base_price": extBook.price,"books.$.discount_price": discount_price } } );
                    if (updated) {
                        const mycart = await Cart.findOne({ user: cart.user }).select('-user -__v');
                        return response(res, HTTP_STATUS.OK, "successfully Added to cart", await modifyCart(mycart, req));
                    }
                    return response(res, HTTP_STATUS.NOT_FOUND, "Cart not updated");
                }
                else {
                    const updated = await Cart.updateOne({ user: cart.user }, { $push: { books: cartitem.books } });
                    if (updated) {
                        const mycart = await Cart.findOne({ user: cart.user }).select('-user -__v');
                        return response(res, HTTP_STATUS.OK, "successfully Added to cart", await modifyCart(mycart, req));
                    }
                    return response(res, HTTP_STATUS.NOT_FOUND, "Cart not updated");
                }
            }
            else {
                const created = await Cart.create(cartitem);
                if (created) {
                    const mycart = await Cart.findOne({ user: cart.user }).select('-user -__v');
                    return response(res, HTTP_STATUS.OK, "successfully Added to cart", await modifyCart(mycart, req));
                }
                return response(res, HTTP_STATUS.NOT_FOUND, "Cart not created");
            }
        }
        catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }

    async remove(req, res) {
        try {
            let error = [];
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
            }
            const cart = req.body;
            cart.user = req.user;
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
            if (updated) {
                const mycart = await Cart.findOne({ user: cart.user }).select('-user -__v');;
                mycart.books.forEach(book => {
                    if (book.quantity == 0) {
                        mycart.books.remove(book);
                    }
                });
                await Cart.updateOne({ user: cart.user }, { $set: { books: mycart.books } });
                if (mycart.books.length == 0) {
                    await Cart.deleteOne({ user: cart.user });
                    return response(res, HTTP_STATUS.OK, "successfully Removed from cart", { msg: "Cart is empty" });
                }
                return response(res, HTTP_STATUS.OK, "successfully Removed from cart", await modifyCart(mycart, req));
            }
        }
        catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }

    }

    async getMyCart(req, res) {
        try {
            const userid = req.user;
            const extcart = await Cart.findOne({ user: userid }).select('-user -__v').populate('books.book','-__v -reviews' );
            if (!extcart || extcart.books.length == 0) {
                return response(res, HTTP_STATUS.NOT_FOUND, "You have no book in the cart");
            }
            return response(res, HTTP_STATUS.OK, "Cart fetched successfully", await modifyCart(extcart, req));
        }
        catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }
}

module.exports = new CartController();