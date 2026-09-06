import app from "./api/index.js";

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// import express from "express";
// import cors from "cors";
// import "dotenv/config.js";
// import cookieParser from "cookie-parser";
// import dns from "dns"; // this is used to resolve the hostname to an IP address
// import connectDB from "./config/mongodb.js";
// import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoutes.js";

// // Set the DNS server to Google's public DNS server, Because
// // some ISPs may block certain DNS servers, which can cause issues with resolving hostnames. By using a reliable DNS server like Google's, we can ensure that the hostname is resolved correctly.
// if (process.env.NODE_ENV !== "production") {
//   dns.setServers(["8.8.8.8"]);
// }

// const app = express();
// const PORT = process.env.PORT || 5000;
// connectDB();

// const allowedOrigins = [
//   "http://localhost:5173",
//   process.env.FRONTEND_URL,
// ].filter(Boolean);

// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ credentials: true, origin: allowedOrigins }));

// // API Endpoints
// app.get("/", (req, res) => {
//   res.send("Hello, Anuj Pal!");
// });

// app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
