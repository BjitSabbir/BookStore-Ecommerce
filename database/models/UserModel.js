const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    isActiveUser:{
        type: Boolean,
        required: false,
        default: true
    },
    address :{
        type: String
    },
    phone: {
        type: String 
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
},{
    timestamps : true
})

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;