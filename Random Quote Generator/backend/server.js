import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// GET /api/quote - returns a single random quote
app.get("/api/quote", async (req, res) => {
    try {
        // dummyjson has 1450+ quotes, completely free, no API key needed
        const response = await fetch("https://dummyjson.com/quotes/random");
        if (!response.ok) throw new Error("Upstream API failed");
        const data = await response.json();

        res.json({
            content: data.quote,
            author: data.author,
        });
    } catch (error) {
        console.error("Quote fetch error:", error.message);
        // Fallback quotes in case the external API is down
        const fallbacks = [
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
            { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
            { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        ];
        const random = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        res.json(random);
    }
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
    console.log(`Quote API server running at http://localhost:${PORT}`);
});