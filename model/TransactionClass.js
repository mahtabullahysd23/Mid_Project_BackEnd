const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    cart: {
      type: Object,
      required: [true, "Cart is required"],
    },
    books: {
      type: [
        {
          book: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Book Id is required"],
            ref: "Book",
          },
          quantity: {
            type: Number,
            required: [true, "Quantity is required"],
          },
          price: {
            type: Number,
            required: [true, "Price is required"],
          },
          _id: false,
        },
      ],
    },
    total: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      default: "Placed",
    },
    streetAddress: {
      type: String,
      required: [true, "Street Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    zipCode: {
      type: String,
      required: [true, "Zip Code is required"],
    }
  },
  {
    timestamps: true,
  }
);
const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
