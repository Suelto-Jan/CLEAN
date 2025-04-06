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

const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST','DELETE','PUT','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

  const corsOptions = {
    origin: process.env.VITE_CLIENT_URL || 'http://localhost:3000', // Allow frontend URL
    credentials: true,  // Allow cookies to be sent
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
    console.error(err.stack);
    res.status(500).send({ message: "Server error. Please try again later." });
});

app.listen(port, () => {
    console.log(`Connected to PORT ${port}`);
});
