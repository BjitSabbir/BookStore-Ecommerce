const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
} = require("./../constants/statusCode");

const CartModel = require("../database/models/CartModel");
const BookModel = require("../database/models/BookModel");
const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");

class CartControllers {
    async getCart(req, res) {
        const cart = await CartModel.findOne({
            userId: req.user.userId,
        }).populate({
            path: "books.bookId",
            select: "title authors isbn price discount_percentage",
        });

        if (!cart) {
            return res.status(NOT_FOUND).send(errorMessage("Cart not found"));
        }

        let totalPrice = 0;

        // Use for...of loop to ensure async/await works as expected
        for (const book of cart.books) {
            const bookData = await BookModel.findById(book.bookId._id);
            if (bookData.discount_percentage > 0) {
                book.price =
                    bookData.price * (1 - bookData.discount_percentage / 100);
            } else {
                book.price = bookData.price;
            }
            totalPrice += book.price * book.quantity;
        }

        cart.total = totalPrice;

        // Save the updated cart
        await cart.save();

        if (!cart) {
            return res.status(NOT_FOUND).send(errorMessage("Cart not found"));
        } else {
            return res
                .status(OK)
                .send(successMessage("Cart fetched successfully", cart));
        }
    }

    async addManyToCart(req, res) {
        try {
            const books = req.body;

            const cart = await CartModel.findOne({ userId: req.user.userId });

            if (!cart) {
                return res.status(NOT_FOUND).send(errorMessage("Cart not found"));
            }


            cart.books = [];

            for (const book of books) {
                const currentBook = await BookModel.findById(book._id);

                if (!currentBook) {
                    return res.status(NOT_FOUND).send(errorMessage("Book not found"));
                } else if (currentBook.stock_quantity < book.quantity) {
                    return res.status(BAD_REQUEST).send(errorMessage("Quantity not available"));
                } else {
                    cart.books.push({
                        bookId: currentBook._id,
                        price: currentBook.price,
                        quantity: book.quantity,
                    });
                }
            }

            // Calculate the total price of the cart
            const totalPrice = cart.books.reduce((total, book) => {
                return total + (book.price * book.quantity);
            }, 0);

            cart.total = totalPrice;

            await cart.save();

            return res.status(OK).send(successMessage("Books added to cart successfully", cart));
        } catch (error) {
            console.error(error);
            return res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Internal Server Error"));
        }
    }


    async addToCart(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        const { bookId, quantity } = req.body;

        try {
            if (req.user.role === 1) {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("Admin cannot add to cart"));
            }
            const book = await BookModel.findById(bookId);

            if (!book) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Book not found"));
            }

            if (quantity < 1) {
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Quantity must be greater than 0"));
            }

            if (book.stock_quantity < quantity) {
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Quantity not available"));
            }

            const price = book.isDiscountActive
                ? book.price * (1 - book.discount_percentage / 100)
                : book.price;

            const cart = await CartModel.findOne({ userId: req.user.userId });

            if (!cart) {
                const newCart = new CartModel({
                    userId: req.user.userId,
                    books: [{ bookId, price, quantity }],
                    total: price * quantity,
                });
                await newCart.save();
                return res
                    .status(CREATED)
                    .send(
                        successMessage(
                            "Book added to cart successfully",
                            newCart
                        )
                    );
            }

            const existingBookIndex = cart.books.findIndex(
                (cartItem) => cartItem.bookId.toString() === bookId
            );

            if (existingBookIndex !== -1) {
                if (
                    cart.books[existingBookIndex].quantity + quantity >
                    book.stock_quantity
                ) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Quantity not available"));
                }
                cart.books[existingBookIndex].quantity += quantity;
            } else {
                cart.books.push({ bookId, price, quantity });
            }

            cart.total = cart.books.reduce(
                (total, book) => total + book.price * book.quantity,
                0
            );
            await cart.save();
            return res
                .status(OK)
                .send(successMessage("Cart item updated successfully", cart));
        } catch (err) {
            console.error(err);
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Failed to add book to cart"));
        }
    }

    async updateCartItem(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        const { bookId, quantity } = req.body;

        if (!bookId || !quantity)
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Book id and quantity are required"));

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(NOT_FOUND).send(errorMessage("Invalid book id"));
        }

        if (quantity < 1 || quantity > 100) {
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Quantity must be greater than 0"));
        }

        if (quantity < 1) {
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Quantity must be greater than 0"));
        }

        try {
            if (req.user.role === 1) {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("Admin cannot update to cart"));
            }
            const book = await BookModel.findById(bookId);
            const cart = await CartModel.findOne({
                userId: req.user.userId,
            });

            if (!book) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Book not found"));
            }

            if (!cart) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Cart not found"));
            }

            const existingBookIndex = cart.books.findIndex(
                (cartItem) => cartItem.bookId.toString() === bookId
            );

            if (existingBookIndex !== -1) {
                if (cart.books[existingBookIndex].quantity > quantity) {
                    // Decrease the quantity in the cart
                    cart.books[existingBookIndex].quantity -= quantity;

                    const price = book.isDiscountActive
                        ? cart.books[existingBookIndex].quantity *
                        (1 - book.discount_percentage / 100)
                        : book.price;

                    cart.total = cart.books.reduce(
                        (total, book) => total + book.price * book.quantity,
                        0
                    );

                    await cart.save();
                    return res
                        .status(OK)
                        .send(
                            successMessage(
                                "Cart item updated successfully",
                                cart
                            )
                        );
                } else if (
                    cart.books[existingBookIndex].quantity === quantity
                ) {
                    // Remove the book from the cart
                    cart.books.splice(existingBookIndex, 1);

                    cart.total = cart.books.reduce(
                        (total, book) => total + book.price * book.quantity,
                        0
                    );

                    await cart.save();
                    return res
                        .status(OK)
                        .send(
                            successMessage(
                                "Book removed from cart successfully",
                                cart
                            )
                        );
                } else {
                    return res
                        .status(BAD_REQUEST)
                        .send(
                            errorMessage(
                                "Deducted quantity cannot be greater than the current quantity"
                            )
                        );
                }
            } else {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Book not found in cart"));
            }
        } catch (err) {
            console.error(err);
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Failed to update cart item"));
        }
    }

    async removeCart(req, res) {
        try {
            if (req.user.role === 1) {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("Admin cannot remove to cart"));
            }
            const cart = await CartModel.findOne({ userId: req.user.userId });

            if (!cart) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Cart not found"));
            }

            cart.books = [];
            cart.total = 0;
            await cart.save();
            return res
                .status(OK)
                .send(successMessage("Cart removed successfully", cart));
        } catch (err) {
            console.error(err);
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Failed to remove cart"));
        }
    }
}

module.exports = new CartControllers();
