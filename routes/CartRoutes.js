const express = require("express");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCart,
} = require("../controllers/CartControllers");
const route = express();
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const {
    CartValidator,
} = require("../database/validation/inputValidationSchema");

route.get("/", verifyTokenMiddleware, getCart);
route.post(
    "/add",
    CartValidator.addToCartValidator,
    verifyTokenMiddleware,
    addToCart
);
route.put(
    "/update",
    CartValidator.addToCartValidator,
    verifyTokenMiddleware,
    updateCartItem
);
route.delete("/remove", verifyTokenMiddleware, removeCart);

module.exports = route;
