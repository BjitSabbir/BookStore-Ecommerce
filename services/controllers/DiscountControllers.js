const { mongoose } = require("mongoose");
const {
    OK,
    INTERNAL_SERVER_ERROR,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
} = require("../constants/statusCode");
const DiscountModel = require("../database/models/DiscountModel");
const BookModel = require("../database/models/BookModel");
const { successMessage, errorMessage } = require("../utils/app-errors");

class DiscountControllers {
    async createDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
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

                if (
                    !name ||
                    !description ||
                    !activationDate ||
                    !endDate ||
                    !discountValue
                ) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid input data"));
                }

                //check bookIds
                if (bookIds.length > 0) {
                    bookIds.forEach((bookId) => {
                        //check book ids are in BookModel
                        const book = BookModel.findById(bookId);
                        if (!book) {
                            throw new Error("Book not found");
                        }
                    });
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

                return res
                    .status(OK)
                    .send(
                        successMessage(
                            "Discount added successfully",
                            newDiscount
                        )
                    );
            } catch (error) {
                console.error(error);
                return res
                    .status(INTERNAL_SERVER_ERROR)
                    .send(errorMessage("Internal server error"));
            }
        }
    }

    // Get a specific discount by ID
    async getDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const discountId = req.params.id;
                console.log(discountId);

                const discount = await DiscountModel.findById(discountId);

                if (!discount) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Discount not found"));
                }

                return res
                    .status(OK)
                    .send(successMessage("Discount found", discount));
            } catch (error) {
                console.error(error);
                return res
                    .status(INTERNAL_SERVER_ERROR)
                    .send(errorMessage("Internal server error"));
            }
        }
    }

    // Update a discount by ID
    async updateDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const discountId = req.params.id;

                const updateData = req.body; // Use the entire req.body as update data

                const serverDiscount = await DiscountModel.findById(discountId);

                if (!serverDiscount) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Discount not found"));
                }

                // Update the discount document with the provided fields
                Object.assign(serverDiscount, updateData);

                // Save the updated discount document
                const updatedDiscount = await serverDiscount.save();

                return res
                    .status(OK)
                    .send(
                        successMessage(
                            "Discount updated successfully",
                            updatedDiscount
                        )
                    );
            } catch (error) {
                console.error(error);
                return res
                    .status(INTERNAL_SERVER_ERROR)
                    .send(errorMessage("Internal server error"));
            }
        }
    }

    // Delete a discount by ID
    async deleteDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const discountId = req.params.id;
                const discount = await DiscountModel.findById(discountId);
                if (discount) {
                    discount.allBookIds.forEach(async (bookId) => {
                        const book = await BookModel.findById(bookId);
                        if (book) {
                            await book.removeDiscount({
                                discountId: discount._id,
                            });
                        }
                    });
                    await DiscountModel.deleteOne({ _id: discountId });
                    return res
                        .status(OK)
                        .send(successMessage("Discount deleted successfully"));
                } else {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Discount not found"));
                }
            } catch (error) {
                console.error(error);
                return res
                    .status(INTERNAL_SERVER_ERROR)
                    .send(errorMessage("Internal server error"));
            }
        }
    }

    async disableDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const discountId = req.params.id;
                const discount = await DiscountModel.findById(discountId);
                if (discount) {
                    await discount.disableDiscountSchema({
                        isDisabled: !discount.isDisabled,
                    });
                    return res
                        .status(OK)
                        .send(
                            successMessage(
                                "Discount disabled successfully",
                                discount
                            )
                        );
                } else {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Discount not found"));
                }
            } catch (error) {
                console.error(error);
                return res
                    .status(INTERNAL_SERVER_ERROR)
                    .send(errorMessage("Internal server error"));
            }
        }
    }
}

module.exports = new DiscountControllers();
