import mongoose, { Schema, Document } from 'mongoose';

export interface IWarrantyClaim extends Document {
  productUnitId: string;
  claimType: 'repair' | 'replacement' | 'refund';
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  images?: string[];
  resolution?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarrantyClaimSchema = new Schema<IWarrantyClaim>({
  productUnitId: {
    type: String,
    required: true,
    ref: 'ProductUnit',
  },
  claimType: {
    type: String,
    enum: ['repair', 'replacement', 'refund'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
    default: 'pending',
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  resolution: {
    type: String,
  },
  assignedTo: {
    type: String,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
WarrantyClaimSchema.index({ productUnitId: 1 });
WarrantyClaimSchema.index({ status: 1 });
WarrantyClaimSchema.index({ customerEmail: 1 });
WarrantyClaimSchema.index({ createdAt: -1 });

export default mongoose.models.WarrantyClaim || mongoose.model<IWarrantyClaim>('WarrantyClaim', WarrantyClaimSchema);