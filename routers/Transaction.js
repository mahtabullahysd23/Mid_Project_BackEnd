const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
//const {isValidAdmin} = require("../middleware/auth");
const {isValidUser} = require("../middleware/auth");

routes.post("/checkout",isValidUser,TransactionController.create);
routes.get("/view",isValidUser,TransactionController.getMyTransactions);
//routes.get("/getAllTransactions",isValidAdmin,TransactionController.getAllTransactions);

module.exports = routes;