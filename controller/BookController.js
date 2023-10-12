const Book = require("../model/BookClass");
const Discount = require("../model/DiscountClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const jsonWebtoken = require("jsonwebtoken");
const {currentdate} = require("../utility/functions");
const mongoose = require("mongoose");
const getUserrole = (req) => {  
    try{
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jsonWebtoken.decode(token);
        return decoded.data.role;
    }
    catch(e){
        return null;
    } 
}
const getUsercountry = (req) => {  
  try{
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jsonWebtoken.decode(token);
      return decoded.data.country;
  }
  catch(e){
      return null;
  } 
}

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Validation Error",
        errors.array()
      );
    }
    try {
      let limit = parseInt(req.query.Limit) || 12;
      let page = parseInt(req.query.Page) || 1;
      let sortBy = req.query.SortBy || "_id";
      let sortDirection = req.query.SortByType === "desc" ? -1 : 1;
      let filters = {};
      if (req.query.Search) {
        const sanitizedSearchQuery = req.query.Search.replace(/\s+/g, "\\s*");
        const searchRegex = new RegExp(sanitizedSearchQuery, "i");
        filters["$or"] = [{ name: searchRegex }, { author: searchRegex }, { genre: searchRegex }, { publisher: searchRegex }, { isbn: searchRegex }, { language: searchRegex },{ tags: searchRegex },{ description: searchRegex },];
      }

      if(req.query.SortBy && !req.query.SortByType || req.query.SortByType && !req.query.SortBy){
        return response(res, HTTP_STATUS.BAD_REQUEST, "SortBy and SortByType both are required");
      }
      if(req.query.Price && !req.query.priceOperator || req.query.priceOperator && !req.query.Price){
        return response(res, HTTP_STATUS.BAD_REQUEST, "price and priceOperator both are required");
      }
      if(req.query.Stock && !req.query.stockOperator || req.query.stockOperator && !req.query.Stock){
        return response(res, HTTP_STATUS.BAD_REQUEST, "Stock and stockOperator both are required");
      }
     
      if (req.query.Name) {
        filters.name = { $in: req.query.Name };
      }
      if (req.query.Author) {
        filters.author = { $in: req.query.Author };
      }
      if (req.query.Genre) {
        filters.genre = { $in: req.query.Genre };
      }
      if (req.query.Publisher) {
        filters.publisher = { $in: req.query.Publisher };
      }
      if (req.query.isbn) {
        filters.isbn = { $in: req.query.isbn };
      }
      if (req.query.Language) {
        filters.language = { $in: req.query.Language };
      }

      if (req.query.Tag) {
        filters.tag = { $in: req.query.Tag };
      }

      if (req.query.PriceBetween){
        const price = req.query.PriceBetween.split(",");
        filters.price = { $gte: price[0], $lte: price[1] };
      }

      // Handle filtering by price and stock
      const sortby = (books)=>
      {
        if(req.query.SortBy==="price")
        {
          if(req.query.SortByType==="asc")
          {
            books.sort((a,b)=>a.price-b.price);
          }
          else if(req.query.SortByType==="desc")
          {
            books.sort((a,b)=>b.price-a.price);
          }
        }
        return books;
      }

      const  filterBooksByPriceOperator = (arr, operator, value)=> {
          const operatorsMap = {
            gt: (a, b) => a > b,
            gte: (a, b) => a >= b,
            eq: (a, b) => a === b,
            lte: (a, b) => a <= b,
            lt: (a, b) => a < b,
          };
          if (operatorsMap[operator]) {
            return arr.filter(book => operatorsMap[operator](book.price, value));
          } else {
            return [];
          } 
      }

      if (req.query.Stock) {
        filters.stock = getFilterCondition(
          req.query.stockOperator,
          parseInt(req.query.Stock)
        );
      }
      const count = await Book.countDocuments(filters);
      const books = await Book.find(filters)
      
        .sort({ [sortBy]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit).select("-__v -reviews");
      if (books.length > 0) {
        const book_ids = books.map((book) => book._id);
        const discount = await Discount.find({ books: { $in: book_ids }, startDate: { $lte: currentdate() }, endDate: { $gte: currentdate() },eligibleRoles:getUserrole(req),eligibleCountries:getUsercountry(req)});
        let discounted_books = [];
        books.forEach((book) => {
          const book_discount = discount.filter((discount) =>
            discount.books.includes(book._id)
          );
          if (book_discount.length > 0) {
            book.price =
              book.price - (book.price * book_discount[book_discount.length-1].percentage) / 100;
            book = book.toObject();
            book = { ...book, discount: book_discount[book_discount.length-1].percentage+"%" };
          }
            discounted_books.push(book);
        });
        if(discounted_books.length>0){
          discounted_books=sortby(discounted_books);
        if(req.query.priceOperator&&req.query.Price){
          discounted_books=filterBooksByPriceOperator(discounted_books,req.query.priceOperator,parseFloat(req.query.Price));
        }
        return response(res, HTTP_STATUS.OK, "Books fetched successfully", {
          total: count,
          page,
          limit,
          onThisPage: books.length,
          books:discounted_books,
        });
        }
        return response(res, HTTP_STATUS.NOT_FOUND, "No books found");
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "No books found");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async getById(req, res) {
    const discountedPrice = async (book_id, req) => {
      const discount = await Discount.find({ books: { $in: book_id }, startDate: { $lte: currentdate() }, endDate: { $gte: currentdate() }, eligibleRoles: getUserrole(req),eligibleCountries:getUsercountry(req)});
      if (discount.length > 0) {
          return discount[discount.length-1].percentage;
      }
      return 0;
  }
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
    }
    try {

      const book = await Book.findById(bookId)
        .populate("reviews")
        .populate({
          path: 'reviews', // Reference the 'author' field
          populate: {
            path: 'user', // Populate the 'friends' field within the 'User' model
          },
        })

      if (book) {
        const discount = await discountedPrice(bookId, req);
        if (discount>0) {
          book.price = book.price - (book.price * discount) / 100;
          book.discount = discount+"%";
        }
        return response(res, HTTP_STATUS.OK, "Book fetched successfully", book);
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Validation Error",
          errors.array()
        );
      }
      const {
        name,
        price,
        stock,
        author,
        genre,
        publisher,
        isbn,
        pages,
        language,
        description,
        imageUrl,
        tags,
      } = req.body;
      const extISBN = await Book.findOne({ isbn });
      if (extISBN) {
        return response(res, HTTP_STATUS.CONFLICT, "ISBN already exists");
      }
      let created = await Book.create({
        name,
        price,
        stock,
        author,
        genre,
        publisher,
        isbn,
        pages,
        language,
        description,
        imageUrl,
        tags
      });
      created=created.toObject();
      delete created.__v;
      delete created.reviews;
      if (created) {
        return response(
          res,
          HTTP_STATUS.CREATED,
          "Book created successfully",
          created
        );
      }
      return response(res, HTTP_STATUS.BAD_REQUEST, "Book not created");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async update(req, res) {
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Validation Error",
        errors.array()
      );
    }
    try {
      const {
        name,
        price,
        stock,
        author,
        genre,
        publisher,
        isbn,
        pages,
        language,
        description,
        imageUrl,
        tags
      } = req.body;
      const extISBN = await Book.findOne({ isbn });
      if (extISBN) {
        return response(res, HTTP_STATUS.CONFLICT, "ISBN already exists");
      }
      const updatedbook = await Book.findByIdAndUpdate(bookId, {
        name,
        price,
        stock,
        author,
        genre,
        publisher,
        isbn,
        pages,
        language,
        description,
        imageUrl,
        tags
      });
      const afterUpdate = await Book.findById(bookId).select("-__v -reviews");
      if (updatedbook) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Book updated successfully",
          afterUpdate
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async delete(req, res) {
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
    }
    try {
      const deleted = await Book.findByIdAndDelete(bookId).select("-__v -reviews");
      if (deleted) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Book deleted successfully",
          deleted
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }
}

module.exports = new BookController();
