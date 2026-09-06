import userModel from "../models/userModel.js";

// This route is to get the users data using userAuth Middleware.

export const getUserData = async (req, res) => {
  try {
    // const { userId } = req.body;
    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
