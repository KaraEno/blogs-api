const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { connectDB } = require("./db");
require("./middleware/authentication");

const blogRouter = require("./routes/blog");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT;

connectDB();

app.set("views", "views");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", authRouter);
app.use("/blogs", blogRouter);

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Blog API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
