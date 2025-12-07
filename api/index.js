const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// All allowed frontend origins
const allowedOrigins = [
  "https://netflix-ohevdhaug-devraj-singhs-projects-cfcd9b87.vercel.app",
  "https://netflix-6yi3h8sc2-devraj-singhs-projects-cfcd9b87.vercel.app",
  "https://netflix-gpt-mu-lemon.vercel.app",
  "https://netflix-ohevdhaug-devraj-singhs-projects-cfcd9b87.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Backend live!" });
});

// AI proxy
app.post("/", async (req, res) => {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "PERPLEXITY_API_KEY not set" });
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Perplexity error", body: text });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error("Perplexity route error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports;
