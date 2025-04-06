import express from 'express';
import { body, validationResult } from 'express-validator';
import { createReceipt } from '../Controller/receiptController.js';

const router = express.Router();

// Validation middleware
router.post(
  '/generate-receipt',
  [
    body('product.name').notEmpty().withMessage('Product name is required'),
    body('product.price').isFloat({ gt: 0 }).withMessage('Product price must be positive'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('totalPrice').isFloat({ gt: 0 }).withMessage('Total price must be positive'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('user.email').isEmail().withMessage('Valid user email is required'),
    body('user.firstname').notEmpty().withMessage('User first name is required'),
    body('user.lastname').notEmpty().withMessage('User last name is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createReceipt
);

export default router;
