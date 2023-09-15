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
    image: {
        type: String,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    authors: [{
        type: String,
        trim: true,
    }],
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount_percentage: {
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
        default: 0,
        min: 0,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    isDiscountActive : {
        type: Boolean,
        default: false
    },
    activeDiscountId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Discount',
        default: null, 
    }

},{
    timestamps: true
});

bookSchema.methods.activateDiscount = async function ({ discountValue, discountId }) {
        console.log(discountValue, discountId);
 
        console.log('activating discount');
        this.isDiscountActive = true;
        this.discount_percentage = discountValue;
        this.activeDiscountId = discountId; // Set the active discount ID
        await this.save();
    
};

bookSchema.methods.deactivateDiscount = async function ({ discountId }) {
    console.log(discountId);
    console.log('deactivating discount');
    if (this.isDiscountActive && this.activeDiscountId && this.activeDiscountId.equals(discountId)) {
        this.isDiscountActive = false;
        this.discount_percentage = 0;
        this.activeDiscountId = null; // Remove the active discount ID
        await this.save();
    } else {
        // The discount is not active or the provided discountId does not match the activeDiscountId
    }
};


const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;
