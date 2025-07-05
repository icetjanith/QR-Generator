import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  warrantyDurationMonths: number;
  imageUrl?: string;
  specifications: Record<string, string>;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  warrantyDurationMonths: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  specifications: {
    type: Map,
    of: String,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ProductSchema.index({ name: 'text', brand: 'text', model: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ isActive: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);