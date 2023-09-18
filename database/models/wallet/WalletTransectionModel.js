const mongoose = require("mongoose");

const walletTransectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        walletId: {
            type: mongoose.Types.ObjectId,
            ref: "Wallet",
            required: true,
        },
        transectionType: {
            type: String,
            enum: ["topup", "payment"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        transectionId: {
            type: String,
        },
    },

    {
        timestamps: true,
    }
);

const WalletTransectionModel = mongoose.model(
    "WalletTransection",
    walletTransectionSchema
);
module.exports = WalletTransectionModel;

