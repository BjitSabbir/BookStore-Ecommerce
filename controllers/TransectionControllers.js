const {
    OK,
    INTERNAL_SERVER_ERROR,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
} = require("../constants/statusCode");
const BookModel = require("../database/models/BookModel");
const CartModel = require("../database/models/CartModel");
const TransectionModel = require("../database/models/TransectionModel");
const UserModel = require("../database/models/UserModel");
const WalletModel = require("../database/models/wallet/WalletModel");
const WalletTransectionModel = require("../database/models/wallet/WalletTransectionModel");
const { successMessage, errorMessage } = require("../utils/app-errors");
const { validationResult } = require("express-validator");

class transactionControllers {
    async addUserTransection(req, res) {
        console.log(req.body);
        var address = req.body.address;

        if (!address) {
            //check if User has address
            const user = await UserModel.findById(req.user.userId);
            if (!user.address) {
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Address is required"));
            } else {
                address = user.address;
            }
        }
        //get user cart
        const cart = await CartModel.findOne({
            userId: req.user.userId,
        });

        if (!cart) {
            return res.status(NOT_FOUND).send(errorMessage("Cart not found"));
        }

        if (!cart.books.length) {
            return res.status(BAD_REQUEST).send(errorMessage("Cart is empty"));
        }

        const userWallet = await WalletModel.findOne({
            userId: req.user.userId,
        });

        if (!userWallet) {
            return res.status(NOT_FOUND).send(errorMessage("Wallet not found"));
        }

        if (userWallet.balance < cart.total) {
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Insufficient balance"));
        }

        const bookUpdatePromises = [];
        let totalPrice = 0;

        // Use for...of loop to ensure async/await works as expected
        for (const book of cart.books) {
            const bookData = await BookModel.findById(book.bookId._id);

            if (bookData.discount_percentage > 0) {
                book.price =
                    bookData.price * (1 - bookData.discount_percentage / 100);
                // Save discounted price
            } else {
                book.price = bookData.price;
            }

            totalPrice += book.price * book.quantity;

            // Push the promise returned by the async operation to the array
        }

        // Wait for all the async updates to complete
        await Promise.all(bookUpdatePromises);

        // Set cart.total to the calculated totalPrice
        cart.total = totalPrice;

        // Save the updated cart
        await cart.save();

        //create new wallet
        const wallet = new TransectionModel({
            userId: req.user.userId,
            books: cart.books,
            total: cart.total,
            address: address,
        });

        //inside books there are quantity and bookId

        let isQuantityAvailable = true;

        cart.books.forEach(async (book) => {
            const serverBook = await BookModel.findById(book.bookId);
            if (serverBook.stock_quantity < book.quantity) {
                isQuantityAvailable = false;
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Quantity not available"));
            } else {
                serverBook.stock_quantity =
                    serverBook.stock_quantity - book.quantity;
                await serverBook.save();
            }
        });

        //add a new wallet transection
        const walletTransection = new WalletTransectionModel({
            userId: req.user.userId,
            walletId: userWallet._id,
            transectionType: "payment",
            amount: cart.total,
        });

        //reduce wallet balance
        userWallet.balance = userWallet.balance - cart.total;

        cart.books = [];
        cart.total = 0;

        //save cart
        await cart.save();

        //save wallet transection
        await walletTransection.save();

        //save wallet
        await userWallet.save();

        //save wallet
        await wallet.save();

        const userLatestTransection = await TransectionModel.findOne({
            userId: req.user.userId,
        }).sort({ createdAt: -1 });

        await userLatestTransection.setUserTypeDiscountAmount();
        await userLatestTransection.save();

        if (isQuantityAvailable) {
            return res
                .status(OK)
                .send(successMessage("Transection added successfully", wallet));
        }
    }

    async getUserTransaction(req, res) {
        try {
            const error = validationResult(req).array();
            if (error.length > 0) {
                return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
            }

            const { latest, sortType, sortKey, limit } = req.query;

            // Build the query to find user transactions
            const query = {
                userId: req.user.userId,
            };

            const options = {
                populate: {
                    path: "books.bookId",
                    select: "title authors isbn",
                },
            };

            // Configure sorting based on the provided parameters
            if (sortType && sortKey) {
                const sortOptions = {};
                sortOptions[sortKey] = sortType === "asc" ? 1 : -1;
                options.sort = sortOptions;
            }

            if (latest) {
                options.sort = { createdAt: -1 };
            }

            // Use findOne for the "latest" case and find for others
            const transactions = latest
                ? await TransectionModel.findOne(query, null, options)
                : await TransectionModel.find(query, null, options).limit(
                      limit
                  );

            if (!transactions) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Transactions not found"));
            } else {
                return res
                    .status(OK)
                    .send(
                        successMessage(
                            "Transactions fetched successfully",
                            transactions
                        )
                    );
            }
        } catch (error) {
            console.error(error);
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(errorMessage("Internal server error"));
        }
    }
}

module.exports = new transactionControllers();
