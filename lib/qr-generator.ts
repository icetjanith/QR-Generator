import { ProductUnit } from '@/types';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

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

export async function generateQRCodeDataURL(token: string): Promise<string> {
  const url = `${window.location.origin}/product/${token}`;
  try {
    return await QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export function generateQRCodeUrl(token: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/product/${token}`)}`;
}

export async function generateProductUnits(
  productId: string,
  batchId: string,
  quantity: number
): Promise<ProductUnit[]> {
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

export async function generatePrintablePDF(units: ProductUnit[], batchNumber: string): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 10;
  const stickerWidth = (pageWidth - 2 * margin) / 5; // 5 columns
  const stickerHeight = 25; // Height for each sticker
  const qrSize = 15; // QR code size in mm
  
  let currentPage = 1;
  let currentRow = 0;
  let currentCol = 0;
  const maxRows = Math.floor((pageHeight - 2 * margin) / stickerHeight);
  
  // Add title
  pdf.setFontSize(16);
  pdf.text(`QR Codes - Batch: ${batchNumber}`, margin, margin);
  
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    
    // Calculate position
    const x = margin + currentCol * stickerWidth;
    const y = margin + 20 + currentRow * stickerHeight; // 20mm offset for title
    
    try {
      // Generate QR code as data URL
      const qrDataURL = await generateQRCodeDataURL(unit.qrToken);
      
      if (qrDataURL) {
        // Add QR code image
        pdf.addImage(qrDataURL, 'PNG', x + 2, y + 2, qrSize, qrSize);
      }
      
      // Add serial key text
      pdf.setFontSize(8);
      pdf.text(unit.serialKey, x + qrSize + 4, y + 8);
      
      // Add product URL (smaller text)
      pdf.setFontSize(6);
      const shortUrl = `${window.location.host}/product/${unit.qrToken.substring(0, 8)}...`;
      pdf.text(shortUrl, x + qrSize + 4, y + 12);
      
      // Draw border around sticker
      pdf.rect(x, y, stickerWidth - 1, stickerHeight - 1);
      
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
      // Add placeholder text if QR generation fails
      pdf.setFontSize(10);
      pdf.text('QR Error', x + 2, y + 10);
      pdf.text(unit.serialKey, x + 2, y + 15);
    }
    
    // Move to next position
    currentCol++;
    if (currentCol >= 5) {
      currentCol = 0;
      currentRow++;
      
      if (currentRow >= maxRows) {
        // Add new page
        pdf.addPage();
        currentPage++;
        currentRow = 0;
        
        // Add title to new page
        pdf.setFontSize(16);
        pdf.text(`QR Codes - Batch: ${batchNumber} (Page ${currentPage})`, margin, margin);
      }
    }
  }
  
  // Download the PDF
  pdf.save(`QR_Codes_${batchNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function layoutStickersForA4(units: ProductUnit[]): any[] {
  // Layout 25 stickers per A4 page (5 columns × 5 rows)
  const pages = [];
  const stickersPerPage = 25;
  
  for (let i = 0; i < units.length; i += stickersPerPage) {
    const pageUnits = units.slice(i, i + stickersPerPage);
    const rows = [];
    
    for (let j = 0; j < pageUnits.length; j += 5) {
      rows.push(pageUnits.slice(j, j + 5));
    }
    
    pages.push({
      pageNumber: Math.floor(i / stickersPerPage) + 1,
      rows,
    });
  }
  
  return pages;
}

export async function generateSingleQRCode(unit: ProductUnit): Promise<string> {
  return await generateQRCodeDataURL(unit.qrToken);
}