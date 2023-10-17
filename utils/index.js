const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OTPGenerator = require('otp-generator');
const fs = require('fs');
const path = require('path');




const hashedPassword = async (password) => {
    return await bcrypt.hash(password, 12);
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

const generateToken = (id, role, email) => {
    return jwt.sign({ id, role, email }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
};

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

async function createFolderIfNotExists(folderPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function moveFileToFolder(file, folderName) {
    const destinationPath = folderName
    console.log("destinationPath", destinationPath)

    return new Promise((resolve, reject) => {
        fs.rename(file.path, destinationPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(destinationPath);
            }
        });
    });
}





module.exports = {
    hashedPassword,
    comparePassword,
    generateToken,
    generateOtp,
    createOtp,
    createFolderIfNotExists,
    moveFileToFolder,

}