const express = require("express");
const { bookValidator,filterValiator } = require("../middleware/validation");
const {isValidAdmin} = require("../middleware/auth")
const routes = express();
const BookController = require("../controller/BookController");

routes.get("/",filterValiator.filter,BookController.getAll);
routes.get("/:id",BookController.getById);
routes.post("/add",isValidAdmin,bookValidator.add,BookController.create);
routes.patch("/update/:id",isValidAdmin,bookValidator.update,BookController.update);
routes.delete("/delete/:id",isValidAdmin,BookController.delete);


module.exports = routes;