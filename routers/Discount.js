const express = require("express");
const routes = express();
const DiscountController = require("../controller/DiscountController");
const {isValidAdmin} = require("../middleware/auth")
const { discountValidator,pagelimitValidator } = require("../middleware/Validation");


routes.post("/add",isValidAdmin,discountValidator.add,DiscountController.add);
routes.patch("/addItem/:id",isValidAdmin,discountValidator.addConstraint,DiscountController.addItem);
routes.patch("/update/:id",isValidAdmin,discountValidator.update,DiscountController.updateDiscount);
routes.delete("/delete/:id",isValidAdmin,DiscountController.deleteDiscount);
routes.get("/all",isValidAdmin,pagelimitValidator.pageLimit,DiscountController.getAll);

module.exports = routes;