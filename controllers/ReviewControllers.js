const ReviewModel = require("../database/models/ReviewModel");
const UserModel = require("../database/models/UserModel");
const BookModel = require("../database/models/BookModel");
const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
    INTERNAL_SERVER_ERROR,
} = require("./../constants/statusCode");

class ReviwControllers {
    async AddOrUpdateRatings(req, res) {
        try {
            if (req.user.role === 1) {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("You are logged in as admin"));
            }

            const user = await UserModel.findById(req.user.userId);

            if (!user) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("User not found"));
            }

            const book = await BookModel.findById(req.body.bookId);

            if (!book) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Book not found"));
            }

            // Check if the user has an existing review for the book
            const existingReview = await ReviewModel.findOne({
                userId: req.user.userId,
                bookId: req.body.bookId,
            });

            if (existingReview) {
                // If an existing review is found, update it
                existingReview.rating = req.body.rating;
                existingReview.comment = req.body.comment;
                await existingReview.save();
            } else {
                // If no existing review is found, create a new one
                const review = await ReviewModel.create({
                    userId: req.user.userId,
                    bookId: req.body.bookId,
                    rating: req.body.rating,
                    comment: req.body.comment,
                });
                book.reviews.push(review._id);
                user.reviews.push(review._id);
            }

            // Calculate the average rating for the book
            const reviews = await ReviewModel.find({ bookId: req.body.bookId });
            const totalRatings = reviews.reduce(
                (sum, review) => sum + review.rating,
                0
            );
            const averageRating = totalRatings / reviews.length;
            book.rating = averageRating;
            await book.save();
            await user.save();

            return res.status(OK).send(
                successMessage(
                    "Review updated successfully",
                    await book.populate({
                        path: "reviews",
                    })
                )
            );
        } catch (error) {
            console.error(error);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(errorMessage("Internal server error"));
        }
    }

    async deleteRatingsFromBooks(req, res) {
        try {
            if (req.user.role === 1) {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("You are logged in as admin"));
            }

            const user = await UserModel.findById(req.user.userId);

            if (!user) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("User not found"));
            }

            const book = await BookModel.findById(req.body.bookId);

            if (!book) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Book not found"));
            }

            // Check if the user has an existing review for the book
            const existingReview = await ReviewModel.findOne({
                userId: req.user.userId,
                bookId: req.body.bookId,
            });

            if (existingReview) {
                // If an existing review is found, delete it
                await ReviewModel.deleteOne({ _id: existingReview._id });

                // Remove the review ID from the book and user's reviews arrays
                book.reviews.pull(existingReview._id);
                user.reviews.pull(existingReview._id);

                // Recalculate the average rating for the book
                const reviews = await ReviewModel.find({
                    bookId: req.body.bookId,
                });
                const totalRatings = reviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                );
                const averageRating =
                    reviews.length > 0 ? totalRatings / reviews.length : 0;
                book.rating = averageRating;
                await book.save();
                await user.save();

                return res
                    .status(OK)
                    .send(successMessage("Review deleted successfully"));
            } else {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Review not found"));
            }
        } catch (error) {
            console.error(error);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(errorMessage("Internal server error"));
        }
    }

    async getReviewByUser(req, res) {
        try {
            const userId = req.user.userId;
            const bookId = req.query.bookId;


            // Find all reviews by the user
            let userReviews;
            if (bookId) {
                userReviews = await ReviewModel.find({ userId: userId, bookId: bookId })
                    .populate('bookId', 'title authors isbn price discount_percentage');

            } else {
                userReviews = await ReviewModel.find({ userId: userId })
            }


            if (!userReviews) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("No reviews found for this user"));
            }

            return res.status(OK).send(
                successMessage(
                    "Reviews fetched successfully for the user",
                    userReviews
                )
            );
        } catch (error) {
            console.error(error);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(errorMessage("Internal server error"));
        }
    }
    async getReviewByBookId(req, res) {
        try {
            const bookId = req.query.bookId;

            // Find all reviews for the specified book and populate the associated user and book details
            const bookReviews = await ReviewModel.find({ bookId: bookId })
                .populate('userId', 'username email') // Replace with the fields you want to populate for the user
                .populate('bookId', 'title authors isbn price discount_percentage'); // Replace with the fields you want to populate for the book

            if (!bookReviews) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage('No reviews found for this book'));
            }

            return res.status(OK).send(
                successMessage(
                    'Reviews fetched successfully for the book',
                    bookReviews
                )
            );
        } catch (error) {
            console.error(error);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(errorMessage('Internal server error'));
        }
    }
}

module.exports = new ReviwControllers();
