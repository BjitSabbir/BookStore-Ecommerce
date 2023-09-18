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
const WalletModel = require("../database/models/wallet/WalletModel");
const WalletTransectionModel = require("../database/models/wallet/WalletTransectionModel");
const { successMessage, errorMessage } = require("../utils/app-errors");

class transactionControllers {
    async addUserTransection(req, res) {
        const address = req.body.address;
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

        //create new wallet
        const wallet = new TransectionModel({
            userId: req.user.userId,
            books: cart.books,
            total: cart.total,
            address: address,
        });



        //inside books there are quantity and bookId
        
        let isQuantityAvailable = true

        cart.books.forEach(async (book) => {
            const serverBook = await BookModel.findById(book.bookId);
            if (serverBook.stock_quantity < book.quantity) {
                isQuantityAvailable = false
                return res
                    .status(BAD_REQUEST)
                    .send(errorMessage("Quantity not available"));
            }else{
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
        await wallet.save()

        const userLatestTransection = await TransectionModel.findOne({
            userId: req.user.userId,
        })

        await userLatestTransection.setUserTypeDiscountAmount()
        await userLatestTransection.save();

        if (isQuantityAvailable) {
            return res
                .status(OK)
                .send(
                    successMessage(
                        "Transection added successfully",
                        userLatestTransection
                    )
                );
        }
    }


    async getUserTransaction(req, res) {
        const Transection = await TransectionModel.find({
            userId: req.user.userId,
        }).populate({
            path: "books.bookId",
            select: "title authors isbn",
        });

        if (!Transection) {
            return res
                .status(NOT_FOUND)
                .send(errorMessage("Transection not found"));
        } else {
            return res
                .status(OK)
                .send(
                    successMessage(
                        "Transection fetched successfully",
                        Transection
                    )
                );
        }
    }
}

module.exports = new transactionControllers();
