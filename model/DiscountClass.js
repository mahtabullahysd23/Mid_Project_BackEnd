const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Discount description is required"],
  },
  percentage: {
    type: Number,
    required: [true, "Discount percentage is required"],
    min: 1,
    max: 100,
  },
  eligibleRoles: [
    {
      type: String,
      optional: true,
    },
  ],
  eligibleCountries: [
    {
      type: String,
        optional: true,
    },
  ],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      optional: true,
    },
  ]
});

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
