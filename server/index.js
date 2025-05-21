require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");


const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Persistent Request Count
const REQUEST_COUNT_FILE = "request_count.json";

// ✅ Function to get the current request count from file
const getRequestCount = () => {
    if (fs.existsSync(REQUEST_COUNT_FILE)) {
        const data = fs.readFileSync(REQUEST_COUNT_FILE, "utf8");
        return JSON.parse(data).count || 0;
    }
    return 0;
};

// ✅ Function to update request count
const updateRequestCount = () => {
    let count = getRequestCount() + 1;
    fs.writeFileSync(REQUEST_COUNT_FILE, JSON.stringify({ count }));
    return count;
};

// ✅ API to fetch sentiment analysis results from CSV file
app.get("/api/sentiment/:category", (req, res) => {
    const category = req.params.category;
    const filePath = path.join(__dirname, "..", "python_work", "data", `news_${category}_predicted.csv`);


    // 🛠 Debugging Logs
    console.log(`🔍 Looking for file: ${filePath}`);
    console.log(`📂 Directory Exists? ${fs.existsSync(path.join(__dirname, "python_work", "data"))}`);
    console.log(`📄 File Exists? ${fs.existsSync(filePath)}`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File NOT FOUND: ${filePath}`);
        return res.status(404).json({ error: "CSV file not found for the given category." });
    }

    let sentimentData = [];
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => sentimentData.push(row))
        .on("end", () => res.json(sentimentData))
        .on("error", (err) => res.status(500).json({ error: err.message }));
});


// ✅ Middleware to count API requests
app.use((req, res, next) => {
    updateRequestCount();
    console.log(`📢 API Request #${getRequestCount()} - ${req.method} ${req.url}`);
    next();
});

// ✅ API to fetch sentiment analysis results from a specific CSV file based on category
app.get("/api/sentiment/:category", (req, res) => {
    const category = req.params.category;
    const filePath = path.join(__dirname, "python_work/data", `news_${category}_predicted.csv`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "CSV file not found for the given category." });
    }

    let sentimentData = [];
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => sentimentData.push(row))
        .on("end", () => res.json(sentimentData))
        .on("error", (err) => res.status(500).json({ error: err.message }));
});

// ✅ API for analyzing sentiment of a single news article
app.post("/api/analyze-sentiment", async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ success: false, message: "Text is required for sentiment analysis" });
    }

    try {
        // TODO: Replace this with your actual sentiment analysis model logic
        const sentimentResult = "Neutral"; // Replace with real sentiment analysis
        res.json({ success: true, sentiment: sentimentResult });
    } catch (error) {
        res.status(500).json({ success: false, message: "Sentiment analysis failed", error: error.message });
    }
});

// ✅ Function to make API requests
async function makeApiRequest(url) {
    try {
        const response = await axios.get(url);
        return {
            status: 200,
            success: true,
            message: "Successfully fetched data",
            data: response.data,
        };
    } catch (error) {
        console.error("❌ API request error:", error.response ? error.response.data : error.message);
        return {
            status: 500,
            success: false,
            message: "Failed to fetch data from the API",
            error: error.response ? error.response.data : error.message,
        };
    }
}

// ✅ API - Get All News
app.get("/api/all-news", async (req, res) => {
    let pageSize = parseInt(req.query.pageSize) || 10;
    let page = parseInt(req.query.page) || 1;
    let q = req.query.q || "world"; // default search keyword

    const url = `https://newsapi.org/v2/everything?q=${q}&apiKey=3b32e1eb50eb4f8a9b8b712aec3c1d9a`;
    
    const result = await makeApiRequest(url);
    res.status(result.status).json(result);
});


// ✅ API - Get Top Headlines
app.get("/api/top-headlines", async (req, res) => {
    let pageSize = parseInt(req.query.pageSize) || 80;
    let page = parseInt(req.query.page) || 1;
    let category = req.query.category || "general";

    let url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&page=${page}&pageSize=${pageSize}&apiKey=3b32e1eb50eb4f8a9b8b712aec3c1d9a`;
    const result = await makeApiRequest(url);
    res.status(result.status).json(result);
});

// ✅ API - Get Country-Specific News
app.get("/api/country/:iso", async (req, res) => {
    let pageSize = parseInt(req.query.pageSize) || 80;
    let page = parseInt(req.query.page) || 1;
    const country = req.params.iso;

    let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=3b32e1eb50eb4f8a9b8b712aec3c1d9a&page=${page}&pageSize=${pageSize}`;
    const result = await makeApiRequest(url);
    res.status(result.status).json(result);
});

// ✅ Middleware to count API requests (EXCLUDING /api/request-count)
app.use((req, res, next) => {
    if (req.path !== "/api/request-count") {
        updateRequestCount();
        console.log(`📢 API Request #${getRequestCount()} - ${req.method} ${req.url}`);
    }
    next();
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
