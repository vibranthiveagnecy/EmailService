// api/index.js
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Middleware
app.use(cors({
    origin: "*", // Allow all connections for now (Change to client domain later)
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());

// 2. Health Check Route (To see if it works)
app.get('/', (req, res) => {
    res.send('Server is running and ready to send emails.');
});

// 3. Email Route
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        const data = await resend.emails.send({
            from: 'Contact Form <vibranthiveagnecy@gmail.com>', // Default Resend test email
            to: process.env.CLIENT_EMAIL, // The Client's Email
            reply_to: email, // So the client can hit "Reply" and email the customer back
            subject: `New Lead: ${name}`,
            html: `
                <h3>New Message from Website</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
                    ${message}
                </blockquote>
            `
        });

        return res.status(200).json({ success: true, message: "Email sent!", data });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// 4. Start Server (Local Development)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 5. Export for Vercel (Crucial)
export default app;