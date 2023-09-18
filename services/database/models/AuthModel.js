const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {  // Corrected the typo from "isVarified" to "isVerified"
        type: Boolean,
        required: true,
        default: false
    },
    role: {
        type: Number,
        required: true,
        default: 2,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    authOtp: [{
        otp: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        endAt: {
            type: Date
        }
    }]
});

const AuthModel = mongoose.model('Auth', AuthSchema);
module.exports = AuthModel;
