import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from './Routes/userRoutes.js';
import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './Routes/adminRoutes.js';
import session from 'express-session';
import authRoutes from './Routes/authRoutes.js';
import bodyParser from 'body-parser';
import passport from './Services/passport.js';
import cookieParser from 'cookie-parser';
import productRoutes from './Routes/productRoute.js'
import salesRoutes from './Routes/salesRoutes.js'
import transactionRoutes from "./Routes/transcationRoutes.js";
import receipt from './Routes/receiptRoutes.js'
import fs from 'fs';

const app = express();
dotenv.config();
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
connectDB();

const port = process.env.PORT || 3454;

// More flexible CORS configuration with function to check origin
const whitelist = [
    process.env.CLIENT_URL,
    'https://clean-pos-frontend.onrender.com',
    'https://682c1cff30ac40008cef192-aquamarine-khapse-67e0d4.netlify.app',
    'https://aquamarine-khapse-67e0d4.netlify.app',
    'http://localhost:3000'  // Always allow localhost:3000
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);

        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) {
            console.log('Allowing request with no origin');
            return callback(null, true);
        }

        // Check if origin is in whitelist
        if (whitelist.indexOf(origin) !== -1) {
            console.log('Origin in whitelist:', origin);
            return callback(null, true);
        }

        // Allow all Netlify domains
        if (origin && origin.endsWith('.netlify.app')) {
            console.log('Allowing Netlify domain:', origin);
            return callback(null, true);
        }

        // Allow localhost in development (any port)
        if (origin && origin.includes('localhost')) {
            console.log('Allowing localhost:', origin);
            return callback(null, true);
        }

        console.log('Blocking origin by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions));

// Use express-session for session handling
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Make sure this is set in .env
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // Set to true in production for HTTPS
        httpOnly: true,
    },
}));

// Serve static files (e.g., images)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/products', express.static(path.join(__dirname, 'products')));


const uploadDir = path.join(__dirname, 'ads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(passport.initialize());
app.use(passport.session());


// Google OAuth route for callback


// API routes
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api', productRoutes)
app.use('/api', salesRoutes)
app.use('/api/transactions', transactionRoutes);
app.use('/api/', receipt);


// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);

    // Check if the error is a CORS error
    if (err.message && err.message.includes('CORS')) {
        console.error('CORS Error:', err.message);
        return res.status(403).json({
            message: "CORS error: Origin not allowed",
            error: err.message
        });
    }

    // For other errors, send a generic message
    res.status(500).json({
        message: "Server error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });

    // Continue to other error handlers if any
    if (next) next(err);
});

app.listen(port, () => {
    console.log(`Connected to PORT ${port}`);
});
