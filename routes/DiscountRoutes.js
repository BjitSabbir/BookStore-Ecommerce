const express = require('express');
const { addDiscount } = require('../controllers/DiscountControllers');
const routes = express.Router();

routes.post('/addDiscount',addDiscount)

module.exports = routes