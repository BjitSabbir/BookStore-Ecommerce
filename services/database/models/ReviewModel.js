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
        min: 1,
        max: 5
    },
    comment: {
        type: String
    }
});


const ReviewModel = mongoose.model('Review', reviewSchema);
module.exports = ReviewModel;
