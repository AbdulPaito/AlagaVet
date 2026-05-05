import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  labels: string[];
  isFeatured: boolean;
  sku?: string;
  weightKg?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    labels: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    weightKg: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function (this: IProduct) {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock < 10) return 'low-stock';
  return 'in-stock';
});

export default mongoose.model<IProduct>('Product', ProductSchema);
