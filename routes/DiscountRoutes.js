const express = require("express");
const {
    createDiscount,
    getDiscount,
    updateDiscount,
    deleteDiscount,
    disableDiscount,
    getAllDiscount,
} = require("../controllers/DiscountControllers");
const routes = express.Router();
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const checkDiscountMiddleware = require("../middleware/DiscountMiddleware");
const {
    DiacountValidators,
} = require("../database/validation/inputValidationSchema");
const { route } = require("./WalletRoutes");

routes.post(
    "/add",
    DiacountValidators.createDiscountValidaor,
    checkDiscountMiddleware,
    verifyTokenMiddleware,
    createDiscount
);
routes.get("/get/:id", verifyTokenMiddleware, getDiscount);
routes.put(
    "/update/:id",
    DiacountValidators.createDiscountValidaor,
    verifyTokenMiddleware,
    updateDiscount
);
routes.delete("/remove/:id", verifyTokenMiddleware, deleteDiscount);
routes.put("/disable/:id", verifyTokenMiddleware, disableDiscount);
routes.get("/all", verifyTokenMiddleware, getAllDiscount);

module.exports = routes;
