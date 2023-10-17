const express = require("express");
const {
    register,
    login,
    verifyEmail,
    reqForOtp,
    requestPasswordReset,
    resetPassword,
    checkPasswordResetToken
} = require("../controllers/AuthControllers");
const {
    userValidator,
} = require("../database/validation/inputValidationSchema");
const route = express();

route.post("/register", userValidator.register, register);
route.post("/requestOtp", userValidator.verifyOnlyEmail, reqForOtp);
route.post("/login", userValidator.register, login);
route.post("/verifyEmail", userValidator.verifyEmail, verifyEmail);
//requestPasswordReset
route.post("/requestPasswordReset", requestPasswordReset)
route.post("/resetPassword", resetPassword)
route.post("/checkPasswordResetToken", checkPasswordResetToken)


module.exports = route;
