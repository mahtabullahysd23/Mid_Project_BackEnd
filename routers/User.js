const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const {isValidAdmin} = require("../middleware/auth")


routes.get("/getAlluser",isValidAdmin,UserController.getAlluser);

module.exports = routes;