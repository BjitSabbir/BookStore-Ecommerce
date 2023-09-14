const ReviewModel = require('../database/models/ReviewModel');
const UserModel = require('../database/models/UserModel');
const BooksModel = require('../database/models/BooksModel');
const { successMessage, errorMessage } = require('../utils/app-errors');
const { OK, NOT_FOUND, FORBIDDEN, CREATED } = require('./../constants/statusCode');


class ReviwControllers{
    
    async addRatingsToBooks(req, res){
        if(req.user.role===1){
            return res.status(FORBIDDEN).send(errorMessage("You are logged in as admin"));
        }else{
            const user = UserModel.findById(req.user.userId);
console.log(req.user)


            if(!user){
                return res.status(NOT_FOUND).send(errorMessage("User not found"));
            }else{
                const book = await BooksModel.findById(req.body.bookId);
                if(!book){
                    return res.status(NOT_FOUND).send(errorMessage("Book not found"));
                }else{
                    const review = await ReviewModel.create({
                        userId: req.body.userId,
                        bookId: req.body.bookId,
                        rating: req.body.rating,
                        comment: req.body.comment
                    });
                    book.reviews.push(review._id);
                    await book.save();
                    return res.status(CREATED).send(successMessage("Review added successfully",await book.populate({
                        path: 'reviews',
                    })));
                   
                }
            }

        }
    }

}

module.exports = new ReviwControllers()