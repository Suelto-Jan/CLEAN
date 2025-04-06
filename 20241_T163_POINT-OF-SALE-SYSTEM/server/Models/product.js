import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      enum: ['drinks', 'junkfood'],  // Only these categories are allowed
      required: true
    },
    barcode: {
      type: String,
      unique: true,
      required: true,
      maxlength: 20,
      index: true, // Add index for quicker lookups
    },
    lockedBy: { 
      type: String, 
      default: null 
    },
    lockedUntil: { 
      type: Date, 
      default: null // Keeps it as null by default
    },
    sku: { 
      type: String, 
      unique: true },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true,
  }
);


const Product = mongoose.model('Product', productSchema);
export default Product;

