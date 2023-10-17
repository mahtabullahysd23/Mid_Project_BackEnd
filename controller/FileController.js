const path = require("path");
const fileTypes = require("../constants/fileType");
const HTTP_STATUS = require("../constants/statusCodes");
const response = require("../utility/common");
const fs = require("fs");

class FileController {
    
    async uploadFile(req, res, next) {
        try {
            if (!fileTypes.includes(req.file_extension)) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "Only .jpg, .png, .jpeg, .txt, .pdf");
            }

            if (!req.file) {
                return response(res, HTTP_STATUS.NOT_FOUND, "Failed to upload file");
            }

            return response(res, HTTP_STATUS.OK, "Successfully uploaded file", req.file);
        } catch (error) {
            console.log(error);
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async getFile(req, res, next) {
        try {
            const { filepath } = req.params;
            const exists = fs.existsSync(path.join(__dirname, "..", "Server", filepath));
            if (!exists) {
                return response(res, HTTP_STATUS.NOT_FOUND, "File not found");
            }
            return res.status(200).sendFile(path.join(__dirname, "..", "Server", filepath));
        } catch (error) {
            console.log(error);
            return response(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}

module.exports = new FileController();