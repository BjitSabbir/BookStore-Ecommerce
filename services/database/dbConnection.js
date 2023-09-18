const mongoose = require('mongoose');

const databaseConnection = async (callback) => {
    try{
        const client = await mongoose.connect(process.env.MONGODB_URI);
        if(client){
            console.log("Connected to MongoDB");
            callback();
        }else{
            console.log("Error connecting to MongoDB");
        }

    }catch(error){
        console.log(error);

    }
}

module.exports = {
    databaseConnection
}