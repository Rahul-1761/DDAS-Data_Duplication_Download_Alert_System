const express = require("express");
const admin_route = express();
const session = require("express-session");

const config = require("../config/config");

admin_route.use(session({ secret: config.SESSIONSECRET }));

const auth = require("../middleware/adminAuth");

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

const multer = require("multer");
const path = require("path");

admin_route.use(express.static("public"));

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

const fileUploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploadedFiles"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const fileUploader = multer({ storage: fileUploadStorage });

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

const adminController = require("../controllers/adminController");

admin_route.get("/", auth.isLogout, adminController.loadLogin);
admin_route.get("/admin", auth.isLogout, adminController.loadLogin);

admin_route.post("/", adminController.verifyLogin);

admin_route.get("/home", auth.isLogin, adminController.loadDashboard);

admin_route.get("/logout", auth.isLogin, adminController.logout);

admin_route.get("/forget", auth.isLogout, adminController.forgetLoad);

admin_route.post("/forget", adminController.forgetVerify);

admin_route.get(
  "/forget-password",
  auth.isLogout,
  adminController.forgetPasswordLoad
);

admin_route.post("/forget-password", adminController.resetPassword);

admin_route.get("/dashboard", auth.isLogin, adminController.adminDashboard);

admin_route.get("/new-user", auth.isLogin, adminController.newUserLoad);

admin_route.post("/new-user", upload.single("image"), adminController.addUser);

admin_route.get("/edit-user", auth.isLogin, adminController.editUserLoad);

admin_route.post("/edit-user", adminController.updateUsers);

admin_route.get("/delete-user", auth.isLogin, adminController.deleteUser);

admin_route.use(
  "/uploadedFiles",
  express.static(path.join(__dirname, "../public/uploadedFiles"))
);

admin_route.post(
  "/upload-file",
  auth.isLogin,
  fileUploader.single("uploadedFile"),
  adminController.uploadFile
);

admin_route.post("/delete-file/:id", auth.isLogin, adminController.deleteFile);

admin_route.get("*", function (req, res) {
  res.redirect("/admin");
}); // always at last

module.exports = admin_route;
