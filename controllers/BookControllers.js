const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
} = require("./../constants/statusCode");
const BookModel = require("../database/models/BookModel");
const CartModel = require("../database/models/CartModel");
const ReviewModel = require("../database/models/ReviewModel");

const { validationResult } = require("express-validator");
const { mongoose } = require("mongoose");

class BookControllers {
    async getAllBooks(req, res) {
        try {
            const error = validationResult(req).array();
            if (error.length > 0) {
                return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
            }

            const {
                page = 1,
                limit = 10,
                search,
                discounted,
                sortType,
                sortKey,
                author,
                region,
            } = req.query;
            const parsedPage = parseInt(page);
            const parsedLimit = parseInt(limit);

            if (
                isNaN(parsedPage) ||
                isNaN(parsedLimit) ||
                parsedPage < 1 ||
                parsedLimit < 1 ||
                parsedLimit > 50
            ) {
                return res
                    .status(400)
                    .json({ error: "Invalid page or limit values" });
            }

            const filter = {};

            // Case-insensitive search on multiple fields
            if (search) {
                filter.$or = [
                    { title: { $regex: new RegExp(search, "i") } },
                    { authors: { $in: [new RegExp(search, "i")] } },
                    { description: { $regex: new RegExp(search, "i") } },
                    { genre: { $regex: new RegExp(search, "i") } },
                ];
            }

            // Filter discounted books
            if (discounted === "true") {
                filter.discount_percentage = { $gt: 0 };
            }

            // Filter by author
            if (author) {
                filter.authors = { $in: [new RegExp(author, "i")] };
            }

            // Filter by region
            if (region) {
                filter.book_Active_regions = { $in: [new RegExp(region, "i")] };
            }

            const skip = (parsedPage - 1) * parsedLimit;

            const sort = {};
            if (sortKey && sortType) {
                sort[sortKey] = sortType === "asc" ? 1 : -1;
            }

            let books = await BookModel.find(filter)
                .skip(skip)
                .limit(parsedLimit)
                .sort(sort);

            const booksWithDiscountedPrice = books.map((book) => {
                if (book.discount_percentage > 0) {
                    const discountedPrice =
                        book.price -
                        book.price * (book.discount_percentage / 100);
                    return {
                        ...book.toObject(),
                        discountedPrice,
                    };
                } else {
                    return book.toObject();
                }
            });

            const totalBooks = await BookModel.countDocuments(filter);

            return res.status(OK).json({
                message: "Books fetched successfully",
                books: booksWithDiscountedPrice,
                page: parsedPage,
                totalPages: Math.ceil(totalBooks / parsedLimit),
            });
        } catch (error) {
            return res
                .status(INTERNAL_SERVER_ERROR)
                .json({ error: "Internal server error" });
        }
    }

    async addOneBook(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }

        try {
            if (req.user.role === 1) {
                const latestBook = await BookModel.findOne({}, {}, { sort: { book_id: -1 } });
                let newBookId = 1;

                if (latestBook) {
                    newBookId = latestBook.book_id + 1;
                }

                req.body.book_id = newBookId;
                console.log(req.body);

                //stopping 

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

    async editBook(req, res) {
        if (req.user.role === 1) {
            const error = validationResult(req).array();
            if (error.length > 0) {
                return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
            }

            //check if bookid is valid mongoose object id
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Invalid book id"));
            }

            try {
                const updatedBook = await BookModel.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true }
                );

                if (updatedBook) {
                    return res
                        .status(OK)
                        .send(
                            successMessage(
                                "Book updated successfully",
                                updatedBook
                            )
                        );
                } else {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Book not found"));
                }
            } catch (error) {
                console.error(error);
                return res
                    .status(INTERNAL_SERVER_ERROR)
                    .send(errorMessage("Internal Server Error"));
            }
        } else {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        }
    }

    async deleteBook(req, res) {
        if (req.user.role === 1) {
            const bookId = req.params.id;
            if (mongoose.isValidObjectId(bookId)) {
                const carts = await CartModel.find({
                    "books.bookId": bookId,
                });

                //remove book from cart
                for (const cart of carts) {
                    cart.books = cart.books.filter(
                        (book) => book.bookId.toString() !== bookId
                    );
                    await cart.save();
                }

                const reviews = await ReviewModel.find({
                    bookId: bookId,
                });
                for (const review of reviews) {
                    await ReviewModel.findByIdAndDelete(review._id);
                }

                const deletedBook = await BookModel.findByIdAndDelete(bookId);

                if (deletedBook) {
                    return res.status(OK).send(
                        successMessage("Book deleted successfully", {
                            book: deletedBook.title,
                        })
                    );
                } else {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Book not found"));
                }
            } else {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Invalid book id"));
            }
        } else {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not authorized"));
        }
    }

    async getOneBook(req, res) {
        const bookId = req.params.id;
        if (mongoose.isValidObjectId(bookId)) {
            try {
                const book = await BookModel.findById(bookId).populate({
                    path: 'reviews',
                    populate: { path: 'userId', select: 'email' } // Populate the userId field
                });
                if (book) {
                    return res.status(OK).send(successMessage("Book fetched successfully", book));
                } else {
                    return res.status(NOT_FOUND).send(errorMessage("Book not found"));
                }
            } catch (error) {
                console.error("Error fetching book:", error);
                return res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Internal Server Error"));
            }
        } else {
            return res.status(NOT_FOUND).send(errorMessage("Invalid book id"));
        }
    }

}

module.exports = new BookControllers();
