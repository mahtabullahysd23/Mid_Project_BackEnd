const Review = require('../model/ReviewClass');
const User = require('../model/UserClass');
const Book = require('../model/BookClass');
const response = require('../utility/common');
const { validationResult } = require("express-validator");
const HTTP_STATUS = require('../constants/statusCodes');
const jsonWebtoken = require('jsonwebtoken');

class ReviewController {
    async add(req, res) {
        function getuserid(req) {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jsonWebtoken.decode(token);
            return decoded.data.user._id;
        }
        try{
            let newrating = null;
            let newreview =null;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, HTTP_STATUS.BAD_REQUEST, "Validation Error", errors.array());
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
        const extReview = await Review.findOne({ user: review.user, book: review.book });
        if (!extBook) { 
            return response(res, HTTP_STATUS.BAD_REQUEST, "Book does not exist");
        }
        if (extReview) {
            if (extReview.rating == review.rating && extReview.review == review.review) {
                return response(res, HTTP_STATUS.BAD_REQUEST, "You can not review same book twice");
            }
            const updatedReview = await Review.updateOne({ user: review.user, book: review.book }, { $set: { rating: newrating, review: newreview } });
            const extBook1 = await Book.findById({ _id: review.book });
            const totalreviews = extBook1.reviews.length;
            const currentrating = extBook1.rating;
            const newRating = ((currentrating * totalreviews) + review.rating - extReview.rating) / totalreviews;
            const updatedRating = await Book.updateOne({ _id: review.book }, { $set: { rating: newRating } });
            if (updatedReview && updatedRating) {
                const updated = await Review.findById({ _id: extReview._id });
                return response(res, HTTP_STATUS.OK, "Review updated successfully",updated);
            }
            return response(res, HTTP_STATUS.BAD_REQUEST, "Review not updated");
        }
        const reviewitem = {
            user: review.user,
            book: review.book,
            rating: newrating,
            review: newreview
        }
        const newReview = new Review(reviewitem);
        const savedReview = await newReview.save();
        const extBook1 = await Book.findById({ _id: review.book });
        const updatedBook = await Book.updateOne({ _id: review.book }, { $push: { reviews: savedReview._id } });
        const totalreviews = extBook1.reviews.length;
        const currentrating = extBook1.rating;
        const newRating = ((currentrating * totalreviews) + review.rating) / (totalreviews+1);
        const updatedRating = await Book.updateOne({ _id: review.book }, { $set: { rating: newRating } });
        if (savedReview && updatedBook && updatedRating) {
            return response(res, HTTP_STATUS.OK, "Review added successfully", savedReview);
        }
        return response(res, HTTP_STATUS.BAD_REQUEST, "Review Not Added", savedReview);
        }
        catch(err){
            return response(res, HTTP_STATUS.BAD_REQUEST, "Server Error");
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