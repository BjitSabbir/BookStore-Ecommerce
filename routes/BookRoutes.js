const express = require("express");
const {
    addManyBooks,
    getAllBooks,
    addOneBook,
    editBook,
    deleteBook,
} = require("../controllers/BookControllers");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const {
    bookValidator,
    getBookValidation,
} = require("../database/validation/inputValidationSchema");
const route = express();

//add many books
route.post("/addManyBooks", verifyTokenMiddleware, addManyBooks);
route.post("/add", bookValidator.addOneBook, verifyTokenMiddleware, addOneBook);
route.get("/getAllBooks", bookValidator.getBookValidation, getAllBooks);
route.put(
    "/edit/:id",
    bookValidator.updateBook,
    verifyTokenMiddleware,
    editBook
);
route.delete("/delete/:id", verifyTokenMiddleware, deleteBook);

module.exports = route;
