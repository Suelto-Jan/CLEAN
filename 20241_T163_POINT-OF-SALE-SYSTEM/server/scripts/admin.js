import connectDB from '../db.js'; // Import DB connection
import UserModel from '../Models/user.js'; // Import the User model
import bcrypt from 'bcryptjs'; // Import bcrypt

// Connect to DB before running the script
connectDB();

const newAdmin = new UserModel({
  firstname: 'John',
  lastname: 'lead',
  email: 'Admin123@gmail.com',
  isVerified: true,
  pin: '098765',  // Plain text pin that will be hashed
  isAdmin: true,
  image: "", // Mark this user as an admin
});

// Hash the pin before saving
bcrypt.hash(newAdmin.pin, 10, (err, hashedPin) => {
  if (err) {
    console.error('Error hashing the pin:', err);
    return;
  }

  // Set the hashed pin to the user document
  newAdmin.pin = hashedPin;

  // Save the new admin user with the hashed pin
  newAdmin.save()
    .then(() => console.log('Admin user created successfully'))
    .catch((err) => console.error('Error creating admin user:', err));
});
