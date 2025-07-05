import { ProductUnit } from '@/types';

export interface QRStickerData {
  qrCodeUrl: string;
  serialKey: string;
  productName?: string;
  batchNumber?: string;
}

export function generateQRCodeDataURL(token: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://warranty.com';
  const productUrl = `${baseUrl}/product/${token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}`;
}

export async function generatePrintablePDF(
  units: ProductUnit[], 
  batchNumber: string,
  productName?: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 10;
  const cols = 5;
  const rows = 7;
  const stickerWidth = (pageWidth - 2 * margin) / cols;
  const stickerHeight = (pageHeight - 2 * margin) / rows;
  
  let currentPage = 1;
  let currentRow = 0;
  let currentCol = 0;

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    
    // Calculate position
    const x = margin + currentCol * stickerWidth;
    const y = margin + currentRow * stickerHeight;
    
    try {
      // Generate QR code image
      const qrImageUrl = generateQRCodeDataURL(unit.qrToken);
      
      // Create a promise to load the image
      const imageData = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 200;
          canvas.height = 200;
          ctx?.drawImage(img, 0, 0, 200, 200);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load QR code image'));
        img.src = qrImageUrl;
      });

      // Add QR code image to PDF
      const qrSize = Math.min(stickerWidth, stickerHeight) * 0.6;
      const qrX = x + (stickerWidth - qrSize) / 2;
      const qrY = y + 5;
      
      pdf.addImage(imageData, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // Add serial number
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      const serialY = qrY + qrSize + 3;
      pdf.text(unit.serialKey, x + stickerWidth / 2, serialY, { align: 'center' });
      
      // Add product name if provided
      if (productName) {
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        const productY = serialY + 3;
        const maxWidth = stickerWidth - 2;
        const lines = pdf.splitTextToSize(productName, maxWidth);
        pdf.text(lines[0] || '', x + stickerWidth / 2, productY, { align: 'center' });
      }
      
      // Draw border around sticker
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.rect(x, y, stickerWidth, stickerHeight);
      
    } catch (error) {
      console.error(`Failed to add QR code for unit ${unit.serialKey}:`, error);
      
      // Add placeholder text if image fails
      pdf.setFontSize(10);
      pdf.text('QR Code', x + stickerWidth / 2, y + stickerHeight / 2, { align: 'center' });
      pdf.setFontSize(8);
      pdf.text(unit.serialKey, x + stickerWidth / 2, y + stickerHeight / 2 + 5, { align: 'center' });
    }
    
    // Move to next position
    currentCol++;
    if (currentCol >= cols) {
      currentCol = 0;
      currentRow++;
      if (currentRow >= rows) {
        currentRow = 0;
        if (i < units.length - 1) {
          pdf.addPage();
          currentPage++;
        }
      }
    }
  }

  // Add header to first page
  pdf.setPage(1);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`QR Codes - Batch: ${batchNumber}`, pageWidth / 2, 5, { align: 'center' });
  
  if (productName) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(productName, pageWidth / 2, 8, { align: 'center' });
  }

  // Save the PDF
  pdf.save(`QR_Codes_${batchNumber}.pdf`);
}

export function layoutStickersForA4(units: ProductUnit[]): any[] {
  const pages = [];
  const stickersPerPage = 35; // 5 columns × 7 rows
  const cols = 5;

  for (let i = 0; i < units.length; i += stickersPerPage) {
    const pageUnits = units.slice(i, i + stickersPerPage);
    const rows = [];

    for (let j = 0; j < pageUnits.length; j += cols) {
      rows.push(pageUnits.slice(j, j + cols));
    }

    pages.push({
      pageNumber: Math.floor(i / stickersPerPage) + 1,
      rows,
      totalUnits: pageUnits.length,
    });
  }

  return pages;
}