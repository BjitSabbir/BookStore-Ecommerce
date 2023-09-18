const express = require('express');
const { register, login ,verifyEmail, reqForOtp } = require('../controllers/AuthControllers');
const route = express();

route.post('/register', register)
route.get('/requestOtp', reqForOtp)
route.post('/login', login)
route.post('/verifyEmail', verifyEmail)




module.exports = route