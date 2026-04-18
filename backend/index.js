// index.js

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
// import csrf from "csurf";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";


// Load env variables
dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100000, // limit each IP
  message: "Too many requests, try again later",
});

// Connect DB
connectDB();

// Init app
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_API, 
    credentials: true, 
  })
);

// Middleware
app.use(helmet());
// app.use(mongoSanitize()); // prevents Mongo injection
// app.use(xss()); // prevents XSS
// app.use(csrf());
app.use(morgan("dev"));
app.use("/api", limiter);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(
  session({
    name: "sessionId",
    secret: process.env.SESSION_SECRET || "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// API Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});