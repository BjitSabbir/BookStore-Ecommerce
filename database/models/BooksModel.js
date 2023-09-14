const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    book_id: {
        type: Number,
        required: true,
        unique: true,
        index: true, 
    },
    title: {
        type: String,
        required: true,
        trim: true, 
        index: true, 
    },
    authors: [{
        type: String,
        trim: true,
    }],
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    genre: {
        type: String,
        trim: true,
    },
    isbn: {
        type: String,
        trim: true,
        index: true, 
    },
    stock_quantity: {
        type: Number,
        default: 0, // Optional: Set a default value
        min: 0,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;
