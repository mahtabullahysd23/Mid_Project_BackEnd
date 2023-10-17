const express = require("express");
const routes = express();
const upload = require("../config/file");
const FileController = require("../controller/FileController");
const {isValidUser} = require("../middleware/auth");

routes.post("/upload-image",upload.single("file_to_upload"),isValidUser,FileController.uploadFile);
routes.get("/get/:filepath",FileController.getFile);

module.exports = routes;