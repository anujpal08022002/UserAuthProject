import express from "express";
import cors from "cors";
import "dotenv/config.js";
import cookieParser from "cookie-parser";
import dns from "dns";
import connectDB from "../config/mongodb.js";
import authRouter from "../routes/authRoutes.js";
import userRouter from "../routes/userRoutes.js";

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8"]);
}

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: allowedOrigins }));

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req, res) => {
  res.send("Hello, Anuj Pal!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

export default app;

// import app from "../../server.js";
// export default app;
