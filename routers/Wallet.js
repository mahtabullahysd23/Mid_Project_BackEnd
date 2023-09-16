const express = require("express");
const routes = express();
const WalletController = require("../controller/WalletController");
const {isValidUser} = require("../middleware/auth")


routes.post("/add",isValidUser,WalletController.add);
routes.get("/mywallet",isValidUser,WalletController.getMyWallet);

module.exports = routes;