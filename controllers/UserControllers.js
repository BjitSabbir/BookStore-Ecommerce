const { successMessage, errorMessage } = require("../utils/app-errors");
const {
    OK,
    NOT_FOUND,
    BAD_REQUEST, // Add the missing import for BAD_REQUEST
    CREATED,
} = require("./../constants/statusCode");

const UserModel = require("../database/models/UserModel");

class UserControllers {
    async updateUser(req, res) {
        const userId = req.user.userId;
        const { name, address, phone } = req.body;

        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("User not found"));
            }

            // Update only the 'name' property if provided in the request
            if (name !== undefined) {
                user.name = name;
            }

            // Update 'address' and 'phone' properties if provided in the request
            if (address !== undefined) {
                user.address = address;
            }

            if (phone !== undefined) {
                user.phone = phone;
            }

            // Save the updated user
            await user.save();

            return res.status(OK).send(successMessage("User updated"));
        } catch (err) {
            console.error(err);
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Failed to update user"));
        }
    }

    async getUser(req, res) {
        const userId = req.user.userId;
        console.log(userId);

        try {
            const user = await UserModel.findById(userId);

            if (!user) {
                return res
                    .status(NOT_FOUND)
                    .send(errorMessage("User not found"));
            }

            return res.status(OK).send(successMessage("User found", user));
        } catch (err) {
            console.error(err);
            return res
                .status(BAD_REQUEST)
                .send(errorMessage("Failed to get user data"));
        }
    }
}

module.exports = new UserControllers(); // Don't forget to export the class
