const mongoose = require("mongoose");
const BookModel = require("./BookModel");

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
    bookIds: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Book",
        },
    ],
    allBookIds: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Book",
        },
    ],
    bookGenres: [String],
    bookAuthors: [String],
    discount_region: [
        {
            type: String,
            trim: true,
        },
    ],
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
        default: false,
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
});

discountSchema.pre("save", async function (next) {
    console.log("I was called");
    const uniqueBookIds = await Promise.all([
        ...this.bookGenres.map((genre) =>
            BookModel.find({ genre }, "_id").distinct("_id")
        ),
        ...this.bookAuthors.map((author) =>
            BookModel.find({ authors: author }, "_id").distinct("_id")
        ),
    ]);

    const AllBookIds = [
        ...new Set(uniqueBookIds.flat().map((id) => id.toString())),
    ];

    if (this.allBookIds.length > 0) {
        const extraBooks = this.allBookIds.filter(
            (bookId) => !AllBookIds.includes(bookId)
        );

        for (const bookId of extraBooks) {
            const book = await BookModel.findById(bookId);
            if (book) {
                await book.removeDiscount({ discountId: this._id });
            }
        }
    }

    this.allBookIds = AllBookIds;

    if (this.isNew || this.isModified("allBookIds")) {
        this.isActivated = false;
    }

    next();
});

discountSchema.methods.disableDiscountSchema = async function ({ isDisabled }) {
    this.isDisabled = isDisabled;
    await this.save();
};

const DiscountModel = mongoose.model("Discount", discountSchema);

module.exports = DiscountModel;
