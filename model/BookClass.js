const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  description:{
    type: String,
    required: [true, "Description is required"],
  },
  stock: {
    type: Number,
    required: [true, "Stock is required"],
  },
  author: {
    type: String,
    required: [true, "Author is required"],
  },
  genre: {
    type: String, 
    required: [true, "Genre is required"],
  },
  publisher: {
    type: String,
    required: [true, "Publisher is required"],
  },
  isbn: {
    type: String,
    required: [true, "ISBN is required"],
    unique: true,
  },
  pages: {
    type: Number,
    required: [true, "Page Number is required"],
  },
  language: {
    type: String,
    required: [true, "Language is required"],
  },

  imageUrl: {
    type: String,
    required: true,
  },

  tag: {
    type: String,
    required: [true, "Tag is required"],
  },

  rating: {
    type: Number,
    required: false,
    default: 0,
  },
  reviews: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    required: false,
    _id: false,
  }
});

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
