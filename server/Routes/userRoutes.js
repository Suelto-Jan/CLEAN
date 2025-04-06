import express from 'express';
import multer from 'multer';
import { registerUser, getUsers, getUserById, updateUser, deleteUser, loginUser,verifyEmail,addTransaction,
  getUserTransactions,getLoggedInUser ,updateLoggedInUser,forgotPin, resetPin} from '../Controller/userController.js';
  


const router = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Ensure 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Add timestamp to avoid filename conflicts
  }
});

// Create multer instance with storage configuration
const upload = multer({ storage: storage });


// Routes for users
router.post('/register', upload.single('image'), registerUser);  // Register a new user
router.get('/users', getUsers);  // Get all users
router.get('/users/:id', getUserById);  // Get a user by ID
router.put('/user/me', upload.single('image'), updateLoggedInUser);
router.put('/user/:id', upload.single('image'), updateUser);// Update a user by ID
router.delete('/users/:id', deleteUser);  // Delete a user
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/transactions', addTransaction); // Add a transaction for a user
router.get('/:id/transactions', getUserTransactions);
router.get('/user/me', getLoggedInUser);
router.post('/forgot-pin', forgotPin);
router.post('/reset-pin/:token', resetPin);



// Login route - ensure user exists, is verified, and PIN matches
// Middleware to verify token

// Protected route to get user profile



export default router;


