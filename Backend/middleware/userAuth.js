import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Unauthorized access, Please login again",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      // req.body.userId = tokenDecode.id;
      req.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Unauthorized access, Please login again",
      });
    }

    next(); // Call that controller function which is actually dedicated to the particuular route,
    // we just added a middleware function to check if the user is authenticated or not, if yes then we will call the next() function to call the controller function dedicated to that route.
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
