import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import predictRoute from "./routes/predict.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

// Serve assets (fallback image)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/api", predictRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
