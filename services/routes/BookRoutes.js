const express = require('express');
const { addManyBooks, getAllBooks } = require('../controllers/BookControllers');
const verifyTokenMiddleware = require('../middleware/AuthMiddleware');
const route = express();

//add many books
route.post('/addManyBooks',verifyTokenMiddleware,addManyBooks)
route.get('/getAllBooks',getAllBooks)






module.exports = route