const express = require('express');
const { addManyBooks, getAllBooks ,addOneBook } = require('../controllers/BookControllers');
const verifyTokenMiddleware = require('../middleware/AuthMiddleware');
const route = express();

//add many books
route.post('/addManyBooks',verifyTokenMiddleware,addManyBooks)
route.post("/add",verifyTokenMiddleware,addOneBook)
route.get('/getAllBooks',getAllBooks)






module.exports = route