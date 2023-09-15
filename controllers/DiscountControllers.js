const {  mongoose } = require("mongoose");
const { OK, INTERNAL_SERVER_ERROR } = require("../constants/statusCode");
const DiscountModel = require("../database/models/DiscountModel");
const BookModel = require("../database/models/BookModel");
const { successMessage, errorMessage } = require("../utils/app-errors");

class DiscountControllers {
    async addDiscount(req, res) {
        try {
            // Extract the discount details from the request body
            const {
                name,
                description,
                bookIds = [],
                bookGenres = [],
                bookAuthors = [],
                discountType,
                discountValue,
                activationDate,
                endDate,
            } = req.body;

            


            //check bookIds
            if(bookIds.length > 0){
                bookIds.forEach((bookId) => {
                    //check book ids are in BookModel 
                    const book = BookModel.findById(bookId);
                    if(!book){
                        throw new Error("Book not found");
                    }
            })
            }
         

            // Create a new discount document
            const newDiscount = new DiscountModel({
                name,
                description,
                bookIds,
                bookGenres,
                bookAuthors,
                discountType,
                discountValue,
                activationDate,
                endDate,
            });

            // Save the discount document to the database
            await newDiscount.save();

            return res.status(OK).send(successMessage('Discount added successfully', newDiscount));
        } catch (error) {
            console.error(error);
            return res.status(INTERNAL_SERVER_ERROR).send(errorMessage('Internal server error'));
        }
    }
}

module.exports =new DiscountControllers()

