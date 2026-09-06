import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  sendVerifyOtp,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp); // Add the userAuth middleware to the sendVerifyOtp route
authRouter.post("/verify-email", userAuth, verifyEmail); // After getting the OTP from the user, we will verify it using this route, so we will add the userAuth middleware to this route as well.
authRouter.get("/is-auth", userAuth, isAuthenticated); // Add the userAuth middleware to the isAuthenticated route
authRouter.post("/send-reset-otp", sendResetOtp); // Add the userAuth middleware to the sendResetOtp route
authRouter.post("/reset-password", resetPassword); // Add the userAuth middleware to the resetPassword route

export default authRouter;
