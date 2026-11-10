const mongoose = require("mongoose");

const emailPassSchema = new mongoose.Schema({
    email_user: {
        type: String,
        required: true,
        trim: true
    },
    email_pass: {
        type: String,
        required: true,
        select: false
    },
    user: {
        type: String,
        select: false
    },
    pass: {
        type: String,
        select: false
    }
}, {
    collection: "emailpass"
});

module.exports = mongoose.model("EmailPass", emailPassSchema);
