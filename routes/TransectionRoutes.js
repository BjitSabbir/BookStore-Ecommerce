const express = require("express");
const {
    addUserTransection,
    getUserTransaction,
} = require("../controllers/TransectionControllers");
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");
const {
    TransectionValidator,
} = require("../database/validation/inputValidationSchema");
const route = express.Router();

route.post("/", verifyTokenMiddleware, addUserTransection);
route.get(
    "/",
    TransectionValidator.viewTransectionVal,
    verifyTokenMiddleware,
    getUserTransaction
);

module.exports = route;
