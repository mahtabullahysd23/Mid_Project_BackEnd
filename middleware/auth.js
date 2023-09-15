const response = require('../utility/common');
const jsonWebtoken = require('jsonwebtoken');
const isValidAdmin = ((req, res, next) => {
    try {
        if (!req.headers.authorization) {
           return response(res, 401, "Access Restricted");
        }
        const token = req.headers.authorization.split(" ")[1];
        const valid = jsonWebtoken.verify(token, process.env.JWT_KEY)
        const payload = jsonWebtoken.decode(token);
        if (valid && payload.data.role === 'admin') {
            next();
        }
        else if(payload.data.role != 'admin'){
            return response(res, 401, "Unauthorized Access");
        }
        else{
            throw new Error();
        }
    }
    catch (e) {
        if(e instanceof jsonWebtoken.TokenExpiredError){

            return response(res, 401, "Please Login Again");
        }
        else if(e instanceof jsonWebtoken.JsonWebTokenError){
   
            return response(res, 401, "Access Restricted");
        }

        return response(res, 500, "Internal server Error");
    }
})

const isValidUser = ((req, res, next) => {
    try {
        if (!req.headers.authorization) {

            return response(res, 401, "Access Restricted");
        }
        const token = req.headers.authorization.split(" ")[1];
        const valid = jsonWebtoken.verify(token, process.env.JWT_KEY)
        const payload = jsonWebtoken.decode(token);
        console.log();
        if (valid && payload.data.role === 'user') {
            next();
        }
        else if(payload.data.role != 'user'){

            return response(res, 401, "Unauthorized Access");
        }
        else{
            throw new Error();
        }
    }
    catch (e) {
        if(e instanceof jsonWebtoken.TokenExpiredError){

            return response(res, 401, "Please Login Again");
        }
        else if(e instanceof jsonWebtoken.JsonWebTokenError){

            return response(res, 401, "Access Restricted");
        }

        return response(res, 500, "Internal server Error");
    }
})
module.exports = { isValidAdmin , isValidUser };