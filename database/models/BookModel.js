const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
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
        book_Active_regions: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        authors: [
            {
                type: String,
                trim: true,
            },
        ],
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

        discount_region: [
            {
                type: String,
                trim: true,
            },
        ],

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

        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        isDiscountActive: {
            type: Boolean,
            default: false,
        },
        activeDiscountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discount",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

bookSchema.methods.activateDiscount = async function ({
    discountValue,
    discountId,
    discount_region,
}) {
    // console.log(
    //     "activating discount for" +
    //         this.title +
    //         ": " +
    //         discountValue +
    //         " " +
    //         discountId
    // );

    // console.log("discount region: " + discount_region);

    this.isDiscountActive = true;
    this.discount_percentage = discountValue;
    this.activeDiscountId = discountId; // Set the active discount ID
    this.discount_region = discount_region;
    await this.save();
};

bookSchema.methods.deactivateDiscount = async function ({ discountId }) {
    // console.log("deactivating discount for" + this.title + ": " + discountId);

    if (
        this.isDiscountActive &&
        this.activeDiscountId &&
        this.activeDiscountId.equals(discountId)
    ) {
        this.isDiscountActive = false;
        this.discount_percentage = 0;
        this.activeDiscountId = null; // Remove the active discount ID
        this.discount_region = [];
        await this.save();
    } else {
        // The discount is not active or the provided discountId does not match the activeDiscountId
    }
};

//remove discount
bookSchema.methods.removeDiscount = async function ({ discountId }) {
    console.log("removing discount for" + this.title);

    if (
        this.isDiscountActive &&
        this.activeDiscountId.toString() === discountId.toString()
    ) {
        console.log("removing discount for" + this.title);
        this.isDiscountActive = false;
        this.discount_percentage = 0;
        this.activeDiscountId = null; // Remove the active discount ID
        this.discount_region = [];
        await this.save();
    } else {
        // The discount is not active or the provided discountId does not match the activeDiscountId
    }
};

const BookModel = mongoose.model("Book", bookSchema);

module.exports = BookModel;
