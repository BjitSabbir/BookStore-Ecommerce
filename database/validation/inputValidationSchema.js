const { body, query, param } = require("express-validator");
const { default: mongoose } = require("mongoose");

const userValidator = {
    register: [
        body("email")
            .exists()
            .withMessage("email is required")
            .bail()
            .isEmail()
            .withMessage("Invalid email")
            .bail()
            .isLength({ min: 3 }),
        body("password")
            .exists()
            .withMessage("Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    verifyEmail: [
        body("otp")
            .exists()
            .withMessage("OTP is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("OTP must be at least 6 characters"),

        body("email")
            .exists()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Invalid email")
            .bail()
            .isLength({ min: 3 }),
    ],
    verifyOnlyEmail: [
        body("email")
            .exists()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Invalid email")
            .bail()
            .isLength({ min: 3 })
            .withMessage("Password must be at least 6 characters"),
    ],
};

const bookValidator = {
    getBookValidation: [
        query("page")
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage("Page must be a number between 1 and 1000"),

        query("limit")
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage("Limit must be a number between 1 and 50"),

        query("search")
            .optional()
            .isString()
            .withMessage("Search must be a string"),

        query("discounted")
            .optional()
            .isBoolean()
            .toBoolean()
            .withMessage("Discounted must be a boolean"),

        query("sortType")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("SortType must be 'asc' or 'desc'"),

        query("sortKey")
            .optional()
            .isIn(["title", "price", "rating"])
            .withMessage("SortKey must be 'title', 'price', or 'rating'"),

        query("author")
            .optional()
            .isString()
            .withMessage("Author must be a string"),

        query("region")
            .optional()
            .isString()
            .withMessage("Region must be a string"),
    ],

    addOneBook: [
        body("book_id")
            .exists()
            .withMessage("Book id is required")
            .bail()
            .withMessage("Book id must be a number")
            .bail()
            .isNumeric()
            .withMessage("Book id must be a number")
            .bail()
            .isInt({
                min: 1,
                max: 5000,
            })
            .withMessage("Book id must be a valid number between 1 to 5000"),

        body("title")
            .exists()
            .withMessage("Title is required")
            .bail()
            .isLength({ min: 3, max: 1000 })
            .withMessage("Title must be at least 3 characters"),
        body("image")
            .optional()
            .isString()
            .withMessage("Image must be a string"),
        body("book_Active_regions")
            .optional()
            .isArray()
            .withMessage("Book active regions must be an array"),
        body("rating")
            .optional()
            .isNumeric()
            .withMessage("Rating must be a number")
            .bail()
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating can't be more than 5 and less than 1"),
        body("authors")
            .optional()
            .isArray()
            .withMessage("Authors must be an array"),
        body("description")
            .optional()
            .isString()
            .withMessage("Description must be a string"),
        body("price")
            .optional()
            .isNumeric()
            .withMessage("Price must be a number")
            .bail()
            .isLength({ min: 10, max: 10000 })
            .withMessage(
                "Book price can't be more than 10000 and less than 10"
            ),
        body("discount_percentage")
            .optional()
            .isNumeric()
            .withMessage("Discount percentage must be a number")
            .bail()
            .isInt({
                min: 0,
                max: 80,
            })
            .withMessage(
                "discount_percentage can't be more than 80 and less than 0"
            ),
        body("genre")
            .optional()
            .isString()
            .withMessage("Genre must be a string"),
        body("isbn").optional().isString().withMessage("ISBN must be a string"),
        body("discount_region")
            .optional()
            .isArray()
            .withMessage("Discount region must be an array"),
        body("stock_quantity")
            .optional()
            .isNumeric()
            .withMessage("Stock quantity must be a number")
            .bail()
            .isLength({
                min: 5,
                max: 1000,
            })
            .withMessage(
                "stock_quantity can't be more than 1000 and less than 5"
            ),
    ],

    updateBook: [
        body("book_id")
            .optional()
            .isNumeric()
            .withMessage("Book id must be a number"),

        body("title")
            .optional()
            .isLength({ min: 3 })
            .withMessage("Title must be at least 3 characters"),

        body("image")
            .optional()
            .isString()
            .withMessage("Image must be a string"),

        body("book_Active_regions")
            .optional()
            .isArray()
            .withMessage("Book active regions must be an array"),

        body("rating")
            .optional()
            .isNumeric()
            .withMessage("Rating must be a number"),

        body("authors")
            .optional()
            .isArray()
            .withMessage("Authors must be an array"),

        body("description")
            .optional()
            .isString()
            .withMessage("Description must be a string"),

        body("price")
            .optional()
            .isNumeric()
            .withMessage("Price must be a number")
            .bail()
            .isInt({
                min: 10,
                max: 10000,
            })
            .withMessage(
                "Book price can't be more than 10000 and less than 10"
            ),

        body("discount_percentage")
            .optional()
            .isNumeric()
            .withMessage("Discount percentage must be a number")
            .bail()
            .isLength({
                min: 0,
                max: 80,
            })
            .withMessage(
                "discount_percentage can't be more than 80 and less than 0"
            ),

        body("genre")
            .optional()
            .isString()
            .withMessage("Genre must be a string"),

        body("isbn").optional().isString().withMessage("ISBN must be a string"),

        body("discount_region")
            .optional()
            .isArray()
            .withMessage("Discount region must be an array"),

        body("stock_quantity")
            .optional()
            .isNumeric()
            .withMessage("Stock quantity must be a number")
            .bail()
            .isInt({
                min: 5,
                max: 1000,
            })
            .withMessage(
                "stock_quantity can't be more than 1000 and less than 5"
            ),
    ],
};

const AdminValidator = {
    viewTransection: [
        query("page")
            .optional()
            .isNumeric()
            .withMessage("Page must be a number"),
        query("limit")
            .optional()
            .isNumeric()
            .withMessage("Limit must be a number")
            .bail()
            .isLength({ min: 1, max: 50 })
            .withMessage("Limit must be between 1 to 50"),

        query("page")
            .optional()
            .isNumeric()
            .withMessage("Page has to be Numbers")
            .bail()
            .isInt({
                min: 1,
                max: 50,
            })
            .withMessage("Page limit is min 1 and max 50"),

        query("limit")
            .optional()
            .isNumeric()
            .withMessage("Page has to be Numbers")
            .bail()
            .isInt({
                min: 1,
                max: 100,
            })
            .withMessage("limit is min 1 and max 100"),

        query("sortType")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Sort type must be asc or desc"),
        query("sortKey")
            .optional()
            .isIn(["address", "total", "status", "userType"])
            .withMessage("Sort key must be address, total, status, userType"),
        query("search")
            .optional()
            .isString()
            .withMessage("Search must be a string"),
        query("userId")
            .optional()
            .isMongoId()
            .withMessage("User id must be a valid mongo id"),
    ],
    editUser: [
        param("userId")
            .isMongoId()
            .withMessage("User id must be a valid mongo id"),

        body("username")
            .optional()
            .isString()
            .withMessage("Username must be a string"),

        body("email")
            .optional()
            .isEmail()
            .withMessage("Email must be a valid email address"),

        body("isActiveUser")
            .optional()
            .isBoolean()
            .withMessage("isActiveUser must be a boolean"),

        body("address")
            .optional()
            .isString()
            .withMessage("Address must be a string"),

        body("phone")
            .optional()
            .isString()
            .withMessage("Phone must be a string"),
    ],
    deleteUser: [],
};

const ReviewsValidator = {
    addOrUpdateRatings: [
        body("bookId")
            .exists()
            .withMessage("Book id is required")
            .bail()
            .isMongoId()
            .withMessage("Book id must be a valid mongo id"),

        body("rating")
            .exists()
            .withMessage("Rating is required")
            .bail()
            .isNumeric()
            .withMessage("Rating must be a number")
            .bail()
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating can't be more than 5 and less than 1"),

        body("comment")
            .optional()
            .isString()
            .withMessage("Comment must be a string"),
    ],
    removeRatingReview: [
        body("bookId")
            .exists()
            .withMessage("Book id is required")
            .bail()
            .isMongoId()
            .withMessage("Book id must be a valid mongo id")
            .bail()
            .isLength({
                min: 1,
                max: 5000,
            }),
    ],
    getReviewByUserCheck: [
        query("bookId")
            .optional()
            .isMongoId()
            .withMessage("Book id must be a valid mongo id")
            .bail()
            .isLength({
                min: 1,
                max: 5000,
            }),
    ],
};

const DiacountValidators = {
    createDiscountValidaor: [
        body("name").exists().withMessage("Name is required"),
        body("description").optional().trim(),
        body("bookIds")
            .optional()
            .isArray({ min: 0 })
            .withMessage("At least one book ID is required")
            .custom((array) => {
                return array.every((id) => mongoose.Types.ObjectId.isValid(id));
            })
            .withMessage("Invalid book IDs here"),
        body("allBookIds")
            .optional()
            .isArray()
            .custom((array) => {
                return array.every((id) => mongoose.Types.ObjectId.isValid(id));
            })
            .withMessage("Invalid allBookIds"),
        body("bookGenres").optional().isArray(),
        body("bookAuthors").optional().isArray(),
        body("discount_region").optional().isArray(),
        body("discountValue")
            .isFloat({ min: 0, max: 80 })
            .withMessage(
                "Discount value must be a number greater than or equal to 0 and smaller then 80"
            ),
        body("activationDate")
            .isISO8601({ strict: true })
            .withMessage("Activation date must be a valid ISO 8601 date"),
        body("endDate")
            .isISO8601({ strict: true })
            .withMessage("End date must be a valid ISO 8601 date"),
        body("isActivated").optional().isBoolean().toBoolean(),
        body("isDisabled").optional().isBoolean().toBoolean(),
    ],
};

const CartValidator = {
    addToCartValidator: [
        body("bookId")
            .exists()
            .withMessage("Book id required")
            .bail()
            .isString()
            .withMessage("Book id must be a string")
            .bail()
            .isMongoId()
            .withMessage("Book id must be a MongoId"),
        body("quantity")
            .exists()
            .withMessage("quantity is required")
            .bail()
            .isInt({
                min: 1,
                max: 20,
            })
            .withMessage(
                "quantity must be a number and cannot be grater then 20 or smaller then 1"
            ),
    ],
};

const WalletValidator = {
    topupValidation: [
        body("amount")
            .isNumeric()
            .withMessage("Amount must be a number")
            .bail()
            .isInt({
                min: 10,
                max: 500,
            })
            .withMessage("Amount must be min 10 and max 500"),
    ],
};

const TransectionValidator = {
    viewTransectionVal: [
        query("latest")
            .optional()
            .isBoolean()
            .withMessage("Latest must be a boolean value"),

        query("sortType")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage('SortType must be "asc" or "desc" if provided'),

        query("sortKey")
            .optional()
            .isIn(["createdAt", "total"])
            .withMessage("SortKey must be a valid field name"),
        query("limit")
            .optional()
            .isNumeric()
            .withMessage("Limit must be a number")
            .bail()
            .isInt({
                min: 2,
                max: 20,
            })
            .withMessage("Limit can not be more then 20 and less then 2"),
    ],
};

module.exports = {
    userValidator,
    bookValidator,
    AdminValidator,
    ReviewsValidator,
    DiacountValidators,
    CartValidator,
    WalletValidator,
    TransectionValidator,
};
