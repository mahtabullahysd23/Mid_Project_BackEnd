const express = require("express");
const routes = express();
const { reviewValidator } = require("../middleware/Validation");
const {isValidUser} = require("../middleware/auth")
const {isValidAdmin} = require("../middleware/auth")
const ReviewController = require("../controller/ReviewController");

routes.post("/post",isValidUser,reviewValidator.add,ReviewController.add);
routes.delete("/delete/:id",isValidUser,ReviewController.delete);

module.exports = routes;