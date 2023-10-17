const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const {isValidAdmin} = require("../middleware/auth");
const {isValidUser} = require("../middleware/auth");
const {userValidator,pagelimitValidator} = require("../middleware/Validation");



routes.get("/all",isValidAdmin,pagelimitValidator.pageLimit,UserController.getAllUser);
routes.get("/admin/:id",isValidAdmin,UserController.getUserById);
routes.patch("/update/:id",isValidAdmin,userValidator.update,UserController.updateUser);
routes.delete("/delete/:id",isValidAdmin,UserController.deleteUser);
routes.get("/my-profile",isValidUser,UserController.getMyProfile);
routes.post("/update-profile",isValidUser,userValidator.updateProfile,UserController.updateProfile);





module.exports = routes;