const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: [true, "Book is required"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"]
    },
    review: {
        type: String,
        required: [true, "Review is required"]
    }
}, {
    timestamps: true
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;