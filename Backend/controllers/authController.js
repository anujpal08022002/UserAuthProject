import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

// Register a new user controller function

export const register = async (req, res) => {
  const { name, email, password } = req.body; // Destructure the name, email, and password from the request body

  // Check if all required fields are provided or not. If any field is missing,
  // return a JSON response indicating failure and a message to fill all fields.
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }

  try {
    // Check if a user with the provided email already exists in the database
    const existingUser = await userModel.findOne({ email });

    // If a user with the provided email already exists,
    // return a JSON response indicating failure and a message that the user already exists.
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash the password using bcrypt with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance using the userModel with the provided name, email, and hashed password
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await user.save();

    // Generate a JWT token for the newly registered user with an expiration time of 1 hour
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the JWT token in an HTTP-only cookie with appropriate security
    // settings based on the environment (production or development)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.VERCEL_ENV === "production",
      sameSite: process.env.VERCEL_ENV === "production" ? "none" : "strict",
      maxAge: 3600000, // we sets 1 hour for the cookie to expire after 1 hour
    });

    // sending a welcome email to newly registered user using nodemailer transporter
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Our App!",
      text: `Hello ${name},\n\nThank you for registering with our app! you registered successfully with the email: ${email}.\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Login an existing user controller function

export const login = async (req, res) => {
  const { email, password } = req.body; // Destructure the email and password from the request body

  // Check if both email and password are provided. If either is missing,
  // return a JSON response indicating failure and a message to fill all fields.
  if (!email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }

  try {
    // Find a user in the database with the provided email
    const user = await userModel.findOne({ email });

    // If no user is found with the provided email, return a JSON response
    // indicating failure and a message of invalid credentials
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return a JSON response indicating
    // failure and a message of invalid credentials
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate a JWT token for the newly registered user with an expiration time of 1 hour
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the JWT token in an HTTP-only cookie with appropriate security
    // settings based on the environment (production or development)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.VERCEL_ENV === "production",
      sameSite: process.env.VERCEL_ENV === "production" ? "none" : "strict",
      maxAge: 3600000, // we sets 1 hour for the cookie to expire after 1 hour
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Logout a user controller function

export const logout = (req, res) => {
  //
  try {
    // Clear the JWT token cookie by setting it to an empty value and specifying the same security settings
    // as when it was set
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.VERCEL_ENV === "production",
      sameSite: process.env.VERCEL_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Email verification controller function (sending OTP to user's email for verification)

export const sendVerifyOtp = async (req, res) => {
  try {
    // const { userId } = req.body;
    const userId = req.userId; // ✅ changed

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyOtp = otp;

    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Email Verification OTP",
      // text: `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "OTP sent to your email for verification",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Otp verification controller function (verifying the OTP sent to user's email for verification)

export const verifyEmail = async (req, res) => {
  // const { userId, otp } = req.body;
  const userId = req.userId; // if protected by userAuth
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Is Authenticated controller function (checking if the user is authenticated or not)

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// password reset controller function (sending OTP to user's email for password reset)

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;

    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      // text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "OTP sent to your email for password reset",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Password reset controller function (verifying the OTP sent to user's email for password reset)

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
