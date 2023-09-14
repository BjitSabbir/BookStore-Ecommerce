const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OTPGenerator = require('otp-generator'); 


// https://github.dev/codergogoi/Grocery_Online_Shopping_App/tree/master/online_shopping_monolithic

const hashedPassword = async (password) => {
    return await bcrypt.hash(password, 12);
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
}

const generateOtp = () => {
    return OTPGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
}


async function createOtp() {
    return {
        otp: generateOtp(),
        createdAt: new Date(),
        endAt: new Date(new Date().getTime() + 5 * 60000), // 5 minutes from now
    };
}



module.exports = {
    hashedPassword,
    comparePassword,
    generateToken,
    generateOtp,
    createOtp
    
}