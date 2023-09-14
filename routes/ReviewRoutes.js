const express = require('express');
const verifyTokenMiddleware = require('../middleware/AuthMiddleware');
const { addRatingsToBooks } = require('../controllers/ReviewControllers');
const route = express();

route.post('/addReview',verifyTokenMiddleware,addRatingsToBooks)

module.exports = route

