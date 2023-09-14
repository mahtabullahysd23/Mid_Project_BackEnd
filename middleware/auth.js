const { failure, success } = require("../utility/common");
const jsonWebtoken = require('jsonwebtoken');
const isValidAdmin = ((req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send(failure("Access Restricted"));
        }
        const token = req.headers.authorization.split(" ")[1];
        const valid = jsonWebtoken.verify(token, process.env.JWT_KEY)
        const payload = jsonWebtoken.decode(token);
        console.log();
        if (valid && payload.data.role === 'admin') {
            next();
        }
        else if(payload.data.role != 'admin'){
            return res.status(401).send(failure("Unauthorized Access"));
        }
        else{
            throw new Error();
        }
    }
    catch (e) {
        if(e instanceof jsonWebtoken.TokenExpiredError){
            return res.status(401).send(failure("Please Login Again"));
        }
        else if(e instanceof jsonWebtoken.JsonWebTokenError){
            return res.status(401).send(failure("Access Restricted"));
        }
        return res.status(500).send(failure("Internal server Error")); 
    }
})

const isValidUser = ((req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send(failure("Access Restricted"));
        }
        const token = req.headers.authorization.split(" ")[1];
        const valid = jsonWebtoken.verify(token, process.env.JWT_KEY)
        const payload = jsonWebtoken.decode(token);
        console.log();
        if (valid && payload.data.role === 'user') {
            next();
        }
        else if(payload.data.role != 'user'){
            return res.status(401).send(failure("Unauthorized Access"));
        }
        else{
            throw new Error();
        }
    }
    catch (e) {
        if(e instanceof jsonWebtoken.TokenExpiredError){
            return res.status(401).send(failure("Please Login Again"));
        }
        else if(e instanceof jsonWebtoken.JsonWebTokenError){
            return res.status(401).send(failure("Access Restricted"));
        }
        return res.status(500).send(failure("Internal server Error")); 
    }
})
module.exports = { isValidAdmin , isValidUser };