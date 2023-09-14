require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { databaseConnection } = require('./database/dbConnection');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");


app.use("",(req, res)=>{
    return res.render("notFound.ejs")
})


databaseConnection(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
