const express = require('express');
const verifyTokenMiddleware = require('../middleware/AuthMiddleware');
const { addRatingsToBooks, deleteRatingsFromBooks } = require('../controllers/ReviewControllers');
const route = express();

route.post('/addReview',verifyTokenMiddleware,addRatingsToBooks)
route.delete('/deleteReview',verifyTokenMiddleware,deleteRatingsFromBooks)

module.exports = route

