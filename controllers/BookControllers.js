const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
} = require("./../constants/statusCode");
const BookModel = require("../database/models/BookModel");
const { validationResult } = require("express-validator");


class BookControllers {
    async addOneBook(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        
        try {
            if (req.user.role === 1) {
                const book = await BookModel.create(req.body);
                return res
                    .status(CREATED)
                    .send(successMessage("Book added successfully", book));
            } else {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("User not authorized"));
            }
        } catch (error) {
            return res.status(NOT_FOUND).send(errorMessage(error));
        }
    }
    async addManyBooks(req, res) {
        try {
            if (req.user.role === 1) {
                const serverBooks = await BookModel.find();
                console.log(req.user);
                if (serverBooks.length > 0) {
                    return res
                        .status(OK)
                        .send(
                            successMessage("Books already exist", serverBooks)
                        );
                } else {
                    const books = await BookModel.insertMany(req.body);
                    return res
                        .status(CREATED)
                        .send(
                            successMessage("Books added successfully", books)
                        );
                }
            } else {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("User not authorized"));
            }
        } catch (error) {
            return res.status(NOT_FOUND).send(errorMessage(error));
        }
    }

    async  getAllBooks(req, res) {
        try {
            // Parse query parameters
            const { page = 1, limit = 10, search, discounted } = req.query;
    
            // Convert page and limit to integers
            const parsedPage = parseInt(page);
            const parsedLimit = parseInt(limit);
    
            // Validate page and limit values
            if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage < 1 || parsedLimit < 1 || parsedLimit > 50) {
                return res.status(400).json({ error: 'Invalid page or limit values' });
            }
    
            // Build filter conditions based on query parameters
            const filter = {};
            if (search) {
                filter.title = { $regex: new RegExp(search, 'i') }; // Case-insensitive search
            }
            if (discounted === 'true') {
                filter.discount_percentage = { $gt: 0 }; // Filter discounted books
            }
    
            // Calculate skip for pagination
            const skip = (parsedPage - 1) * parsedLimit;
    
            // Find books based on filters and pagination
            const books = await BookModel.find(filter)
                .skip(skip)
                .limit(parsedLimit);
    
            const booksWithDiscountedPrice = books.map((book) => {
                if (book.discount_percentage > 0) {
                    const discountedPrice =
                        book.price - book.price * (book.discount_percentage / 100);
                    return {
                        ...book.toObject(),
                        discountedPrice,
                    };
                } else {
                    return book.toObject();
                }
            });
    
            // Count total matching books for pagination
            const totalBooks = await BookModel.countDocuments(filter);
    
            return res.status(200).json({
                message: 'Books fetched successfully',
                books: booksWithDiscountedPrice,
                page: parsedPage,
                totalPages: Math.ceil(totalBooks / parsedLimit),
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    

    
}

module.exports = new BookControllers();
