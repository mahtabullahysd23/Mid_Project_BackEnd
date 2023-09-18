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
                    base_price: {
                        type: Number,
                        required: [true, "Base Price is required"]
                    },
                    discount_price: {
                        type: Number,
                        default: 0,
                        required:false
                    },
                    _id:false,
                }
            ],
        }
    },
    {
        timestamps: true
    }
);
const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;


    