const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },  
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    address: {  
        type: String,
        required: [true, "Address is required"]
    },
    imageUrl: {
        type: String,
        required:false,
        default:"myimg.png"
    },
    city: {
        type: String,
        required:false,
        default:""
    },
    country: {
        type: String,
        required: false,
        default:""
    },
    number: {
        type: Number,
        required: false,
        default:""
    }
    }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;