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
    country:{
        type:String,
        required:false
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
    },
    banned:{
        type:Boolean,
        default:false
    },

    resetPasswordToken: {
        type: String,
        required: false,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        required: false,
        default: null
    },

    resetPasswordStatus: {
        type: Boolean,
        required: false,
        default: false
    }
});

const Auth = mongoose.model("Auth", AuthSchema);
module.exports = Auth;