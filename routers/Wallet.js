const express = require("express");
const routes = express();
const WalletController = require("../controller/WalletController");
const {isValidUser } = require("../middleware/auth");
const { balanceValidator } = require("../middleware/validation");


routes.post("/add",isValidUser,balanceValidator.add,WalletController.add);
routes.get("/mywallet",isValidUser,WalletController.getMyWallet);

module.exports = routes;