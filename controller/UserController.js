const User = require("../model/UserClass");
const Auth = require("../model/AuthClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");


class UserController {
  async getAllUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(res, HTTP_STATUS.BAD_REQUEST, errors.array());
      }
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
      let user = await User.findById(user_id).select("-__v");
      if (!user) {
        return response(res, HTTP_STATUS.NOT_FOUND, "User not found");
      }
      const {name,address,role,banned,locked}=req.body;

        const userUpdaed = await User.findByIdAndUpdate(
            user_id,
            { $set: { name,address } }
        )
        const authUpdaed = await Auth.findOneAndUpdate(
            {user:user_id},
            { $set: { role:role, banned,locked} }
        )
       user = await User.findById(user_id).select("-__v");
        if (userUpdaed||authUpdaed) {
            return response(res, HTTP_STATUS.OK, "User Updated Successfully", user);
        }
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
            //const userDeleted = await User.findByIdAndDelete(user_id).select("-__v");
            const resdata = await User.find({_id:user_id}).select("-__v");
            const userDeleted = await Auth.findOneAndUpdate({user:
                user_id,banned:false},
                {$set: { banned: true }}
            ).select("-__v ");
            if (userDeleted) {
                return response(res, HTTP_STATUS.OK, "User Deleted Successfully", resdata);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "User Not Found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
        }
    }

    async getMyProfile(req, res) {
        try {
            const user_id = req.user;
            const user = await User.findById(user_id).select("-__v");
            if (user) {
                return response(res, HTTP_STATUS.OK, "User Data Received successfully", user);
            }
            return response(res, HTTP_STATUS.NOT_FOUND, "No User Found");
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
        }
    }

    async updateProfile (req, res) {
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
            const user_id = req.user;
            let user = await User.findById(user_id).select("-__v");
            if (!user) {
                return response(res, HTTP_STATUS.NOT_FOUND, "User not found");
            }
            const {name,address,country,city,number,imageUrl}=req.body;
            const userUpdaed = await User.findByIdAndUpdate(
                user_id,
                { $set: {name,address,country,city,number,imageUrl} }
            )
            user = await User.findById(user_id).select("-__v");
            if (userUpdaed) {
                return response(res, HTTP_STATUS.OK, "Profile Updated Successfully", user);
            }
        } catch (e) {
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Error");
        }
    }
}


module.exports = new UserController();
