const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");
const Email = require("../models/Email");
const EmailPass = require("../models/EmailPass");

// Send bulk emails
router.post("/send", async (req, res) => {
    try {
        const { subject, body, recipients } = req.body;

        if (
            !subject?.trim() ||
            !body?.trim() ||
            !Array.isArray(recipients) ||
            recipients.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide subject, body and recipients."
            });
        }

        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const emails = [...new Set(
            recipients.map(email =>
                typeof email === "string" ? email.trim().toLowerCase() : ""
            )
        )];

        if (emails.some(email => !validEmail.test(email))) {
            return res.status(400).json({
                message: "One or more recipient emails are invalid."
            });
        }

        if (emails.length > 50) {
            return res.status(400).json({
                message: "Maximum 50 recipients allowed per request."
            });
        }

        const credentials = await EmailPass.findOne()
            .select("+email_pass +user +pass")
            .lean();

        if (!credentials) {
            return res.status(503).json({
                message: `No credential document found in ${EmailPass.db.name}.emailpass.`
            });
        }

        const senderEmail = credentials.email_user || credentials.user;
        const senderPassword = credentials.email_pass || credentials.pass;
        if (
            typeof senderEmail !== "string" ||
            !senderEmail.trim() ||
            typeof senderPassword !== "string" ||
            !senderPassword.trim()
        ) {
            return res.status(503).json({
                message: "The credential document must contain email_user and email_pass (or user and pass)."
            });
        }

        const normalizedSender = senderEmail.trim();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: normalizedSender,
                pass: senderPassword
            }
        });

        const results = [];

        for (const email of emails) {
            try {
                await transporter.sendMail({
                    from: normalizedSender,
                    to: email,
                    subject,
                    text: body
                });

                results.push({
                    email,
                    status: "success"
                });

            } catch (error) {
                console.error("Email sending failed:", error.message);

                results.push({
                    email,
                    status: "failed",
                    error: error.message
                });
            }
        }

        const successful = results.filter(
            item => item.status === "success"
        ).length;

        const failed = results.length - successful;

        const status = successful === results.length
            ? "success"
            : successful === 0
                ? "failed"
                : "partial";

        const emailRecord = await Email.create({
            subject,
            body,
            recipients: emails,
            status,
            results
        });

        res.status(200).json({
            message: "Email sending process completed",
            successful,
            failed,
            status,
            record: emailRecord
        });

    } catch (error) {
        console.error("Email API error:", error);

        res.status(500).json({
            message: "Something went wrong while sending emails."
        });
    }
});

// Get email history
router.get("/history", async (req, res) => {
    try {
        const emails = await Email.find().sort({ sentAt: -1 });

        res.status(200).json(emails);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch email history"
        });
    }
});

module.exports = router;