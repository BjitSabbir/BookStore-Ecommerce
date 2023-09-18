const express = require("express");
const {
    addUserTransection,
    getUserTransaction,
} = require("../controllers/TransectionControllers");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const route = express.Router();

route.post("/", verifyTokenMiddleware, addUserTransection);
route.get("/", verifyTokenMiddleware, getUserTransaction);

module.exports = route;
