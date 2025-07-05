import { Product, ProductBatch, ProductUnit, WarrantyClaim, SupportTicket, Shop, Analytics } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'SmartWatch Pro X1',
    description: 'Advanced fitness tracking smartwatch with heart rate monitoring',
    category: 'Wearables',
    brand: 'TechCorp',
    model: 'TWX-2024',
    warrantyDurationMonths: 24,
    imageUrl: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=300',
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': '7 days',
      'Water Resistance': '50 meters',
      'Connectivity': 'Bluetooth 5.0, WiFi',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Wireless Headphones Elite',
    description: 'Premium noise-cancelling wireless headphones',
    category: 'Audio',
    brand: 'SoundMax',
    model: 'WH-Elite-2024',
    warrantyDurationMonths: 12,
    imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
    specifications: {
      'Driver': '40mm Dynamic',
      'Frequency Response': '20Hz - 20kHz',
      'Battery': '30 hours',
      'Connectivity': 'Bluetooth 5.2',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const mockBatches: ProductBatch[] = [
  {
    id: 'batch1',
    productId: '1',
    batchNumber: 'TWX-2024-001',
    quantity: 100,
    manufacturingDate: new Date('2024-01-01'),
    status: 'distributed',
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'batch2',
    productId: '2',
    batchNumber: 'WH-Elite-001',
    quantity: 50,
    manufacturingDate: new Date('2024-01-15'),
    status: 'printed',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const mockUnits: ProductUnit[] = [
  {
    id: 'unit1',
    productId: '1',
    batchId: 'batch1',
    serialKey: 'TWX2024ABC01',
    qrToken: 'abc123def456ghi789jkl012',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://warranty.com/product/abc123def456ghi789jkl012',
    status: 'activated',
    activatedAt: new Date('2024-01-20'),
    activatedBy: '2',
    warrantyExpiresAt: new Date('2026-01-20'),
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    shopId: 'shop1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
  },
];

export const mockClaims: WarrantyClaim[] = [
  {
    id: 'claim1',
    productUnitId: 'unit1',
    claimType: 'repair',
    description: 'Screen has dead pixels after 6 months of use',
    status: 'pending',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-20'),
  },
];

export const mockTickets: SupportTicket[] = [
  {
    id: 'ticket1',
    productUnitId: 'unit1',
    title: 'How to sync with iPhone?',
    description: 'Need help connecting my smartwatch to iPhone',
    priority: 'medium',
    status: 'open',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-07-15'),
  },
];

export const mockShops: Shop[] = [
  {
    id: 'shop1',
    name: 'TechMart Downtown',
    address: '123 Main St, Downtown, City',
    phone: '+1234567890',
    email: 'shop@techmart.com',
    ownerName: 'Shop Owner',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'shop2',
    name: 'Electronics Plus',
    address: '456 Oak Avenue, Uptown, City',
    phone: '+1234567891',
    email: 'owner@electronicsplus.com',
    ownerName: 'Sarah Johnson',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'shop3',
    name: 'Gadget World',
    address: '789 Pine Street, Midtown, City',
    phone: '+1234567892',
    email: 'contact@gadgetworld.com',
    ownerName: 'Mike Chen',
    status: 'inactive',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'shop4',
    name: 'Smart Store',
    address: '321 Elm Drive, Westside, City',
    phone: '+1234567893',
    email: 'admin@smartstore.com',
    ownerName: 'Lisa Rodriguez',
    status: 'suspended',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

export const mockAnalytics: Analytics = {
  totalProducts: 2,
  totalUnits: 150,
  activatedUnits: 75,
  activationRate: 50,
  warrantyExpiringSoon: 5,
  activeClaims: 3,
  openTickets: 8,
  recentActivations: mockUnits,
};