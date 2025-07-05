export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'shop_owner' | 'inventory_user' | 'middleman';
  shopId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  warrantyDurationMonths: number;
  imageUrl?: string;
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBatch {
  id: string;
  productId: string;
  product?: Product;
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date;
  expiryDate?: Date;
  status: 'created' | 'printed' | 'distributed' | 'activated';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUnit {
  id: string;
  productId: string;
  product?: Product;
  batchId: string;
  batch?: ProductBatch;
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

export interface WarrantyClaim {
  id: string;
  productUnitId: string;
  productUnit?: ProductUnit;
  claimType: 'repair' | 'replacement' | 'refund';
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  images?: string[];
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  productUnitId?: string;
  productUnit?: ProductUnit;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerName: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  totalProducts: number;
  totalUnits: number;
  activatedUnits: number;
  activationRate: number;
  warrantyExpiringSoon: number;
  activeClaims: number;
  openTickets: number;
  recentActivations: ProductUnit[];
}

export interface QRCodeBatch {
  batchId: string;
  units: ProductUnit[];
  pdfUrl: string;
  generatedAt: Date;
}