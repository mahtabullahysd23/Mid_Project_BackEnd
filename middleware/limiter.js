const rateLimit =require("express-rate-limit")
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 100,
    message: {
        success:false,
        msg:"Too many login attempts , Try again later",
        error:null
    }
})
module.exports = limiter;
