const express = require("express");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const {
    AddOrUpdateRatings,
    deleteRatingsFromBooks,
} = require("../controllers/ReviewControllers");
const route = express();

route.post("/addReview", verifyTokenMiddleware, AddOrUpdateRatings);
route.delete("/deleteReview", verifyTokenMiddleware, deleteRatingsFromBooks);

module.exports = route;
