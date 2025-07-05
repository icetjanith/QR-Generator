import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerName: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Indexes
ShopSchema.index({ email: 1 });
ShopSchema.index({ status: 1 });

export default mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);