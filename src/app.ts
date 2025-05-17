import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import imageRoutes from "@/routes/ImageRoutes";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/images", imageRoutes);

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
