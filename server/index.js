import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import predictRoute from "./routes/predict.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// CORS configuration for production
const corsOptions = {
  origin: [
    "https://open-ai-buildathon-client.onrender.com",
    "https://open-ai-buildathon-sever.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "12mb" }));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Serve assets (fallback image)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Flood Risk Analysis API is running!" });
});

app.use("/api", predictRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
