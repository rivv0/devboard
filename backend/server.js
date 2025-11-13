import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cron from "node-cron";
import axios from "axios";

import authRoutes from "./routes/auth.js";
import githubRoutes from "./routes/github.js";
import leetcodeRoutes from "./routes/leetcode.js";
import userRoutes from "./routes/user.js";
import analyticsRoutes from "./routes/analytics.js";
import codeQualityRoutes from "./routes/codeQuality.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// ✅ Register routes (each only once)
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/code-quality", codeQualityRoutes);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Cron Job: Sync GitHub Activity Hourly
cron.schedule("0 * * * *", async () => {
  console.log("Cron Job Running: Syncing all users...");

  try {
    const users = await User.find();
    for (const user of users) {
      console.log(`🔄 Syncing ${user.githubUsername}...`);
      await axios.get(
        `http://localhost:5001/api/github/sync/${user.githubUsername}`
      );
    }

    console.log("✅ All users synced successfully!");
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
