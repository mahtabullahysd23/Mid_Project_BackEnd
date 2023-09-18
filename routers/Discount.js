const express = require("express");
const routes = express();
const DiscountController = require("../controller/DiscountController");
const {isValidAdmin} = require("../middleware/auth")


routes.post("/add",isValidAdmin,DiscountController.add);
routes.patch("/addItem/:id",isValidAdmin,DiscountController.addItem);
routes.patch("/update/:id",isValidAdmin,DiscountController.updateDiscount);
routes.delete("/delete/:id",isValidAdmin,DiscountController.deleteDiscount);
routes.get("/all",isValidAdmin,DiscountController.getAll);

module.exports = routes;