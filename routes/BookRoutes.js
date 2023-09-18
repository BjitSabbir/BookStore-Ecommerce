const express = require('express');
const { addManyBooks, getAllBooks ,addOneBook } = require('../controllers/BookControllers');
const verifyTokenMiddleware = require('../middleware/AuthMiddleware');
const { bookValidator } = require('../validation/inputValidationSchema');
const route = express();

//add many books
route.post('/addManyBooks',verifyTokenMiddleware,addManyBooks)
route.post("/add",bookValidator.addOneBook,verifyTokenMiddleware,addOneBook)
route.get('/getAllBooks',getAllBooks)






module.exports = route