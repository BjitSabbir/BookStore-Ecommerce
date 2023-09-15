const express = require('express');
const { createDiscount, getDiscount, updateDiscount, deleteDiscount } = require('../controllers/DiscountControllers');
const routes = express.Router();
const verifyTokenMiddleware = require('../middleware/AuthMiddleware');

// Create a new discount
routes.post('/add',verifyTokenMiddleware, createDiscount);

// Get a specific discount by ID
routes.get('/add/:id', getDiscount);

// Update a discount by ID
routes.put('/update/:id', updateDiscount);

// Delete a discount by ID
routes.delete('/remove/:id', deleteDiscount);

module.exports = routes;
