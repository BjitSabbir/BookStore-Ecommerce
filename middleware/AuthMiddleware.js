const jwt = require('jsonwebtoken');
const { NOT_FOUND } = require('../constants/statusCode');
const { errorMessage } = require('../utils/app-errors');

const verifyTokenMiddleware = async (req, res, next) => {
    const token = req.headers['x-auth-token'];
    if (!token) {
        return res.status(NOT_FOUND).send(errorMessage("No token provided"));
    }else{
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(NOT_FOUND).send(errorMessage(error));
        }
    }
}

module.exports = verifyTokenMiddleware