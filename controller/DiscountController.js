const Discount = require("../model/DiscountClass");
const Book = require("../model/BookClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { find } = require("../model/BookClass");

const currentdate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
  return dateString;
};

class DiscountController {

  async getAll(req, res) {
    try {
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      const discounts = await Discount.find()
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
      const discountInfo = await Discount.create({
        description,
        percentage,
        eligibleRoles,
        eligibleCountries,
        startDate,
        endDate,
        books,
      });
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
      const discountId = req.params.id;
      if (discountId.length != 24) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
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
        const afterUpdate = await Discount.findById(discountId);
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
      if (discountId.length != 24) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
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
      if (discountId.length != 24) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
      }
      const foundId = await Discount.findById(discountId);
      if (!foundId) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Discount not found");
      }
      const discount = await Discount.findByIdAndDelete(discountId);
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
