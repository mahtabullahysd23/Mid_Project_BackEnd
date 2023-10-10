const express = require("express");
const { bookValidator,filterValiator } = require("../middleware/Validation");
const {isValidAdmin} = require("../middleware/auth")
const routes = express();
const BookController = require("../controller/BookController");

routes.get("/",filterValiator.filter,BookController.getAll);
routes.get("/:id",BookController.getById);
routes.post("/add",bookValidator.add,BookController.create);
routes.patch("/update/:id",bookValidator.update,BookController.update);
routes.delete("/delete/:id",BookController.delete);


module.exports = routes;