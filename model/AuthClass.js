const mongoose = require("mongoose");
const AuthSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    email: {
        type: {
            id:{type:String} ,
            status: {type: Boolean, default: false},
            _id: false
        },
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        required: false,
        default:'user'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    attempt:{
        type: Number,
        default:0,
        required:false
    },
    locked:{
       type: Boolean,
       default:false
    },
    unloackTime:{
        type:Date,
        default:0
    }
});

const Auth = mongoose.model("Auth", AuthSchema);
module.exports = Auth;