import cors from 'cors';
import 'dotenv/config';
import express, { json } from 'express';
import { body, validationResult } from "express-validator";
import { createTransport } from 'nodemailer';


const app = express();

const whitelist = ['https://portfolio.letsbug.in', 'http://aniket.portfolio.in', 'http://localhost:3000', 'https://portfolio-5b3g.vercel.app'];

const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(origin)
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(json());


app.post('/send-email', [
    body('to').isEmail().withMessage('Must be a valid email address'),
    body('subject').isLength({ min: 1 }).withMessage('Subject cannot be empty'),
    body('text').isLength({ min: 1 }).withMessage('Text cannot be empty')
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let { to, subject, text } = req.body;

    let transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWRD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        html: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            res.send('Email sent: ' + info.response);
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));