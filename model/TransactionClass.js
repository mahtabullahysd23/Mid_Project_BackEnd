const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    cart:{
        type: Object,
        required: [true, "Cart is required"]
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
        required: false
    },
    status: {
        type: String,
        default: "Pending"
    }
}, {
    timestamps: true
}
)
const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;