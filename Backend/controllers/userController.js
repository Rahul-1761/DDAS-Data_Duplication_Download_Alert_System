const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();
const randomstring = require("randomstring");

const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error.message);
  }
};

// Function to send verification email
const sendVerifyMail = async (name, email, user_id) => {
  try {
    console.log(`Sending verification email to ${email}...`);
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
      subject: "Email Verification",
      html: `<p>Hi ${name}, please click <a href="http://localhost:3000/verify?id=${user_id}">here</a> to verify your email.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.log("Error sending verification email:", error.message);
  }
};

// Function to send password reset email
const sendResetPasswordMail = async (name, email, token) => {
  try {
    console.log(`Sending password reset email to ${email}...`);
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
      subject: "Password Reset",
      html: `<p>Hi ${name}, please click <a href="http://localhost:3000/forget-password?token=${token}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully.");
  } catch (error) {
    console.log("Error sending password reset email:", error.message);
  }
};

// Register User
const insertUser = async (req, res) => {
  try {
    const hashedPassword = await securePassword(req.body.password);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: hashedPassword,
      is_admin: 0,
    });

    const userData = await user.save();
    console.log("User registered successfully:", userData);

    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      return res.status(201).json({
        success: true,
        message: "Registration successful. Please verify your email.",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Registration failed." });
    }
  } catch (error) {
    console.log("Error registering user:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_varified: 1 } }
    );
    console.log("Email verification status updated:", updateInfo);

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    console.log("Error verifying email:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_varified === 0) {
          console.log("User email not verified.");
          return res.status(401).json({
            success: false,
            message: "Please verify your email first.",
          });
        }
        req.session.user_id = userData._id;
        req.session.is_admin = userData.is_admin;
        console.log("Login successful.");
        return res
          .status(200)
          .json({ success: true, message: "Login successful." });
      }
    }
    console.log("Invalid login attempt.");
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  } catch (error) {
    console.log("Error during login:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout User
const userLogout = async (req, res) => {
  try {
    console.log("Logging out user...");
    req.session.destroy();
    res.status(200).json({ success: true, message: "Logout successful." });
  } catch (error) {
    console.log("Error during logout:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
const forgetVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const userData = await User.findOne({ email });

    if (userData) {
      if (userData.is_varified === 0) {
        console.log("User email not verified.");
        return res
          .status(400)
          .json({ success: false, message: "Please verify your email first." });
      }

      const token = randomstring.generate();
      await User.updateOne({ email }, { $set: { token } });

      sendResetPasswordMail(userData.name, userData.email, token);
      console.log("Password reset link sent.");
      return res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email.",
      });
    }

    console.log("Email does not exist.");
    return res
      .status(400)
      .json({ success: false, message: "Email does not exist." });
  } catch (error) {
    console.log("Error processing forgot password:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { password, user_id } = req.body;
    const secure_password = await securePassword(password);

    await User.findByIdAndUpdate(user_id, {
      $set: { password: secure_password, token: "" },
    });
    console.log("Password reset successfully.");

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.log("Error resetting password:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Verification Link Again
const sentVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      sendVerifyMail(user.name, user.email, user._id);
      console.log("Verification Link Sent Again");
      return res
        .status(200)
        .json({ success: true, message: "Verification email sent again." });
    }

    console.log("User not found with email:", email);
    return res
      .status(400)
      .json({ success: false, message: "Email does not exist." });
  } catch (error) {
    console.error("Error in sentVerificationLink:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit Profile
const updateProfile = async (req, res) => {
  try {
    const updateData = req.file
      ? { name: req.body.name, image: req.file.filename }
      : { name: req.body.name };

    console.log("Update Data:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      req.body.user_id,
      { $set: updateData },
      { new: true }
    );

    console.log("Updated User:", updatedUser);

    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  insertUser,
  verifyMail,
  verifyLogin,
  userLogout,
  forgetVerify,
  resetPassword,
  sentVerificationLink,
  updateProfile,
};
