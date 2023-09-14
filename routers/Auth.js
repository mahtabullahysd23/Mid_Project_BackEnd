const express = require("express");
const routes = express();
const AuthController = require("../controller/AuthController");
const limiter = require("../middleware/limiter");
const authvalidator = require("../middleware/Validation");

routes.post("/signup",authvalidator.signUp,AuthController.signUp);
routes.post("/login",limiter,authvalidator.login,AuthController.login);
routes.post("/verifyemail/:id",AuthController.verifyEmail);
module.exports = routes;