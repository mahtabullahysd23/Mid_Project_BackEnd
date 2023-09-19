const User = require("../model/UserClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");


class UserController {
  async getAllUser(req, res) {
    try {
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      const users = await User.find().select("-__v")
        .skip((page - 1) * limit)
        .limit(limit);
      if (users.length > 0) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Users Data Received successfully",
          users
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "No Users Found");
    } catch (e) {
      return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
    }
  }

  async getUserById(req, res) {
    try {
      const user_id =req.params.id
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
      }
      const user = await User.findById(user_id).select("-__v");
      if (user) {
        return response(
          res,
          HTTP_STATUS.OK,
          "User Data Received successfully",
          user
        );
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "No User Found");
    } catch (e) {
      return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
    }
  }

  async updateUser(req, res) {
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
      const user_id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
      }
      const {name,address}=req.body;
        const userUpdaed = await User.findByIdAndUpdate(
            user_id,
            { $set: { name,address } }
        )
        const user = await User.findById(user_id);
        if (userUpdaed) {
            return response(res, HTTP_STATUS.OK, "User Updated Successfully", user);
        }
        return response(res, HTTP_STATUS.NOT_FOUND, "User Not Found");
    } catch (e) {
      return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
    }
  }

    async deleteUser(req, res) {
        try {
            const user_id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
              return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Id");
            }
            const userDeleted = await User.findByIdAndDelete(user_id).select("-__v");
            if (userDeleted) {
                return response(res, HTTP_STATUS.OK, "User Deleted Successfully", userDeleted);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "User Not Found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
        }
    }
}


module.exports = new UserController();
