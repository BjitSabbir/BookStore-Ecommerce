const express = require("express");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const {
    AddOrUpdateRatings,
    deleteRatingsFromBooks,
    getReviewByUser,
    
    getReviewByBookId,
} = require("../controllers/ReviewControllers");
const route = express();

route.post("/addReview", verifyTokenMiddleware, AddOrUpdateRatings);
route.delete("/deleteReview", verifyTokenMiddleware, deleteRatingsFromBooks);
route.get("/getReviewByUser", verifyTokenMiddleware, getReviewByUser);
route.get("/getReviewByBookId", getReviewByBookId);

module.exports = route;
