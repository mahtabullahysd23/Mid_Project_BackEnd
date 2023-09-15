const express = require("express");
const routes = express();
const { reviewValidator } = require("../middleware/Validation");
const {isValidUser} = require("../middleware/auth")
const {isValidAdmin} = require("../middleware/auth")
const ReviewController = require("../controller/ReviewController");

routes.post("/add",isValidUser,reviewValidator.add,ReviewController.add);
// routes.get("/",ReviewController.getAll);
// routes.get("/:id",ReviewController.getByID);

module.exports = routes;