import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

export interface IOrder extends Document {
  code: string;
  customerName: string;
  phone: string;
  address: string;
  productId?: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  deliveryDays?: number;
  deliveryNote?: string;
  status: OrderStatus;
  message?: string;
  estimatedDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Generate order code
const generateOrderCode = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${date}-${random}`;
};

const OrderSchema: Schema = new Schema(
  {
    code: {
      type: String,
      unique: true,
      default: generateOrderCode,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    deliveryDays: {
      type: Number,
      enum: [3, 5, 7],
      default: 5,
    },
    deliveryNote: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    estimatedDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware to calculate estimated delivery date (only if not manually set)
OrderSchema.pre('save', function (next) {
  if (this.deliveryDays && !this.estimatedDeliveryDate) {
    const date = new Date();
    date.setDate(date.getDate() + Number(this.deliveryDays));
    this.estimatedDeliveryDate = date;
  }
  next();
});

// Indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customerName: 'text', phone: 'text' });

export default mongoose.model<IOrder>('Order', OrderSchema);
