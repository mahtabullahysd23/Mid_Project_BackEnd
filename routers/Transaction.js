const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
const {isValidUser,isValidAdmin} = require("../middleware/auth");

routes.post("/checkout",isValidUser,TransactionController.create);
routes.get("/view",isValidUser,TransactionController.getMyTransactions);
routes.get("/all",isValidAdmin,TransactionController.getAllTransactions);

module.exports = routes;