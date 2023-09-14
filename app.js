const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const connectDB = require("./config/database");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors({origin:'*'}));
const AuthRouter = require("./routers/Auth");

app.use("/auth", AuthRouter);

app.use((req, res) => {
    res.status(404).send(failure("Page Not Found"));
  });

connectDB(() => {
  app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
});

