const mongoose = require('mongoose');
const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            unique: true    
        },
        books: {
            type: [
                {
                    book: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: [true, "Book Id is required"],
                        ref: "Book"
                    },
                    quantity: {
                        type: Number,
                        required: [true, "Quantity is required"]
                    },
                    _id:false,
                }
            ],
        },
        total: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);
const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;


    