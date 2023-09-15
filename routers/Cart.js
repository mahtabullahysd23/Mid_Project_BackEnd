const express = require("express");
const routes = express();
const { cartValidator } = require("../middleware/Validation");
const {isValidUser} = require("../middleware/auth")
const CartController = require("../controller/CartController");

routes.post("/add",isValidUser,cartValidator.add,CartController.add);
routes.patch("/remove",isValidUser,cartValidator.add,CartController.remove);
routes.get("/view",isValidUser,CartController.getMyCart);

module.exports = routes;