const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    FORBIDDEN,
    CREATED,
} = require("./../constants/statusCode");
const AuthModel = require("../database/models/AuthModel");
const UserModel = require("../database/models/UserModel");
const WalletModel = require("../database/models/wallet/WalletModel");
const {
    hashedPassword,
    comparePassword,
    generateToken,
    createOtp,
} = require("../utils");
const { validationResult } = require("express-validator");

class AuthControllers {
    async register(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        const { email, password } = req.body;
        const user = await AuthModel.findOne({ email });
        if (user) {
            return res
                .status(NOT_FOUND)
                .send(errorMessage("User already exists"));
        } else {
            try {
                const hashedPass = await hashedPassword(password);
                const newUser = new AuthModel({ email, password: hashedPass });
                const otpCreation = await createOtp();
                newUser.authOtp.push(otpCreation);
                await newUser.save();

                return res
                    .status(CREATED)
                    .send(
                        successMessage(
                            "User registered successfully",
                            otpCreation.otp
                        )
                    );
            } catch (error) {
                return res.status(NOT_FOUND).send(errorMessage(error));
            }
        }
    }

    async login(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        const { email, password } = req.body;
        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(NOT_FOUND).send(errorMessage("User not found"));
        } else if (!user.isVerified) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User not verified"));
        } else {
            const isMatch = await comparePassword(password, user.password);
            if (isMatch) {
                console.log(user.role, user.email, user.userId);
                const token = await generateToken(
                    user.userId,
                    user.role,
                    user.email
                );
                const role = user.role;
                const userId = user.userId;
                return res.status(OK).send(
                    successMessage("Login successful", {
                        token,
                        role,
                        userId,
                    })
                );
            } else {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("Invalid credentials"));
            }
        }
    }

    async reqForOtp(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        console.log(req.body);
        const { email } = req.body;
        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(NOT_FOUND).send(errorMessage("User not found"));
        } else if (user.isVerified) {
            return res
                .status(FORBIDDEN)
                .send(errorMessage("User already verified"));
        } else {
            const otpCreation = await createOtp();

            // Save the otp in the database for user
            user.authOtp.push(otpCreation);
            await user.save();
            return res
                .status(OK)
                .send(successMessage("Otp sent successfully", otpCreation.otp));
        }
    }

    async verifyEmail(req, res) {
        const error = validationResult(req).array();
        if (error.length > 0) {
            return res.status(NOT_FOUND).send(errorMessage(error[0].msg));
        }
        const { email, otp } = req.body;
        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(NOT_FOUND).send(errorMessage("User not found"));
        } else {
            //check if user is already verified
            if (user.isVerified) {
                return res
                    .status(FORBIDDEN)
                    .send(errorMessage("User already verified"));
            } else {
                const otpDetail = user.authOtp.find(
                    (otpDetail) => otpDetail.otp === otp
                );

                if (otpDetail) {
                    //check otp expiry
                    const otpExpiry = new Date(otpDetail.endAt);
                    const now = new Date();
                    if (otpExpiry < now) {
                        return res
                            .status(NOT_FOUND)
                            .send(errorMessage("OTP expired"));
                    } else {
                        user.isVerified = true;
                        user.authOtp = [];

                        //create User
                        const newUserDetail = await UserModel.create({
                            email: user.email,
                        });

                        user.userId = newUserDetail._id;

                        if (newUserDetail) {
                            //create wallet
                            const newWallet = await WalletModel.create({
                                userId: newUserDetail._id,
                                balance: 0,
                            });

                            newUserDetail.walletId = newWallet._id;
                            await newUserDetail.save();
                            await user.save();

                            return res
                                .status(OK)
                                .send(
                                    successMessage(
                                        "Email verified successfully"
                                    )
                                );
                        } else {
                            return res
                                .status(NOT_FOUND)
                                .send(errorMessage("Something went wrong"));
                        }
                    }
                } else {
                    return res
                        .status(NOT_FOUND)
                        .send(errorMessage("Invalid OTP"));
                }
            }
        }
    }
}

module.exports = new AuthControllers();
