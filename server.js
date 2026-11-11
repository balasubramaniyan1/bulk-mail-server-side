const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");



dotenv.config();

const app = express();

app.use(cors({
    origin:  "http://localhost:5173",
}));
console.log("VITE_API_URL:", process.env.VITE_API_URL);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection middleware (if you already use it)
app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
});

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Existing email routes
app.use("/api/emails", require("./routes/emailRoutes"));

app.get("/", (req, res) => {
    res.send("Bulk Mail Backend is Running");
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    async function startServer() {

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }

    startServer().catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

module.exports = app