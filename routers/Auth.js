const express = require("express");
const routes = express();
const AuthController = require("../controller/AuthController");
const limiter = require("../middleware/limiter");
const {authvalidator} = require("../middleware/Validation");

routes.post("/signup",authvalidator.signUp,AuthController.signUp);
routes.post("/login",limiter,authvalidator.login,AuthController.login);
routes.get("/verifyemail/:id",AuthController.verifyEmail);
routes.get("/role/:id",AuthController.getRole);
routes.get("/all",AuthController.getAll);
routes.post("/forgot-password",authvalidator.send,AuthController.sendForgotPasswordEmail);
routes.post("/check-token",authvalidator.checkToken,AuthController.checkResetPasswordToken);
routes.post("/reset-password",authvalidator.resetPassword,AuthController.resetPassword);
module.exports = routes;