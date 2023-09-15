const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    bookIds: [{
        type: mongoose.Types.ObjectId,
        ref: 'Book',
    }],
    bookGenres: [String],
    bookAuthors: [String],
    discountType: {
        type: String, 
        enum: ['percentage', 'price'],
        default: 'percentage',
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,

    },
    activationDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
});

const DiscountModel = mongoose.model('Discount', discountSchema);

module.exports = DiscountModel;
