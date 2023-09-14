require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/dbConnection');
const { NOT_FOUND,OK } = require('./constants/statusCode');
const { successMessage } = require('./utils/app-errors');
const AuthRoutes = require('./routes/AuthRoutes');
const BookRoutes = require('./routes/BookRoutes');
const ReviewRoutes = require('./routes/ReviewRoutes');



const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: '1mb'}));
app.use(express.urlencoded({ extended: true, limit: '1mb'}));
app.use(cors());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.status(OK).send(successMessage("Welcome to BookStore Ecommerce"));	
})




app.use("/auth", AuthRoutes);
app.use("/books", BookRoutes)
app.use("/reviews",ReviewRoutes)
// app.use("",(req, res)=>{
//     return res.status(NOT_FOUND).render("notFound.ejs")
// })


databaseConnection(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
