const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const File = require("../models/fileModel");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "For Reset Password ",
      html:
        "<p>Hi, " +
        name +
        ', please click here to <a href="http://localhost:3000/admin/forget-password?token=' +
        token +
        '"> Reset </a> your password. </p>',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//for send mail
const addUserMail = async (name, email, password, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "Admin Added you and verify your mail",
      html:
        "<p>Hi, " +
        name +
        ', please click here to <a href="http://localhost:3000/verify?id=' +
        user_id +
        '"> Verify </a> your mail. </p> <br><br> <b>Email:-</b>' +
        email +
        "<br><b>Password:-</b>" +
        password +
        "<br> Please Reset Your Password ",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "Email or Password is incorrect" });
        } else {
          req.session.user_id = userData._id;
          req.session.is_admin = userData.is_admin;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "Email or Password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email or Password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });

    const uploadedFiles = await File.find({
      uploadedBy: req.session.user_id,
    }).sort({ createdAt: -1 });

    res.render("home", { admin: userData, files: uploadedFiles });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.is_admin === 0) {
        res.render("forget", { message: "Email is Incorrect" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );

        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("forget", {
          message: "Please Check Your mail to reset your password.",
        });
      }
    } else {
      res.render("forget", { message: "Email is Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;

    const tokenData = await User.findOne({ token: token });

    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Invalid Link" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const securePass = await securePassword(password);

    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: securePass, token: "" } }
    );

    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const adminDashboard = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });

    res.render("dashboard", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

// Add New User

const newUserLoad = async (req, res) => {
  try {
    res.render("new-user");
  } catch (error) {
    console.log(error.message);
  }
};

const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mno = req.body.mno;
    const image = req.file.filename;
    const password = randomstring.generate(8);

    const spassword = await securePassword(password);

    const user = new User({
      name: name,
      email: email,
      mobile: mno,
      image: image,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      addUserMail(name, email, password, userData._id);
      res.redirect("/admin/dashboard");
    } else {
      res.render("new-user", { message: "Something Wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//edit user functionality
const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });

    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateUsers = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mno,
          is_varified: req.body.verify,
        },
      }
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const newFile = new File({
      originalName: req.file.originalname,
      storedName: req.file.filename, // ✅ THIS is important
      fileType: req.file.mimetype,
      size: req.file.size,
      path: "/uploadedFiles/" + req.file.filename,
      uploadedBy: req.session.user_id, // ✅ if you've added this in schema
    });

    await newFile.save();
    res.redirect("/admin/home");
  } catch (error) {
    console.log("File Upload Error:", error);
    res.status(500).send("Upload failed");
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");

    // Delete file from disk
    const filePath = path.join(__dirname, "../public", file.path);
    fs.unlinkSync(filePath);

    // Delete from database
    await File.deleteOne({ _id: req.params.id });

    res.redirect("/admin/home");
  } catch (error) {
    console.log("Delete Error:", error);
    res.status(500).send("File deletion failed.");
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUsers,
  deleteUser,
  uploadFile,
  deleteFile,
};
