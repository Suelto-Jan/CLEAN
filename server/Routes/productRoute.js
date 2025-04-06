import express from 'express';
import multer from 'multer';
import { 
  registerProduct, 
  getProduct, 
  getProductbyId, 
  updateProduct, 
  deleteProduct,
  getProductByBarcode,
  decrementProductQuantity,
  deleteAllProducts 
} from '../Controller/productsController.js'; // Fix the controller import path

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'products/'); // Save images in 'products' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Use unique filename
  }
});

const upload = multer({ storage: storage });

// Define routes
router.post('/registerProduct', upload.single('image'), registerProduct);
router.get('/products', getProduct);
router.get('/products/:id', getProductbyId);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/barcode/:barcode', getProductByBarcode);
router.put('/products/:id/decrement', decrementProductQuantity);
router.delete('/products', deleteAllProducts);

export default router;
