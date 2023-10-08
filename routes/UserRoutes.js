const express = require("express");
const route = express.Router();
const verifyTokenMiddleware = require("../middleware/AuthMiddleware");

// update user route
const { updateUser, getUser } = require("../controllers/UserControllers");

// update user route
route.get("/profile", verifyTokenMiddleware, getUser);
route.put("/profile/update", verifyTokenMiddleware, updateUser);

module.exports = route;
