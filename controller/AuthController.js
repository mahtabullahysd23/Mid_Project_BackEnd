const User = require("../model/UserClass");
const Auth = require("../model/AuthClass");
const sendEmail = require("../utility/sendEmail");
const HTTP_STATUS = require("../constants/statusCodes");
const response = require("../utility/common");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
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
            HTTP_STATUS.BAD_REQUEST,
            "Too Many attempts, Your account is blocked for 24 hours"
          );
        }
        return response(res, HTTP_STATUS.NOT_FOUND, "Invalid Credentials");
      }
      if (user.locked && user.unloackTime > Date.now()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Too Many attempts, Your account is blocked for 24 hours"
        );
      }
      if (!user.email.status) {
        return response(res, HTTP_STATUS.LOCKED, "Please verify your email");
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
        user: user.user,
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
          expiresIn: "5m",
        });
        const validationlink = `http://localhost:${process.env.PORT}/auth/verifyemail/${token}`;

        const renderedHtml = await ejs.renderFile(
          path.join(__dirname, "../views/verifyemail.ejs"),
          { name, validationlink, port: process.env.PORT }
        );

        await sendEmail(email, "Account Verification", renderedHtml);

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

      const { name, email, address, password } = req.body;

      const existEmail = await Auth.findOne({ "email.id": email.id });

      if (existEmail) {
        if (existEmail.email.status === true) {
          return response(res, HTTP_STATUS.BAD_REQUEST, "Email already exists");
        } else {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);

          const updatedAuth = await Auth.findOneAndUpdate(
            { "email.id": email.id },
            { $set: { password: hash } }
          );

          const updateUser = await User.findOneAndUpdate(
            { email: email.id },
            { $set: { name: name, address: address } }
          );

          const sent = await sendVerifyEmail(email.id, name);

          if (updatedAuth && updateUser && sent) {
            const upauthfound = await Auth.findOne({ "email.id": email.id })
              .select("-email -password -attempt -locked -unloackTime -__v")
              .populate("user", "-__v");
            return response(
              res,
              HTTP_STATUS.OK,
              "Successfully Registered,Please verify your email",
              upauthfound
            );
          }
        }
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email: email.id, address });
        const auth = await Auth.create({
          email,
          password: hash,
          user: user._id,
        });
        const sent = await sendVerifyEmail(email.id, name);

        if (user && auth && sent) {
          const authfound = await Auth.findOne({ "email.id": email.id })
            .select("-email -password -attempt -locked -unloackTime -__v")
            .populate("user", "-__v");
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
      if(emailvalidation){
        return response(res, HTTP_STATUS.OK, "Email verified");
      }
    } catch (e) {
        if(e instanceof jsonWebtoken.TokenExpiredError){
            return res.status(401).send(failure("link expired"));
        }
        else if(e instanceof jsonWebtoken.JsonWebTokenError){
            return res.status(401).send(failure("Verification failed"));
        }
        return res.status(500).send(failure("Internal server Error")); 
    }
  }
}

module.exports = new Authcontroller();
