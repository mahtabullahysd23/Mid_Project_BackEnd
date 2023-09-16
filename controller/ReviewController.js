const Review = require("../model/ReviewClass");
const Book = require("../model/BookClass");
const Tran = require("../model/TransactionClass");
const response = require("../utility/common");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonWebtoken = require("jsonwebtoken");

class ReviewController {
  async add(req, res) {
    function getuserid(req) {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jsonWebtoken.decode(token);
      return decoded.data.user._id;
    }
    try {
      let newrating = null;
      let newreview = null;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Validation Error",
          errors.array()
        );
      }
      const review = req.body;
      if (review.rating) {
        newrating = review.rating;
      }
      if (review.review) {
        newreview = review.review;
      }
      review.user = getuserid(req);
      const extBook = await Book.findById({ _id: review.book });
      const extpurchaseBook = await Tran.findOne({
        user: review.user,
        books: { $elemMatch: { book: review.book } },
      });
      const extReview = await Review.findOne({
        user: review.user,
        book: review.book,
      });
      if (!extBook) {
        return response(res, HTTP_STATUS.BAD_REQUEST, "Book does not exist");
      }
      if (!extpurchaseBook) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "You have not purchased this book"
        );
      }
      if (extReview) {
        if (
          extReview.rating == review.rating &&
          extReview.review == review.review
        ) {
          return response(
            res,
            HTTP_STATUS.BAD_REQUEST,
            "You can not review same book twice"
          );
        }
        if (newrating == null && newreview == null) {
          const deletereview = await Review.deleteOne({ _id: extReview._id });
          const updatedBook = await Book.updateOne(
            { _id: review.book },
            { $pull: { reviews: extReview._id } }
          );
          if (extReview.rating != null) {
            const totalreviews = await Review.countDocuments({
              book: review.book,
              rating: { $ne: null },
            });
            const currentrating = extBook.rating;
            const newRating =
              (currentrating * (totalreviews + 1) - extReview.rating) /
              totalreviews;
            if (isNaN(newRating)) {
              await Book.updateOne(
                { _id: review.book },
                { $set: { rating: 0 } }
              );
            } else {
              await Book.updateOne(
                { _id: review.book },
                { $set: { rating: newRating } }
              );
            }
          }
          if (deletereview && updatedBook) {
            return response(res, HTTP_STATUS.OK, "Review deleted successfully");
          }
        }
        const updatedReview = await Review.updateOne(
          { user: review.user, book: review.book },
          { $set: { rating: newrating, review: newreview } }
        );
        if (newrating != null) {
          const totalreviews = await Review.countDocuments({
            book: review.book,
            rating: { $ne: null },
          });
          const currentrating = extBook.rating;
          if (extReview.rating == null) {
            const newRating =
              (currentrating * (totalreviews - 1) + review.rating) /
              totalreviews;
            await Book.updateOne(
              { _id: review.book },
              { $set: { rating: newRating } }
            );
          } else {
            const newRating =
              (currentrating * totalreviews +
                review.rating -
                extReview.rating) /
              totalreviews;
            await Book.updateOne(
              { _id: review.book },
              { $set: { rating: newRating } }
            );
          }
        }
        if (newrating == null && extReview.rating != null) {
          const totalreviews = await Review.countDocuments({
            book: review.book,
            rating: { $ne: null },
          });
          const currentrating = extBook.rating;
          const newRating =
            (currentrating * (totalreviews + 1) - extReview.rating) /
            totalreviews;
          if (isNaN(newRating)) {
            await Book.updateOne({ _id: review.book }, { $set: { rating: 0 } });
          } else {
            await Book.updateOne(
              { _id: review.book },
              { $set: { rating: newRating } }
            );
          }
        }
        if (updatedReview) {
          const updated = await Review.findById({ _id: extReview._id });
          return response(
            res,
            HTTP_STATUS.OK,
            "Review updated successfully",
            updated
          );
        }
        return response(res, HTTP_STATUS.BAD_REQUEST, "Review not updated");
      }

      if (newrating == null && newreview == null) {
        return response(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Please provide rating or review"
        );
      }
      const reviewitem = {
        user: review.user,
        book: review.book,
        rating: newrating,
        review: newreview,
      };
      const newReview = new Review(reviewitem);
      const savedReview = await newReview.save();
      const updatedBook = await Book.updateOne(
        { _id: review.book },
        { $push: { reviews: savedReview._id } }
      );
      if (newrating != null) {
        const totalreviews = await Review.countDocuments({
          book: review.book,
          rating: { $ne: null },
        });
        const currentrating = extBook.rating;
        const newRating =
          (currentrating * (totalreviews - 1) + review.rating) / totalreviews;
        await Book.updateOne(
          { _id: review.book },
          { $set: { rating: newRating } }
        );
      }
      if (savedReview && updatedBook) {
        return response(
          res,
          HTTP_STATUS.OK,
          "Review added successfully",
          savedReview
        );
      }
      return response(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Review Not Added",
        savedReview
      );
    } catch (err) {
      return response(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  //     async getAll(req, res) {

  //         try {
  //             const reviews = await Review.find({});
  //             if (reviews) {
  //                 return res.status(200).send(success("successfully Received all reviews", reviews));
  //             }
  //             return res.status(404).send(failure("reviews not found"));

  //         }
  //         catch (e) {
  //             console.log(e);
  //             return res.status(500).send(failure("Internal Server Error", e));
  //         }

  //     }

  //     async getByID(req, res) {
  //         try {
  //             const review = await Review.findById({ _id: req.params.id }).populate('user').populate('book','-rating -reviews -stock');
  //             if (review) {
  //                 return res.status(200).send(success("successfully Received review", review));
  //             }
  //             return res.status(404).send(failure("review not found"));

  //         }
  //         catch (e) {
  //             console.log(e);
  //             return res.status(500).send(failure("Internal Server Error", e));
  //         }

  //     }
}
module.exports = new ReviewController();
