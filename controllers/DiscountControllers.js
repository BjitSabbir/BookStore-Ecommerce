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
const { validationResult } = require("express-validator");

class DiscountControllers {
    async createDiscount(req, res) {
        console.log("I was called", req.body);
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const error = validationResult(req).array();
                if (error.length > 0) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage(error[0].msg));
                }
                // Extract the discount details from the request body
                const {
                    name,
                    description,
                    bookIds = [],
                    bookGenres = [],
                    bookAuthors = [],
                    image,
                    discountValue,
                    activationDate,
                    endDate,
                } = req.body;

                if (bookIds.length > 0) {
                    const bookIdsInDatabase = await BookModel.find({
                        _id: { $in: bookIds },
                    });

                    if (bookIdsInDatabase.length !== bookIds.length) {
                        return res
                            .status(BAD_REQUEST)
                            .send(errorMessage("Invalid bookIds"));
                    }
                }

                if (discountValue < 0 || discountValue > 80) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid discount value"));
                }

                // Create a new discount document
                const newDiscount = new DiscountModel({
                    name,
                    description,
                    bookIds,
                    bookGenres,
                    bookAuthors,
                    image,
                    discountValue,
                    activationDate,
                    endDate,
                });

                // Save the discount document to the database
                const updatedDiscount = await newDiscount.save();

                return res
                    .status(OK)
                    .send(
                        successMessage(
                            "Discount added successfully",
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

    // Get a specific discount by ID
    async getDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const discountId = req.params.id;

                //check if discountId is a mongoose.Types.ObjectId
                if (!mongoose.Types.ObjectId.isValid(discountId)) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid discountId"));
                }

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
    async getAllDiscount(req, res) {
        try {
            const discounts = await DiscountModel.find().limit(10);
            return res
                .status(OK)
                .send(successMessage("Discount found", discounts));
        } catch (error) {
            console.error(error);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(errorMessage("Internal server error"));
        }
    }

    async updateDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        }

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage(errors.array()[0].msg));
            }

            const discountId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(discountId)) {
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Invalid discountId"));
            }

            const {
                name,
                description,
                bookIds = [],
                bookGenres = [],
                bookAuthors = [],
                image,
                discountValue,
                activationDate,
                endDate,
            } = req.body;

            const bookIdsInDatabase = await BookModel.find({
                _id: { $in: bookIds },
            });

            if (
                bookIds.length > 0 &&
                bookIdsInDatabase.length !== bookIds.length
            ) {
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Invalid bookIds"));
            }

            const updateData = {
                name,
                description,
                bookIds,
                bookGenres,
                image,
                bookAuthors,
                discountValue,
                activationDate,
                endDate,
            };

            const serverDiscount = await DiscountModel.findById(discountId);

            if (!serverDiscount) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Discount not found"));
            }

            Object.assign(serverDiscount, updateData);

            const updatedDiscount = await serverDiscount.save();

            // Remove discount from books
            await Promise.all(
                updatedDiscount.allBookIds.map(async (bookId) => {
                    const book = await BookModel.findById(bookId);
                    if (book) {
                        await book.removeDiscount({ discountId: discountId });
                    }
                })
            );

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

    // Delete a discount by ID
    async deleteDiscount(req, res) {
        if (req.user.role === 2) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        } else {
            try {
                const discountId = req.params.id;

                //check if discountId is a mongoose.Types.ObjectId
                if (!mongoose.Types.ObjectId.isValid(discountId)) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid discountId"));
                }
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

                //check if discountId is a mongoose.Types.ObjectId
                if (!mongoose.Types.ObjectId.isValid(discountId)) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid discountId"));
                }
                const discount = await DiscountModel.findById(discountId);
                if (discount) {
                    await discount.disableDiscountSchema({
                        isDisabled: !discount.isDisabled,
                    });
                    discount.allBookIds.forEach(async (bookId) => {
                        const book = await BookModel.findById(bookId);
                        if (book) {
                            await book.removeDiscount({
                                discountId: discount._id,
                            });
                        }
                    });

                    return res.status(OK).send(
                        successMessage("Discount disabled successfully", {
                            isDisabled: discount.isDisabled,
                        })
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
