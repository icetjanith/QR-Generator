import { ProductUnit } from '@/types';

export function generateSerialKey(): string {
  // Generate a unique 12-character alphanumeric serial key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateQRToken(): string {
  // Generate a cryptographically secure token for QR URLs
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateQRCodeUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/product/${token}`)}`;
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://warranty.com/product/${token}`)}`;
}

export function generateProductUnits(
    productId: string,
    batchId: string,
    quantity: number
): ProductUnit[] {
  const units: ProductUnit[] = [];

  for (let i = 0; i < quantity; i++) {
    const qrToken = generateQRToken();
    const serialKey = generateSerialKey();

    units.push({
      id: `unit_${Date.now()}_${i}`,
      productId,
      batchId,
      serialKey,
      qrToken,
      qrCodeUrl: generateQRCodeUrl(qrToken),
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return units;
}
