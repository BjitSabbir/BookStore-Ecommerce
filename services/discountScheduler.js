const cron = require('node-cron');
const mongoose = require('mongoose');
const DiscountModel = require('./../database/models/DiscountModel.js');
const BookModel = require('../database/models/BookModel.js'); // Updated import

const activateDiscounts = async (discounts, bookModel) => {
    for (const discount of discounts) {
        
        if (discount.bookIds.length > 0) {
            for (const bookId of discount.bookIds) {
                const book = await bookModel.findById(bookId);
                if (!book) {
                    await book.activateDiscount({ discountValue: discount.discountValue , discountId : discount._id });
                }
            }
        }

        if (discount.bookGenres.length > 0) {
            for (const bookGenre of discount.bookGenres) {
                const book = await bookModel.findOne({ genre: bookGenre});
                if (book) {
                    await book.activateDiscount({ discountValue: discount.discountValue  , discountId : discount._id });
                }
            }
        }

        if (discount.bookAuthors.length > 0) {
            for (const bookAuthor of discount.bookAuthors) {
                const book = await bookModel.findOne({ authors: bookAuthor });
                if (book) {
                    await book.activateDiscount({ discountValue: discount.discountValue,  discountId : discount._id  });
                } 
            }
        }

        discount.isActivated = true;
        discount.save();
    }
};

const deactivateDiscounts = async (discounts, bookModel) => {
    for (const discount of discounts) {
        if (discount.bookIds.length > 0) {
            for (const bookId of discount.bookIds) {
                const book = await bookModel.findById(bookId);
                if (book && book.isDiscountActive) {
                    await book.deactivateDiscount( { discountId : discount._id } );
                }
            }
        }

        if (discount.bookGenres.length > 0) {
            for (const bookGenre of discount.bookGenres) {
                const book = await bookModel.findOne({ genre: bookGenre });
                if (book && book.isDiscountActive) {
                    await book.deactivateDiscount({ discountId : discount._id } );
                }
            }
        }

        if (discount.bookAuthors.length > 0) {
            for (const bookAuthor of discount.bookAuthors) {
                const book = await bookModel.findOne({ authors: bookAuthor });
                if (book && book.isDiscountActive) {
                    await book.deactivateDiscount({ discountId : discount._id } );
                }
            }
        }
    }
};

const startDiscountScheduler = () => {
    // Every Second: "* * * * * *"
    // Every Minute: "* * * * *"
    // Every 30 Minutes: "*/30 * * * *"
    // Every Hour: "0 * * * *"
    // Every Day: "0 0 * * *"
    // Every Week: "0 0 * * 0"

    cron.schedule('0 * * * *', async () => {
    
        try {
            const now = new Date();

            // Activating discounts
            
            const discountsToActivate = await DiscountModel.find({
                $and :[
                    {activationDate: { $lte: now }},
                    { isActivated : false}
                ]
            });
        
            if (discountsToActivate.length > 0) {
                await activateDiscounts(discountsToActivate, BookModel);
            }

            // Deactivating discounts
            const discountsToDeactivate = await DiscountModel.find({
                $and :[
                    { endDate: { $lte: now }},
                    { isActivated : true}
                ]
               
            });

            if (discountsToDeactivate.length > 0) {
                await deactivateDiscounts(discountsToDeactivate, BookModel);
            }

            console.log('Discount scheduler ran at', discountsToActivate,discountsToDeactivate);

        } catch (error) {
            console.error('Error updating discounts:', error);
        }
    });
};

module.exports = startDiscountScheduler;
