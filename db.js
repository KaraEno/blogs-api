const mongoose = require("mongoose");
require("dotenv").config();

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

function connectDB() {
  try {
    mongoose.connect(dbURI);
    mongoose.connection.on("connected", () =>
      console.log("MongoDB connected successfully")
    );
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };
