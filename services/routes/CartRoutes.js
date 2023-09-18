const express = require("express");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCart,
} = require("../controllers/CartControllers");
const route = express();
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");

route.get("/", verifyTokenMiddleware, getCart);
route.post("/add", verifyTokenMiddleware, addToCart);
route.put("/update", verifyTokenMiddleware, updateCartItem);
route.delete("/remove", verifyTokenMiddleware, removeCart);

module.exports = route;
