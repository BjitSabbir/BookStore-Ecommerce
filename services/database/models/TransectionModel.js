const mongoose = require("mongoose");

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

const TransectionModel = mongoose.model("Transection", transectionSchema);
module.exports = TransectionModel;
