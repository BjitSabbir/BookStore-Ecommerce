const cron = require("node-cron");
const mongoose = require("mongoose");
const DiscountModel = require("./../database/models/DiscountModel.js");
const BookModel = require("../database/models/BookModel.js");

const activateDiscounts = async (discounts, bookModel) => {
    console.log("activating discounts");
    for (const discount of discounts) {
        for (const bookId of discount.allBookIds) {
            const book = await bookModel.findOne({
                _id: bookId,
            });
            if (book) {
                await book.activateDiscount({
                    discountValue: discount.discountValue,
                    discountId: discount._id,
                    discount_region: discount.discount_region,
                });
            }
        }
        await DiscountModel.updateOne(
            { _id: discount._id },
            { isActivated: true }
        );
    }
};

const deactivateDiscounts = async (discounts, bookModel) => {
    console.log("deactivating discounts");
    for (const discount of discounts) {
        for (const bookId of discount.allBookIds) {
            const book = await bookModel.findOne({
                _id: bookId,
                isDiscountActive: true,
            });
            if (book) {
                await book.deactivateDiscount({ discountId: discount._id });
            }
        }
        await DiscountModel.updateOne(
            { _id: discount._id },
            { isActivated: false }
        );
    }
};

// Every Second: "* * * * * *"
// Every Minute: "* * * * *"
// Every 30 Minutes: "*/30 * * * *"
// Every Hour: "0 * * * *"
// Every Day: "0 0 * * *"
// Every Week: "0 0 * * 0"

const startDiscountScheduler = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();

            // Activating discounts
            const discountsToActivate = await DiscountModel.find({
                $and: [
                    { activationDate: { $lte: now } },
                    { isActivated: false },
                    { endDate: { $gte: now } },
                    { isDisabled: false },
                ],
            });

            if (discountsToActivate.length > 0) {
                await activateDiscounts(discountsToActivate, BookModel);
            }

            // Deactivating discounts
            const discountsToDeactivate = await DiscountModel.find({
                $and: [
                    { endDate: { $lte: now } },
                    { isActivated: true },
                    { isDisabled: false },
                ],
            });

            if (discountsToDeactivate.length > 0) {
                await deactivateDiscounts(discountsToDeactivate, BookModel);
            }

            // console.log(
            //     "Discount scheduler ran at",
            //     discountsToActivate,
            //     discountsToDeactivate
            // );
        } catch (error) {
            console.error("Error updating discounts:", error);
        }
    });
};

module.exports = startDiscountScheduler;
