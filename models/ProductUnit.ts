import mongoose, { Schema, Document } from 'mongoose';

export interface IProductUnit extends Document {
  productId: string;
  batchId: string;
  serialKey: string;
  qrToken: string;
  qrCodeUrl: string;
  status: 'created' | 'printed' | 'distributed' | 'activated' | 'claimed';
  activatedAt?: Date;
  activatedBy?: string;
  warrantyExpiresAt?: Date;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shopId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductUnitSchema = new Schema<IProductUnit>({
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  batchId: {
    type: String,
    required: true,
    ref: 'ProductBatch',
  },
  serialKey: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  qrToken: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  qrCodeUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['created', 'printed', 'distributed', 'activated', 'claimed'],
    default: 'created',
  },
  activatedAt: {
    type: Date,
  },
  activatedBy: {
    type: String,
    ref: 'User',
  },
  warrantyExpiresAt: {
    type: Date,
  },
  customerName: {
    type: String,
    trim: true,
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    trim: true,
  },
  shopId: {
    type: String,
    ref: 'Shop',
  },
}, {
  timestamps: true,
});

// Indexes
ProductUnitSchema.index({ productId: 1 });
ProductUnitSchema.index({ batchId: 1 });
ProductUnitSchema.index({ serialKey: 1 });
ProductUnitSchema.index({ qrToken: 1 });
ProductUnitSchema.index({ status: 1 });
ProductUnitSchema.index({ customerEmail: 1 });
ProductUnitSchema.index({ warrantyExpiresAt: 1 });

export default mongoose.models.ProductUnit || mongoose.model<IProductUnit>('ProductUnit', ProductUnitSchema);