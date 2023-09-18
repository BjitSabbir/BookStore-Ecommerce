const WalletModel = require("../database/models/wallet/WalletModel");
const WalletTransectionModel = require("../database/models/wallet/WalletTransectionModel");
const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
    BAD_REQUEST,
} = require("./../constants/statusCode");

class WalletController {
    async getWalletStatus(req, res) {
        const wallet = await WalletModel.findOne({
            userId: req.user.userId,
        });

        if (!wallet) {
            return res.status(NOT_FOUND).send(errorMessage("Wallet not found"));
        } else {
            return res
                .status(OK)
                .send(successMessage("Wallet fetched successfully", wallet));
        }
    }
    async topupWallet(req, res) {
        const { amount } = req.body;

        if (amount < 1) {
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Amount must be greater than 0"));
        }

        const wallet = await WalletModel.findOne({
            userId: req.user.userId,
        });

        if (!wallet) {
            return res.status(NOT_FOUND).send(errorMessage("Wallet not found"));
        }

        wallet.balance += amount;
        await wallet.save();

        const walletTransection = new WalletTransectionModel({
            userId: req.user.userId,
            walletId: wallet._id,
            transectionType: "topup",
            amount: amount,
        });

        await walletTransection.save();

        return res
            .status(CREATED)
            .send(successMessage("Wallet topup successfully"));
    }
    async getWalletTransactions(req, res) {
        const walletTransections = await WalletTransectionModel.find({
            userId: req.user.userId,
        });

        return res
            .status(OK)
            .send(
                successMessage(
                    "Wallet transections fetched successfully",
                    walletTransections
                )
            );
    }
}
module.exports = new WalletController();
