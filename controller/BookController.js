const Book = require("../model/BookClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");

class BookController {
    async getAll(req, res) {
        function getFilterCondition(operator, value) {
            const operators = {
                gt: { $gt: value },
                gte: { $gte: value },
                lt: { $lt: value },
                lte: { $lte: value },
                eq: { $eq: value },
            };
            return operators[operator] || {};
        }
        try {
            let limit = parseInt(req.query.Limit) || 10;
            let page = parseInt(req.query.Page) || 1;
            let sortBy = req.query.SortBy || "_id";
            let sortDirection = req.query.SortByType === "desc" ? -1 : 1;
            let filters = {};
    
            // Handle search queries for name or author
            if (req.query.Search) {
                const searchRegex = new RegExp(req.query.Search, 'i');
                filters["$or"] = [{ name: searchRegex }, { author: searchRegex }];
            }
    
            // Handle filtering by name and author
            if (req.query.Name) {
                filters.name = { $in: req.query.Name };
            }
            if (req.query.Author) {
                filters.author = { $in: req.query.Author };
            }
    
            // Handle filtering by price and stock
            if (req.query.Price) {
                filters.price = getFilterCondition(req.query.priceOperator, parseFloat(req.query.Price));
            }
            if (req.query.Stock) {
                filters.stock = getFilterCondition(req.query.stockOperator, parseInt(req.query.Stock));
            }
    
            const count = await Book.countDocuments(filters);
            const books = await Book.find(filters)
                .sort({[sortBy]: sortDirection })
                .skip((page - 1) * limit)
                .limit(limit);
    
            if (books.length > 0) {
                return response(res, HTTP_STATUS.OK, "Books fetched successfully", {
                    total: count,
                    page,
                    limit,
                    onThisPage: books.length,
                    books,

                });
            }
    
            return response(res, HTTP_STATUS.NOT_FOUND, "No books found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }

    async getById(req, res) {
        const bookId = req.params.id;
        if (bookId.length != 24) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
        }
        try {
            const book = await Book.findById(bookId).populate("reviews").populate("reviews.user", "-__v -_id");
            if (book) {
                return response(res, HTTP_STATUS.OK, "Book fetched successfully", book);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }

    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
            }
            const {name,price,stock,author,genre,publisher,isbn,pages,language} = req.body;
            const extISBN = await Book.findOne({isbn});
            if (extISBN) {
                return response(res, HTTP_STATUS.CONFLICT, "ISBN already exists");
            }
            const created = await Book.create({name,price,stock,author,genre,publisher,isbn,pages,language});
            if (created) {
                return response(res, HTTP_STATUS.CREATED, "Book created successfully", created);
            }
            return response(res, HTTP_STATUS.BAD_REQUEST, "Book not created");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }

    async update(req, res) {

        const bookId = req.params.id;
        if (bookId.length != 24) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
        }
        try {
            const {name,price,stock,author,genre,publisher,isbn,pages,language} = req.body;
            const extISBN = await Book.findOne({isbn});
            if (extISBN) {
                return response(res, HTTP_STATUS.CONFLICT, "ISBN already exists");
            }
            const updatedbook= await Book.findByIdAndUpdate(bookId, {name,price,stock,author,genre,publisher,isbn,pages,language});
            const afterUpdate = await Book.findById(bookId);
            if (updatedbook) {
                return response(res, HTTP_STATUS.OK, "Book updated successfully", afterUpdate);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }

    }
    
    async delete(req, res) {

        const bookId = req.params.id;
        if (bookId.length != 24) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
        }
        try {
            const deleted = await Book.findByIdAndDelete(bookId);
            if (deleted) {
                return response(res, HTTP_STATUS.OK, "Book deleted successfully",deleted);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }

    }
}

module.exports = new BookController();