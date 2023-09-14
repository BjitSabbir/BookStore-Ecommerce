const { successMessage, errorMessage } = require('../utils/app-errors');
const { OK, NOT_FOUND, FORBIDDEN, CREATED } = require('./../constants/statusCode');
const BooksModel = require('../database/models/BooksModel');

class BookControllers{
    async addManyBooks(req, res){
        try {
            if(req.user.role === 1){
                const serverBooks = await BooksModel.find();
                console.log(req.user);
                if(serverBooks.length>0){
                    return res.status(OK).send(successMessage('Books already exist', serverBooks));
                }else{
                    const books = await BooksModel.insertMany(req.body);
                return res.status(CREATED).send(successMessage("Books added successfully", books));
                }
            }else{
                return res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            return res.status(NOT_FOUND).send(errorMessage(error));
        }
        
    }

     getAllBooks(req, res){
        BooksModel.find().then((books) => {
            return res.status(OK).send(successMessage('Books fetched successfully', books));
        }).catch((error) => {
            return res.status(NOT_FOUND).send(errorMessage(error));
        })
    }

}

module.exports = new BookControllers()