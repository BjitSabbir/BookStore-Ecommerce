const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
});

const CartModel = mongoose.model("Cart", cartSchema);
module.exports = CartModel;
