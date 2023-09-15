const express = require("express");
//const { productValidator } = require("../middleware/validation");
//const {isValidAdmin} = require("../middleware/auth")
const routes = express();
const BookController = require("../controller/BookController");

routes.get("/",BookController.getAll);
// routes.get("/:id",ProductController.getOne);
// routes.post("/create",isValidAdmin,productValidator.create,ProductController.create);
// routes.patch("/update",isValidAdmin,productValidator.update,ProductController.update);
// routes.delete("/delete/:id",isValidAdmin,ProductController.delete);
module.exports = routes;