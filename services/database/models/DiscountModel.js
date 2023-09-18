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
    discountType: {
        type: String,
        enum: ["percentage", "price"],
        default: "percentage",
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
        default: false,
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
});

discountSchema.pre("save", async function (next) {
    const uniqueBookIds = [];

    for (const genre of this.bookGenres) {
        const booksWithGenre = await BookModel.find({ genre: genre }, "_id");
        uniqueBookIds.push(...booksWithGenre.map((book) => book._id));
    }

    for (const author of this.bookAuthors) {
        const booksWithAuthor = await BookModel.find(
            { authors: author },
            "_id"
        );
        uniqueBookIds.push(...booksWithAuthor.map((book) => book._id));
    }

    const newBookArray = Array.from(new Set(uniqueBookIds));
    const AllBookIds = Array.from(new Set([...this.bookIds, ...newBookArray]));

    if (this.allBookIds.length === 0) {
        this.allBookIds = AllBookIds;
    } else {
        // Find the extra books in this.allBookIds that are not present in AllBookIds, books ids are
        // mongoode object ids

        const extraBooks = [];
        for (const bookId of this.allBookIds) {
            const bookIdStr = bookId.toString();
            if (!AllBookIds.map(String).includes(bookIdStr)) {
                console.log(
                    "bookId",
                    bookIdStr,
                    AllBookIds.includes(bookIdStr)
                );
                extraBooks.push(bookIdStr);
            }
        }
        console.log("AllBookIds", AllBookIds);
        console.log("this.allBookIds", this.allBookIds);
        console.log("extraBooks", extraBooks);

        for (const bookId of extraBooks) {
            const book = await BookModel.findById(bookId);
            if (book) {
                // Call removeDiscount schema method to remove discount
                await book.removeDiscount({ discountId: this._id });
            }
        }

        // Clear this.allBookIds
        this.allBookIds = [];

        // Add all the books from AllBookIds to this.allBookIds
        AllBookIds.forEach((bookId) => {
            if (!this.allBookIds.map(String).includes(bookId.toString())) {
                this.allBookIds.push(bookId);
            }
        });
    }
    // Check if the document exists in the database before saving
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
