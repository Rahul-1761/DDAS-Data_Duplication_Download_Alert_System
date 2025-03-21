const mongoose = require("mongoose");

require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed", err);
    process.exit(1);
  }
})();

const express = require("express");
const app = express();

//for user routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

app.listen(3000, function () {
  console.log("Server is Running ...");
});
