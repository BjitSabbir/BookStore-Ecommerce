const mongoose = require("mongoose");
const WalletTransectionModel = require("./wallet/WalletTransectionModel");

const transectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        books: [
            {
                bookId: {
                    type: mongoose.Types.ObjectId,
                    ref: "Book",
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        userType: {
            type: String,
            enum: ["silver", "gold", "platinum", "diamond"],
            default: "silver",
        },
        userTypeDiscount: {
            type: Number,
            enum: [0, 2, 4, 6],
            default: 0,
        },
        userTypeDiscountAmount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        payment: {
            type: String,
            enum: ["transfer", "cod"],
            default: "transfer",
        },
        address: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

transectionSchema.methods.setUserTypeDiscountAmount = async function () {
    const userTransectionLength = await WalletTransectionModel.find({
        userId: this.userId,
        transectionType: "payment",
    }).count();

    console.log(userTransectionLength);

    if (userTransectionLength >= 1 && userTransectionLength <= 50) {
        this.userType = "silver";
        this.userTypeDiscount = 0;
        this.userTypeDiscountAmount = this.total;
    } else if (userTransectionLength > 50 && userTransectionLength <= 100) {
        this.userType = "gold";
        this.userTypeDiscount = 2;
        this.userTypeDiscountAmount =
            this.total - (this.total * this.userTypeDiscount) / 100;
    } else if (userTransectionLength > 100 && userTransectionLength <= 200) {
        this.userType = "platinum";
        this.userTypeDiscount = 4;
        this.userTypeDiscountAmount =
            this.total - (this.total * this.userTypeDiscount) / 100;
    } else {
        this.userType = "diamond";
        console.log(this.userType);
        this.userTypeDiscount = 6;
        this.userTypeDiscountAmount =
            this.total - (this.total * this.userTypeDiscount) / 100;
    }
};

const TransectionModel = mongoose.model("Transection", transectionSchema);
module.exports = TransectionModel;
