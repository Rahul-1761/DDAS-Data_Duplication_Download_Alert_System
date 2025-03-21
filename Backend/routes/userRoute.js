const express = require("express");
const user_route = express();
const session = require("express-session");
const config = require("../config/config");

user_route.use(session({ secret: config.SESSIONSECRET }));

const auth = require("../middleware/auth");

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const multer = require("multer");
const path = require("path");

user_route.use(express.static("public"));

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: fileStorage });

const userController = require("../controllers/userController");

// User registration and verification
user_route.post("/register", upload.single("image"), userController.insertUser);
user_route.get("/verify", userController.verifyMail);
user_route.post("/verification", userController.sentVerificationLink);

// Login and Logout
user_route.get("/", auth.isLogout, userController.verifyLogin);
user_route.get("/login", auth.isLogout, userController.verifyLogin);
user_route.post("/login", userController.verifyLogin);
user_route.get("/logout", auth.isLogin, userController.userLogout);

// Password recovery
user_route.get("/forget", auth.isLogout);
user_route.post("/forget", userController.forgetVerify);
user_route.get("/forget-password", auth.isLogout);
user_route.post("/forget-password", userController.resetPassword);

// Profile management
user_route.get("/edit", auth.isLogin);
user_route.post("/edit", upload.single("image"), userController.updateProfile);

module.exports = user_route;
