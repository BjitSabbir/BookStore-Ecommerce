const express = require("express");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const {
    AddOrUpdateRatings,
    deleteRatingsFromBooks,
    getReviewByUser,
    getReviewByBookId,
} = require("../controllers/ReviewControllers");
const {
    ReviewsValidator,
    addOrUpdateRatings,
    getReviewByUserCheck,
} = require("../database/validation/inputValidationSchema");
const route = express();

route.post(
    "/addReview",
    ReviewsValidator.addOrUpdateRatings,
    verifyTokenMiddleware,
    AddOrUpdateRatings
);
route.delete(
    "/deleteReview",
    ReviewsValidator.removeRatingReview,
    verifyTokenMiddleware,
    deleteRatingsFromBooks
);
route.get(
    "/getReviewByUser",
    ReviewsValidator.getReviewByUserCheck,
    verifyTokenMiddleware,
    getReviewByUser
);
route.get(
    "/getReviewByBookId",
    ReviewsValidator.getReviewByUserCheck,
    verifyTokenMiddleware,
    getReviewByBookId
);

module.exports = route;
