const mongoose = require("mongoose");

function sanitizeErrorMessage(message) {
    return message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "<MongoDB URI redacted>");
}

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not set in the server .env file.");
    }

    if (mongoUri.includes("<db_username>") || mongoUri.includes("<db_password>")) {
        throw new Error("Replace the MongoDB Atlas username and password placeholders in MONGO_URI.");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        const detail = sanitizeErrorMessage(error.message || "Unknown connection error");
        throw new Error(
            `MongoDB connection failed (${error.name || "Error"}${error.code ? `, code ${error.code}` : ""}): ${detail}`,
            { cause: error }
        );
    }
};

module.exports = connectDB;