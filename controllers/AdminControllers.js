const { default: mongoose } = require("mongoose");
const TransectionModel = require("../database/models/TransectionModel");
const UserModel = require("../database/models/UserModel");
const BookModel = require("../database/models/BookModel");
const AuthModel = require("../database/models/AuthModel");
const WalletModel = require("../database/models/wallet/WalletModel");
const WalletTransectionModel = require("../database/models/wallet/WalletTransectionModel");
const ReviewModel = require("../database/models/ReviewModel");
const CartModel = require("../database/models/CartModel");

const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
} = require("./../constants/statusCode");
const { validationResult } = require("express-validator");

class AdminControllers {
    async getAllTransections(req, res) {
        try {
            if (req.user.role === 1) {
                const errorQuery = validationResult(req);
                if (!errorQuery.isEmpty()) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage(errorQuery.array()[0].msg));
                }

                const { search, page, limit, sortType, sortKey, userId } =
                    req.query;

                const options = {
                    limit: parseInt(limit) || 10,
                    skip: (parseInt(page) - 1) * parseInt(limit) || 0,
                };

                const query = {};

                // If you have a sortKey and sortType, you can sort the results
                if (sortKey && sortType) {
                    const sort = {};
                    sort[sortKey] = sortType === "asc" ? 1 : -1;
                    options.sort = sort;
                }

                // Add search criteria if search parameter is provided
                if (search) {
                    query.address = { $regex: search, $options: "i" }; // Case-insensitive search for 'transactionTitle'
                }

                if (userId) {
                    query.userId = userId;
                }

                const transactions = await TransectionModel.find(
                    query,
                    null,
                    options
                )
                    .populate({
                        path: "books.bookId",
                        select: "title isbn",
                    })
                    .populate({
                        path: "userId",
                        select: "username email",
                    });

                res.status(OK).send(
                    successMessage(
                        "Admin - All Users Transection History",
                        transactions
                    )
                );
            } else {
                res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).send(
                errorMessage("Internal Server Error")
            );
        }
    }
    async viewAllUserData(req, res) {
        try {
            if (req.user.role === 1) {
                const { userId } = req.query;

                // Check if userId is a valid mongoose ObjectId
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid userId"));
                }

                const user = await UserModel.findById(userId)
                    .populate({
                        path: "reviews",
                    })
                    .populate("walletId");

                if (user) {
                    res.status(OK).send(
                        successMessage("Admin - View User Data", user)
                    );
                } else {
                    res.status(NOT_FOUND).send(errorMessage("User not found"));
                }
            } else {
                res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).send(
                errorMessage("Internal Server Error")
            );
        }
    }
    async getAllUsers(req, res) {
        try {
            if (req.user.role === 1) {
                const errorQuery = validationResult(req);
                if (!errorQuery.isEmpty()) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage(errorQuery.array()[0].msg));
                }
                const { page, limit, sortType, sortKey } = req.query;

                const options = {
                    limit: parseInt(limit) || 10, // Default limit to 10 if not provided
                    skip: (parseInt(page) - 1) * parseInt(limit) || 0, // Calculate skip based on page and limit
                };

                const query = {}; // You can add additional query criteria if needed

                // If you have a sortKey and sortType, you can sort the results
                if (sortKey && sortType) {
                    const sort = {};
                    sort[sortKey] = sortType === "asc" ? 1 : -1;
                    options.sort = sort;
                }

                const users = await UserModel.find(query, null, options);

                res.status(OK).send(
                    successMessage("User list retrieved successfully", users)
                );
            } else {
                res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).send(
                errorMessage("Internal Server Error")
            );
        }
    }
    async editUserData(req, res) {
        try {
            if (req.user.role === 1) {
                const errorQuery = validationResult(req);
                if (!errorQuery.isEmpty()) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage(errorQuery.array()[0].msg));
                }

                const { userId } = req.params;
                const { username, email, isActiveUser, address, phone } =
                    req.body;

                // Check if userId is a valid mongoose ObjectId
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid userId"));
                }

                // Find the user to update
                const userToUpdate = await UserModel.findById(userId);

                if (!userToUpdate) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("User not found"));
                }

                // Check if the email is changing
                if (email && email !== userToUpdate.email) {
                    // Check if the new email already exists in AuthModel
                    const emailExists = await AuthModel.findOne({ email });

                    if (emailExists) {
                        return res
                            .status(BAD_REQUEST)
                            .send(errorMessage("Email already exists"));
                    }

                    // Update the email in UserModel and AuthModel
                    userToUpdate.email = email;
                    await userToUpdate.save();

                    // Assuming you have an AuthModel, update email there too
                    const authUser = await AuthModel.findOne({
                        userId: userToUpdate._id,
                    });

                    if (authUser) {
                        authUser.email = email;
                        await authUser.save();
                    }
                }

                // Update other fields
                userToUpdate.username = username;
                userToUpdate.isActiveUser = isActiveUser;
                userToUpdate.address = address;
                userToUpdate.phone = phone;

                // Save the updated user data
                const updatedUser = await userToUpdate.save();

                res.status(OK).send(
                    successMessage(
                        "User data updated successfully",
                        updatedUser
                    )
                );
            } else {
                res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).send(
                errorMessage("Internal Server Error")
            );
        }
    }

    async deleteUser(req, res) {
        try {
            if (req.user.role === 1) {
                const { userId } = req.params;

                // Check if userId is a valid mongoose ObjectId
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid userId"));
                }

                const userToDelete = await UserModel.findById(userId);

                if (!userToDelete) {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("User not found"));
                }

                const checkAdmin = await AuthModel.findOne({ userId });
                if (checkAdmin && checkAdmin.role === 1) {
                    return res
                        .status(FORBIDDEN)
                        .send(errorMessage("User not authorized"));
                }

                await AuthModel.findOneAndDelete({ userId });
                await TransectionModel.deleteMany({ userId });
                await CartModel.findOneAndDelete({ userId });
                await WalletModel.findOneAndDelete({ userId });
                await WalletTransectionModel.deleteMany({ userId });

                const reviews = await ReviewModel.find({ userId });
                for (const review of reviews) {
                    const bookId = review.bookId;

                    await BookModel.findByIdAndUpdate(bookId, {
                        $pull: { reviews: review._id },
                    });

                    await ReviewModel.findByIdAndDelete(review._id);
                }

                await UserModel.findByIdAndDelete(userId);

                res.status(OK).send(
                    successMessage("User deleted successfully")
                );
            } else {
                res.status(FORBIDDEN).send(errorMessage("User not authorized"));
            }
        } catch (error) {
            console.error(error);
            res.status(INTERNAL_SERVER_ERROR).send(
                errorMessage("Internal Server Error")
            );
        }
    }

    async sellAnalysis(req, res) {
        try {
            const { minTransactionDate } = req.query;

            try {
                if (
                    minTransactionDate &&
                    isNaN(Date.parse(minTransactionDate))
                ) {
                    return res
                        .status(BAD_REQUEST)
                        .send(errorMessage("Invalid date"));
                }

                const matchStage = {
                    $match: {
                        createdAt: {
                            $gte: minTransactionDate
                                ? new Date(minTransactionDate)
                                : new Date(0), // If minTransactionDate is not provided, start from the beginning
                            $lte: new Date(), // Use the current date as the end date
                        },
                    },
                };

                const salesAnalysis = await TransectionModel.aggregate([
                    matchStage,
                    {
                        $unwind: "$books",
                    },
                    {
                        $group: {
                            _id: "$books.bookId",
                            totalQuantitySold: { $sum: "$books.quantity" },
                            totalSales: { $sum: "$total" },
                        },
                    },
                    {
                        $lookup: {
                            from: "books",
                            localField: "_id",
                            foreignField: "_id",
                            as: "bookInfo",
                        },
                    },
                    {
                        $unwind: "$bookInfo",
                    },
                    {
                        $project: {
                            _id: 0,
                            bookId: "$_id",
                            totalQuantitySold: 1,
                            totalSales: 1,
                            bookTitle: "$bookInfo.title",
                        },
                    },
                ]);

                const totalSales = salesAnalysis.reduce(
                    (acc, book) => acc + book.totalSales,
                    0
                );

                const usersTotalPayment =
                    await WalletTransectionModel.aggregate([
                        matchStage,
                        {
                            $match: { transectionType: "payment" },
                        },
                        {
                            $group: {
                                _id: "$userId",
                                totalPaymentAmount: { $sum: "$amount" },
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "userInfo",
                            },
                        },
                        {
                            $unwind: "$userInfo",
                        },
                        {
                            $project: {
                                _id: 0,
                                userId: "$_id",
                                totalPaymentAmount: 1,
                                userName: "$userInfo.email",
                            },
                        },
                        {
                            $sort: { totalPaymentAmount: -1 },
                        },
                    ]);

                res.json({
                    totalSales,
                    salesByBook: salesAnalysis,
                    topPayedUsers: usersTotalPayment,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = new AdminControllers();
