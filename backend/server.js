require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const BACKEND_URL = "https://proposify-ai-backend-6vse.onrender.com"; 
const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground");
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//Function -- generate Proposal from text 

async function generateProposal(projectDetails) {
    try {
        const result = await model.generateContent({
            contents: [{ parts: [{ text: `Generate a detailed project proposal for: ${projectDetails}` }] }]
        });

        return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "AI failed to generate a response.";
    } catch (error) {
        console.error("Error generating proposal:", error);
        return "Error generating proposal.";
    }
}


//Function -- create PDF from Proposal

function createPDF(proposalText, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        stream.on("finish", () => resolve(filePath));
        stream.on("error", (err) => reject(err));

        doc.pipe(stream);
        doc.fontSize(16).text("AI-Generated Project Proposal", { align: "center" }).moveDown();
        doc.fontSize(12).text(proposalText, { align: "left" });

        doc.end();
    });
}


//Function -- send Email from PDF

async function sendEmail(recipientEmail, pdfPath) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token
            }
        });

        const mailOptions = {
            from: EMAIL_USER,
            to: recipientEmail,
            subject: "Your AI-Generated Project Proposal",
            text: "Attached is your project proposal.",
            attachments: [{ filename: "Proposal.pdf", path: pdfPath }]
        };

        await transporter.sendMail(mailOptions);
        return "Email sent successfully!";
    } catch (error) {
        console.error("Error sending email:", error);
        return "Error sending email.";
    }
}


// API call for genereating proposal

app.post("/generate-proposal", async (req, res) => {
    const { projectDetails } = req.body;

    if (!projectDetails) {
        return res.status(400).json({ error: "Project details are required" });
    }

    console.log("Generating proposal...");
    try {
        const proposalText = await generateProposal(projectDetails);
        res.json({ proposal: proposalText });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// API call for Generating PDF

app.post("/generate-pdf", async (req, res) => {
    const {proposalText} = req.body;
    if (!proposalText) {
        return res.status(400).json({ error: "Proposal text is required" });
    }
    const pdfPath = "./Proposal.pdf";
    try {
        await createPDF(proposalText, pdfPath);
        res.json({ message: "PDF generated successfully", path: `${BACKEND_URL}/download-pdf` });
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});


// API call for downloading PDF

app.get("/download-pdf", (req, res) => {
    const pdfPath = path.join(__dirname, "Proposal.pdf");

    if (fs.existsSync(pdfPath)) {
        res.download(pdfPath, "Proposal.pdf", (err) => {
            if (err) {
                console.error("Error downloading PDF:", err);
                res.status(500).json({ error: "Failed to download PDF" });
            }
        });
    } else {
        res.status(404).json({ error: "PDF not found" });
    }
});

// API call for sending email with PDF

app.post("/send-pdf", async (req, res) => {
    const { proposalText, email } = req.body;

    if (!proposalText || !email) {
        return res.status(400).json({ error: "Proposal text and email are required" });
    }

    console.log("Creating PDF & Sending Email...");
    try {
        const pdfPath = "./Proposal.pdf";
        await createPDF(proposalText, pdfPath);

        const emailStatus = await sendEmail(email, pdfPath);
        res.json({ message: emailStatus });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

app.get("/", function(req,res){
    res.send("Welcome to the AI Proposal Generator API");
})

app.listen(3000, () => console.log("Server running on port 3000"));

