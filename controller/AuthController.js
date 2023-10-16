const User = require("../model/UserClass");
const Auth = require("../model/AuthClass");
const sendEmail = require("../utility/sendEmail");
const HTTP_STATUS = require("../constants/statusCodes");
const response = require("../utility/common");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jsonWebtoken = require("jsonwebtoken");
const ejs = require("ejs");
const path = require("path");
class Authcontroller {
  async login(req, res) {
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
      const { email, password } = req.body;
      const user = await Auth.findOne({ "email.id": email }).populate(
        "user",
        "-__v"
      );
      if (!user) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Invalid Credentials");
      }
      if (user.banned) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "You are banned from the system"
        );
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const updateAttempt = await Auth.findOneAndUpdate(
          { "email.id": email },
          { $inc: { attempt: 1 } }
        );

        if (updateAttempt.attempt >= 3) {
          await Auth.findOneAndUpdate(
            { "email.id": email },
            {
              $set: {
                locked: true,
                unloackTime: Date.now() + 24 * 60 * 60 * 1000,
              },
            }
          );
          return response(
            res,
            HTTP_STATUS.TOO_MANY_REQUESTS,
            "Too Many attempts, Your account is blocked for 24 hours"
          );
        }
        return response(res, HTTP_STATUS.UNAUTHORIZED, "Invalid Credentials");
      }
      if (user.locked && user.unloackTime > Date.now()) {
        return response(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too Many attempts, Your account is blocked for 24 hours"
        );
      }
      if (!user.email.status) {
        return response(res, HTTP_STATUS.FORBIDDEN, "Please verify your email");
      }
      const tokenExpiration = "24h";
      const token = jsonWebtoken.sign({ data: user }, process.env.JWT_KEY, {
        expiresIn: tokenExpiration,
      });
      await Auth.findOneAndUpdate(
        { "email.id": email },
        { $set: { locked: false, unloackTime: Date.now(), attempt: 0 } }
      );
      return response(res, HTTP_STATUS.OK, "Successfully Logged in", {
        role: user.role,
        token: token,
      });
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async signUp(req, res) {
    async function sendVerifyEmail(email, name) {
      try {
        const token = jsonWebtoken.sign({ email }, process.env.JWT_KEY, {
          expiresIn: "3m",
        });
        const validationlink = `${process.env.BASE_URL}api/auth/verifyemail/${token}`;

        const renderedHtml = await ejs.renderFile(
          path.join(__dirname, "../views/verifyemail.ejs"),
          { name, validationlink, port: process.env.PORT }
        );
        sendEmail(email, "Account Verification", renderedHtml);

        return true;
      } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
      }
    }

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

      const { name, email, address, password, country } = req.body;

      const existEmail = await Auth.findOne({ "email.id": email });

      if (existEmail) {
        if (existEmail.email.status === true) {
          return response(res, HTTP_STATUS.CONFLICT, "Email already exists");
        } else {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);

          const updatedAuth = await Auth.findOneAndUpdate(
            { "email.id": email },
            { $set: { password: hash } },
            { $set: { country: country } }
          );

          const updateUser = await User.findOneAndUpdate(
            { email: email },
            { $set: { name: name, address: address } }
          );

          const sent = await sendVerifyEmail(email, name);

          if (updatedAuth && updateUser && sent) {
            const upauthfound = await Auth.findOne({ "email.id": email })
              .select(
                "-email -password -attempt -locked -unloackTime -__v -_id -role -banned"
              )
              .populate("user", "-__v -_id");
            return response(
              res,
              HTTP_STATUS.OK,
              "Successfully Registered,Please verify your email within 3 minutes",
              upauthfound
            );
          }
        }
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email: email, address });
        const auth = await Auth.create({
          email: { id: email },
          password: hash,
          user: user._id,
          country: country,
        });
        const sent = await sendVerifyEmail(email, name);

        if (user && auth && sent) {
          const authfound = await Auth.findOne({ "email.id": email })
            .select(
              "-email -password -attempt -locked -unloackTime -__v -_id -role -banned"
            )
            .populate("user", "-__v -_id");
          return response(
            res,
            HTTP_STATUS.OK,
            "Successfully Registered,Please verify your email",
            authfound
          );
        }
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "Registration failed");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }

  async verifyEmail(req, res) {
    const { id } = req.params;
    try {
      const decodedToken = jsonWebtoken.verify(id, process.env.JWT_KEY);
      const userEmail = decodedToken.email;
      const emailvalidation = await Auth.findOneAndUpdate(
        { "email.id": userEmail },
        { $set: { "email.status": true } }
      );
      if (emailvalidation) {
        res.render("emailConfirmed");
      }
    } catch (e) {
      if (e instanceof jsonWebtoken.TokenExpiredError) {
        res.render("failedConfirm");
      } else if (e instanceof jsonWebtoken.JsonWebTokenError) {
        res.render("failedConfirm");
      } else {
        res.render("failedConfirm");
      }
    }
  }

  async getRole(req, res) {
    try {
      const { id } = req.params;
      const user = await Auth.findOne({ "email.id": id }).populate(
        "user",
        "-__v"
      );
      if (!user) {
        return response(res, HTTP_STATUS.NOT_FOUND, "User not found");
      }
      return response(res, HTTP_STATUS.OK, "User role", user.role);
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }
  async getAll(req, res) {
    try {
      const users = await Auth.find({})
        .select("-password -__v")
        .populate("user", "-__v");
      if (users) {
        return response(res, HTTP_STATUS.OK, "All Users", users);
      }
      return response(res, HTTP_STATUS.NOT_FOUND, "No Users Found");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }




  async sendForgotPasswordEmail(req, res) {
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

      const { email } = req.body;
      const token = crypto.randomBytes(20).toString("hex");
      const user_auth = await Auth.findOne({ "email.id": email })
        .select("-password")
        .populate("user", "name");
      if (!user_auth) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Invalid Request");
      }
      const name = user_auth.user.name;
      const validationlink = `${process.env.BASE_URL_REACT}reset-password/${token}/${user_auth._id}`;
      // const validationlink = `http://localhost:5173/reset-password/${token}/${user_auth._id}`;
      const renderedHtml = await ejs.renderFile(
        path.join(__dirname, "../views/forgotPassEmail.ejs"),
        { name, validationlink, port: process.env.PORT }
      );
      const user = await Auth.findOneAndUpdate(
        { "email.id": email },
        {
          $set: {
            resetPasswordToken: token,
            resetPasswordExpires: new Date(Date.now()+120000),
            resetPasswordStatus: true,
          },
        }
      );
      if (user) {
        sendEmail(email, "Reset Password", renderedHtml);
        return response(res, HTTP_STATUS.OK, "Email Sent");
      } else {
        return response(res, HTTP_STATUS.NOT_FOUND, "Invalid Request");
      }
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Invalid Request"
      );
    }
  }

  async checkResetPasswordToken(req, res) {
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
      const { token, id } = req.body;
      const user = await Auth.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
        _id: id,
      });
      if (!user) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Invalid Request");
      }
      return response(res, HTTP_STATUS.OK, "Valid Request");
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  async resetPassword(req, res) {
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
      const {token,id,password} = req.body;

      const user = await Auth.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
        _id: id,
      });
      if (!user) {
        return response(res, HTTP_STATUS.NOT_FOUND, "Invalid Request");
      }
      const user_prev_password = user.password;
      const match = await bcrypt.compare(password, user_prev_password);
      if (match) {
        return response(res, HTTP_STATUS.CONFLICT, "Password cannot be same as previous password");
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const updatedUser = await Auth.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            password: hash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            resetPasswordStatus: false,
          },
        }
      );
      if (updatedUser) {
        return response(res, HTTP_STATUS.OK, "Password Reset Successfull");
      } else {
        return response(res, HTTP_STATUS.NOT_FOUND, "Invalid Request");
      }
    } catch (e) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }



}
module.exports = new Authcontroller();
