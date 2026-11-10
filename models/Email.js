const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    },

    recipients: {
        type: [String],
        required: true
    },

    status: {
        type: String,
        enum: ["success", "partial", "failed"],
        default: "failed"
    },

    sentAt: {
        type: Date,
        default: Date.now
    },

    results: [{
        email: String,
        status: String,
        error: String
    }]
});

module.exports = mongoose.model("Email", emailSchema);