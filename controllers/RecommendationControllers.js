const User = require("../database/models/UserModel");
const { successMessage } = require("../utils/app-errors");
const { OK } = require("../constants/statusCode");
const ReviewModel = require("../database/models/ReviewModel");
const UserModel = require("../database/models/UserModel");
const BookModel = require("../database/models/BookModel");


function calculateSimilarity(userAReviews, userBReviews) {

    // const similarity = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    return similarity;
}


async function generateRecommendations(req, res) {
    const userId = req.body.userId;
    const numRecommendations = req.body.numRecommendations;
  
   try{
       const user = await UserModel.findById(userId);
       if(!user){
           return res.status(NOT_FOUND).send(errorMessage("User not found"));
       }
       const userReviews = await ReviewModel.find({userId: userId , rating : {$gte : 4}}).sort({rating : -1}).limit(5);
       const othersReviews = await ReviewModel.find({userId: {$ne : userId}, rating : {$gte : 4}}).limit(20)

       




       if(!userReviews){
           return res.status(NOT_FOUND).send(errorMessage("No reviews found for this user"));
       }


       return res.status(OK).send(successMessage("Recommendations generated successfully", othersReviews));
   }
   catch(error){
       return res.status(INTERNAL_SERVER_ERROR).send(errorMessage("Internal server error"));
   }
  }
  
  
  module.exports = generateRecommendations
  

