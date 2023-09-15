const mongoose = require('mongoose');
const { prependListener } = require('./BookModel');

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
    isActivated: {
        type: Boolean,
        default: false
    }
});

//discount activationDate < endDate
discountSchema.pre('save', function (next) {
    if(this.activationDate < new Date()){ 
       this.activationDate = new Date();
    }


    if (this.endDate < this.activationDate) {
        // Set endDate to activationDate + 24 hours
        this.endDate = new Date(this.activationDate);
        this.endDate.setHours(this.endDate.getHours() + 24);
    }

    next();
});


const DiscountModel = mongoose.model('Discount', discountSchema);

module.exports = DiscountModel;
