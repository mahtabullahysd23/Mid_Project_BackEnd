const Discount = require("../model/DiscountClass");
const Book = require("../model/BookClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const {currentdate}=require("../utility/functions");
const mongoose = require("mongoose");


class DiscountController {
  async getAll(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(res, HTTP_STATUS.BAD_REQUEST, errors.array());
      }
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      const discounts = await Discount.find().select("-__v")
        .skip((page - 1) * limit)
        .limit(limit);
      if (discounts.length > 0) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Discounts Data Received successfully",
          discounts
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "No Discounts Found");
    } catch (e) {
      return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
    }
  }

  async add(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(res, HTTP_STATUS.BAD_REQUEST, errors.array());
      }

      const {
        description,
        percentage,
        eligibleRoles,
        eligibleCountries,
        startDate,
        endDate,
        books,
      } = req.body;
      if (startDate < currentdate()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Start Date must be greater than Current Date"
        );
      }
      if (startDate > endDate) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "End Date must be greater than Start Date"
        );
      }
      if (books.length > 0) {
        const invalidBookIds = books.filter((book) => book.length != 24);
        if (invalidBookIds.length > 0) {
          return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Book Ids", invalidBookIds);
        }
        const counts = books.reduce((acc, value) => {
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        }, {});
        const duplicates = Object.keys(counts).filter((key) => counts[key] > 1);
        if (duplicates.length > 0) {
          return response(res, HTTP_STATUS.BAD_REQUEST, "Duplicate Book Ids", duplicates);
        }
        const existingBookIds = await Book.find({ _id: books }).select("_id");
        if (existingBookIds.length != books.length) {
          const missing = books.filter((book) => !existingBookIds.some((item) => item._id == book));
          return response(res, HTTP_STATUS.NOT_FOUND, "Some Book not found",missing);
        }

      }
      let discountInfo = await Discount.create({
        description,
        percentage,
        eligibleRoles,
        eligibleCountries,
        startDate,
        endDate,
        books,
      });
      discountInfo = discountInfo.toObject();
      delete discountInfo.__v;
      if (discountInfo) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Discount Added Successfully",
          discountInfo
        );
      }
      return response(res, HTTP_STATUS.BAD_REQUEST, "Discount Not Added");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async addItem(req, res) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return response(res, HTTP_STATUS.BAD_REQUEST, validationErrors.array());
      }
      const discountId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(discountId)) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
      }
      if (!req.body.book && !req.body.eligibleCountries && !req.body.eligibleRoles) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "No data Provided");
      }
      const { book, eligibleCountries, eligibleRoles } = req.body;
      const extbook = await Book.find({ _id: book });
      const discount = await Discount.findById(discountId);
      if (!extbook) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Book not found");
      }
      if (!discount) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Discount not found");
      }
      const bookExist = discount.books.find((item) => item == book);
      if (bookExist) {
        return response(res, HTTP_STATUS.CONFLICT, "Book already exists");
      }
      const discountInfo = await Discount.findByIdAndUpdate(discountId, {
        $push: {
          books: book,
          eligibleCountries: eligibleCountries,
          eligibleRoles: eligibleRoles,
        },
      });
      if (discountInfo) {
        const afterUpdate = await Discount.findById(discountId).select("-__v");
        return response(
          res,
          HTTP_STATUS.OK,
          "Item Added to discount Successfully",
          afterUpdate
        );
      }
      return response(res, HTTP_STATUS.BAD_REQUEST, "Discount Item Not Added");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async updateDiscount(req, res) {
    try {
      const discountId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(discountId)) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(res, HTTP_STATUS.BAD_REQUEST, errors.array());
      }
      const {
        description,
        percentage,
        eligibleRoles,
        eligibleCountries,
        startDate,
        endDate,
        books,
      } = req.body;
      const discount = await Discount.findById(discountId);
      if (!discount) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Discount not found");
      }
      if (startDate < currentdate()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Start Date must be greater than Current Date"
        );
      }
      if (startDate > endDate) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "End Date must be greater than Start Date"
        );
      }
      const discountInfo = await Discount.findByIdAndUpdate(discountId, {
        $set: {
          description,
          percentage,
          eligibleRoles,
          eligibleCountries,
          startDate,
          endDate,
          books,
        },
      });
      const afterUpdate = await Discount.findById(discountId);
      if (discountInfo) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Discount Updated Successfully",
          afterUpdate
        );
      }
      return response(res, HTTP_STATUS.BAD_REQUEST, "Discount Not Updated");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async deleteDiscount(req, res) {
    try {
      const discountId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(discountId)) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
      }
      const foundId = await Discount.findById(discountId);
      if (!foundId) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Discount not found");
      }
      const discount = await Discount.findByIdAndDelete(discountId).select("-__v");
      if (discount) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Discount Deleted Successfully",
          discount
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "Discount Not Found");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }
}

module.exports = new DiscountController();
