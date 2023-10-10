const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
const {isValidUser,isValidAdmin} = require("../middleware/auth");
const {pagelimitValidator} = require("../middleware/Validation");
const {transactionValidator} = require("../middleware/Validation");


routes.post("/checkout",isValidUser,transactionValidator.create,TransactionController.create);
routes.get("/view",isValidUser,TransactionController.getMyTransactions);
routes.get("/all",isValidAdmin,pagelimitValidator.pageLimit,TransactionController.getAllTransactions);

module.exports = routes;