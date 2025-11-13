import express from "express";
import axios from "axios";
import User from "../models/User.js"; // ✅ import User model

const router = express.Router();

router.get("/github", (req, res) => {
  const redirectUri = "http://localhost:5001/auth/github/callback";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo,user`;
  res.redirect(githubAuthUrl);
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // 1️⃣ Exchange code for token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const access_token = tokenResponse.data.access_token;
    if (!access_token) {
      return res.status(400).json({ error: "No access token received" });
    }

    // 2️⃣ Fetch GitHub user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const githubUser = userResponse.data;

    // 3️⃣ Save or update user in MongoDB
    await User.findOneAndUpdate(
      { githubId: githubUser.id },
      {
        githubUsername: githubUser.login,
        githubAccessToken: access_token,
      },
      { upsert: true, new: true }
    );

    // ✅ 4️⃣ Redirect to frontend dashboard with username
    res.redirect(`http://localhost:5173/dashboard?username=${githubUser.login}`);
  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err.message);
    res.status(500).json({ error: "OAuth flow failed" });
  }
});

export default router;
