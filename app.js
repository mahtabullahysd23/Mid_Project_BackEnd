const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const connectDB = require("./config/database");
const response = require("./utility/common");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors({origin:'*'}));
const AuthRouter = require("./routers/Auth");
const BookRouter = require("./routers/Book");
const CartRouter = require("./routers/Cart");
const TransactionRouter = require("./routers/Transaction");
const ReviewRouter = require("./routers/Review");
const WalletRouter = require("./routers/Wallet");
const UserRouter = require("./routers/User"); 
const DiscountRouter = require("./routers/Discount");


app.use("/api/auth", AuthRouter);
app.use("/api/books", BookRouter);
app.use("/api/cart", CartRouter);
app.use("/api/transaction", TransactionRouter);
app.use("/api/reviews", ReviewRouter); 
app.use("/api/wallet", WalletRouter);
app.use("/api/user", UserRouter);
app.use("/api/discount", DiscountRouter);


app.use((req, res) => {
    return response(res, 404, "Not Found");
  });

connectDB(() => {
  app.listen(process.env.PORT, () => {
    console.log('Example app listening on port 8000!');
});
});

