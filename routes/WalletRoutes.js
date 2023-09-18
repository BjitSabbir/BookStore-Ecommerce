const express = require("express");
const {
    getWalletStatus,
    topupWallet,
    getWalletTransactions,
} = require("../controllers/WalletControllers");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const route = express.Router();

route.get("/", verifyTokenMiddleware, getWalletStatus);
route.post("/topup", verifyTokenMiddleware, topupWallet);
route.get("/transections", verifyTokenMiddleware, getWalletTransactions);

module.exports = route;
