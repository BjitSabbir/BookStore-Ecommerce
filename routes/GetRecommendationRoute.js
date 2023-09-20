const express = require("express");
const generateRecommendations = require("../controllers/RecommendationControllers");
const route = express.Router();

route.get("/", generateRecommendations)

module.exports = route