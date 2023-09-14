const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: mongoose.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
})

const ReviewModel = mongoose.model('Review', reviewSchema);
module.exports = ReviewModel;