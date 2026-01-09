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

    // api/index.js (Inside the app.post block)

    try {
        const data = await resend.emails.send({
            // 👇 THIS LINE MUST BE EXACTLY THIS FOR FREE ACCOUNTS
            from: 'Contact Form <onboarding@resend.dev>', 
            
            // The "To" address comes from your .env file
            to: process.env.CLIENT_EMAIL, 
            
            // This makes the "Reply" button work correctly
            reply_to: email, 
            
            subject: `New Lead: ${name}`,
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
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