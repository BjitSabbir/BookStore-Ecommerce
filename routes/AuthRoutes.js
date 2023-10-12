const express = require("express");
const {
    register,
    login,
    verifyEmail,
    reqForOtp,
} = require("../controllers/AuthControllers");
const {
    userValidator,
} = require("../database/validation/inputValidationSchema");
const route = express();

route.post("/register", userValidator.register, register);
route.post("/requestOtp", userValidator.verifyOnlyEmail, reqForOtp);
route.post("/login", userValidator.register, login);
route.post("/verifyEmail", userValidator.verifyEmail, verifyEmail);

module.exports = route;
