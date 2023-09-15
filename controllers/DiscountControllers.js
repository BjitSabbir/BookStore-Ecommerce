const {  mongoose } = require("mongoose");
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, FORBIDDEN } = require("../constants/statusCode");
const DiscountModel = require("../database/models/DiscountModel");
const BookModel = require("../database/models/BookModel");
const { successMessage, errorMessage } = require("../utils/app-errors");

class DiscountControllers {
    async createDiscount(req, res) {
        if(req.user.role === 2){
            return res.status(FORBIDDEN).send(errorMessage("User not authorized"));
        }else{
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
    
                if (!name || !description || !activationDate || !endDate || !discountValue) {
                    return res.status(BAD_REQUEST).send(errorMessage('Invalid input data'));
                }
    
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

      // Get a specific discount by ID
      async getDiscount(req, res) {
        try {
            const discountId = req.params.id;
            console.log(discountId);

            const discount = await DiscountModel.findById(discountId);

            if (!discount) {
                return res.status(NOT_FOUND).send(errorMessage('Discount not found'));
            }

            return res.status(OK).send(successMessage('Discount found', discount));
        } catch (error) {
            console.error(error);
            return res.status(INTERNAL_SERVER_ERROR).send(errorMessage('Internal server error'));
        }
    }

     // Update a discount by ID
     async updateDiscount(req, res) {
        try {
            const discountId = req.params.id;

            const updateData = {}; // Create an empty object to store update fields

            // Extract fields from the request body and add them to the updateData object if they exist
            if (req.body.name) updateData.name = req.body.name;
            if (req.body.description) updateData.description = req.body.description;
            if (req.body.bookIds) updateData.bookIds = req.body.bookIds;
            if (req.body.bookGenres) updateData.bookGenres = req.body.bookGenres;
            if (req.body.bookAuthors) updateData.bookAuthors = req.body.bookAuthors;
            if (req.body.discountType) updateData.discountType = req.body.discountType;
            if (req.body.discountValue) updateData.discountValue = req.body.discountValue;
            if (req.body.activationDate) updateData.activationDate = req.body.activationDate;
            if (req.body.endDate) updateData.endDate = req.body.endDate;
            if(req.body.isActivated) updateData.isActivated = req.body.isActivated;

            const serverDiscount = await DiscountModel.findById(discountId);

            if (!serverDiscount) {
                return res.status(NOT_FOUND).send(errorMessage('Discount not found'));
            }

            // Update the discount document with the provided fields
            const updatedDiscount = await DiscountModel.findByIdAndUpdate(discountId, updateData, {
                new: true,
            });

            return res.status(OK).send(successMessage('Discount updated successfully', updatedDiscount));
        } catch (error) {
            console.error(error);
            return res.status(INTERNAL_SERVER_ERROR).send(errorMessage('Internal server error'));
        }
    }

    // Delete a discount by ID
    async deleteDiscount(req, res) {
        try {
            const discountId = req.params.id;

            const deletedDiscount = await DiscountModel.findByIdAndRemove(discountId);

            if (!deletedDiscount) {
                return res.status(NOT_FOUND).send(errorMessage('Discount not found'));
            }

            return res.status(OK).send(successMessage('Discount deleted successfully', deletedDiscount));
        } catch (error) {
            console.error(error);
            return res.status(INTERNAL_SERVER_ERROR).send(errorMessage('Internal server error'));
        }
    }
}


module.exports =new DiscountControllers()

