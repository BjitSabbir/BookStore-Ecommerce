const { body, query, param } = require("express-validator");

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
    ]
    ,
    verifyOnlyEmail: [
        body("email")
            .exists()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Invalid email")
            .bail()
            .isLength({ min: 3 })
            .withMessage("Password must be at least 6 characters")


    ]
}

const bookValidator = {
    addOneBook: [
        body("book_id")
            .exists()
            .withMessage("Book id is required")
            .bail()
            .withMessage("Book id must be a number")
            .bail()
            .isNumeric()
            .withMessage("Book id must be a number"),
        body("title")
            .exists()
            .withMessage("Title is required")
            .bail()
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
            .withMessage("Price must be a number"),
        body("discount_percentage")
            .optional()
            .isNumeric()
            .withMessage("Discount percentage must be a number"),
        body("genre")
            .optional()
            .isString()
            .withMessage("Genre must be a string"),
        body("isbn")
            .optional()
            .isString()
            .withMessage("ISBN must be a string"),
        body("discount_region")
            .optional()
            .isArray()
            .withMessage("Discount region must be an array"),
        body("stock_quantity")
            .optional()
            .isNumeric()
            .withMessage("Stock quantity must be a number"),
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
            .withMessage("Price must be a number"),
        
        body("discount_percentage")
            .optional()
            .isNumeric()
            .withMessage("Discount percentage must be a number"),
        
        body("genre")
            .optional()
            .isString()
            .withMessage("Genre must be a string"),
        
        body("isbn")
            .optional()
            .isString()
            .withMessage("ISBN must be a string"),
        
        body("discount_region")
            .optional()
            .isArray()
            .withMessage("Discount region must be an array"),
        
        body("stock_quantity")
            .optional()
            .isNumeric()
            .withMessage("Stock quantity must be a number"),
    ]
    

}

const AdminValidator = {
    viewTransection: [
        query("page")
            .optional()
            .isNumeric()
            .withMessage("Page must be a number"),
        query("limit")
            .optional()
            .isNumeric()
            .withMessage("Limit must be a number"),
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
            .withMessage("User id must be a valid mongo id")

    ],
    editUser: [
        param('userId')
            .isMongoId()
            .withMessage('User id must be a valid mongo id'),

        body('username')
            .optional()
            .isString()
            .withMessage('Username must be a string'),

        body('email')
            .optional()
            .isEmail()
            .withMessage('Email must be a valid email address'),

        body('isActiveUser')
            .optional()
            .isBoolean()
            .withMessage('isActiveUser must be a boolean'),

        body('address')
            .optional()
            .isString()
            .withMessage('Address must be a string'),

        body('phone')
            .optional()
            .isString()
            .withMessage('Phone must be a string'),


    ],
    deleteUser: [

    ]
}

module.exports = {
    userValidator,
    bookValidator,
    AdminValidator
};
