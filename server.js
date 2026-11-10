const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");



dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.VITE_API_URL || "http://localhost:5173",
}));

app.use(express.json());

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