import mongoose, { Schema, Document } from 'mongoose';

export interface IProductBatch extends Document {
  productId: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date;
  expiryDate?: Date;
  status: 'created' | 'printed' | 'distributed' | 'activated';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductBatchSchema = new Schema<IProductBatch>({
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  manufacturingDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['created', 'printed', 'distributed', 'activated'],
    default: 'created',
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
ProductBatchSchema.index({ productId: 1 });
ProductBatchSchema.index({ batchNumber: 1 });
ProductBatchSchema.index({ status: 1 });
ProductBatchSchema.index({ manufacturingDate: 1 });

export default mongoose.models.ProductBatch || mongoose.model<IProductBatch>('ProductBatch', ProductBatchSchema);