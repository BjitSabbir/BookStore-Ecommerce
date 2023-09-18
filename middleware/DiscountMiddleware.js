const {
    OK,
    INTERNAL_SERVER_ERROR,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
} = require("../constants/statusCode");

const checkDiscountMiddleware = function (req, res, next) {
    let errorMessages = [];
    const {
        name,
        description,
        bookIds,
        bookGenres,
        bookAuthors,
        discountType,
        discountValue,
        activationDate,
        endDate,
    } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        errorMessages.push("Name is required and must be a non-empty string.");
    }

    if (
        !description ||
        typeof description !== "string" ||
        description.trim().length === 0
    ) {
        errorMessages.push(
            "Description is required and must be a non-empty string."
        );
    }

    if (bookIds && !Array.isArray(bookIds)) {
        errorMessages.push(
            "Book Ids are required and must be a non-empty array."
        );
    }

    if (bookGenres && !Array.isArray(bookGenres)) {
        errorMessages.push(
            "Book Genres are required and must be a non-empty array."
        );
    }

    if (bookAuthors && !Array.isArray(bookAuthors)) {
        errorMessages.push(
            "Book Authors are required and must be a non-empty array."
        );
    }

    if (
        !discountType ||
        typeof discountType !== "string" ||
        discountType.trim().length === 0
    ) {
        errorMessages.push(
            "Discount Type is required and must be a non-empty string."
        );
    }

    if (typeof discountValue !== "number" || isNaN(discountValue)) {
        errorMessages.push("Discount Value is required and must be a number.");
    }

    if (!activationDate || isNaN(Date.parse(activationDate))) {
        errorMessages.push(
            "Activation Date is required and must be a valid Date."
        );
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
        errorMessages.push("End Date is required and must be a valid Date.");
    }

    if (activationDate > endDate) {
        errorMessages.push("Activation Date cannot be greater than End Date.");
    }

    if (errorMessages.length > 0) {
        return res.status(BAD_REQUEST).json({
            errors: errorMessages,
        });
    } else {
        next();
    }
};

module.exports = checkDiscountMiddleware;
