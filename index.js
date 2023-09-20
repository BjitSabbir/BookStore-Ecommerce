require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const { databaseConnection } = require("./database/dbConnection");
const { NOT_FOUND, OK } = require("./constants/statusCode");
const { successMessage } = require("./utils/app-errors");
const AuthRoutes = require("./routes/AuthRoutes");
const BookRoutes = require("./routes/BookRoutes");
const ReviewRoutes = require("./routes/ReviewRoutes");
const DiscountRoutes = require("./routes/DiscountRoutes");
const CartRoutes = require("./routes/CartRoutes");
const TransactionRoutes = require("./routes/TransectionRoutes");
const WalletRoutes = require("./routes/WalletRoutes");
const GetRecommendationRoute = require("./routes/GetRecommendationRoute");
const AdminRoutes = require("./routes/AdminRoutes");
const startDiscountScheduler = require("./services/discountScheduler");
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;
const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' });


app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));

app.set("view engine", "ejs");



app.get("/", (req, res) => {
    res.status(OK).send(successMessage("Welcome to BookStore Ecommerce"));
});

app.use("/auth", AuthRoutes);
app.use("/books", BookRoutes);
app.use("/reviews", ReviewRoutes);
app.use("/admin/discount", DiscountRoutes);
app.use("/user/cart", CartRoutes);
app.use("/user/wallet", WalletRoutes);
app.use("/user/transactions", TransactionRoutes);
app.use("/user/recommendations", GetRecommendationRoute);
app.use("/admin",AdminRoutes)

app.use("",(req, res)=>{
    return res.status(NOT_FOUND).render("notFound.ejs")
})

databaseConnection(() => {
    startDiscountScheduler();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
