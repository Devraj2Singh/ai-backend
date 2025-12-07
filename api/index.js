const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Enable CORS for all origins (simple and safe for this demo)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Health check: GET /
app.get("/", (req, res) => {
  res.json({ status: "Backend live!" });
});

// AI proxy: POST /
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

module.exports = app;
