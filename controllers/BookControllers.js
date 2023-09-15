const { successMessage, errorMessage } = require('../utils/app-errors');
const { OK, NOT_FOUND, FORBIDDEN, CREATED } = require('./../constants/statusCode');
const BookModel = require('../database/models/BookModel');

class BookControllers{
    async addManyBooks(req, res){
        try {
            if(req.user.role === 1){
                const serverBooks = await BookModel.find();
                console.log(req.user);
                if(serverBooks.length>0){
                    return res.status(OK).send(successMessage('Books already exist', serverBooks));
                }else{
                    const books = await BookModel.insertMany(req.body);
                return res.status(CREATED).send(successMessage("Books added successfully", books));
                }
            }else{
                return res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            return res.status(NOT_FOUND).send(errorMessage(error));
        }
        
    }


    async getAllBooks(req, res) {
            BookModel.find()
                .then((books) => {
                    const booksWithDiscountedPrice = books.map((book) => {
                     if(book.discount_percentage > 0){
                        const discountedPrice = book.price - (book.price * (book.discount_percentage / 100));
                        return {
                            ...book.toObject(),
                            discountedPrice
                        };
                     }else{
                        return book.toObject();
                     }
                    });
        
                    return res.status(OK).send(successMessage('Books fetched successfully', booksWithDiscountedPrice));
                })
                .catch((error) => {
                    return res.status(NOT_FOUND).send(errorMessage(error));
                });
        }
        

}

module.exports = new BookControllers()