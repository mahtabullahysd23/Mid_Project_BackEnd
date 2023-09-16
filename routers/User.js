const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const {isValidAdmin} = require("../middleware/auth");
const {userValidator} = require("../middleware/Validation");


routes.get("/all",isValidAdmin,UserController.getAllUser);
routes.get("/:id",isValidAdmin,UserController.getUserById);
routes.patch("/update/:id",isValidAdmin,userValidator.update,UserController.updateUser);
routes.delete("/delete/:id",isValidAdmin,UserController.deleteUser);

module.exports = routes;