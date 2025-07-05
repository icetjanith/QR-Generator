'use client';

import { useEffect, useState } from 'react';
import { ProductUnit } from '@/types';
import { generateQRCodeUrl } from '@/lib/qr-generator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, Copy, Check } from 'lucide-react';
import Image from 'next/image';

interface QRCodePreviewProps {
  unit: ProductUnit;
  productName?: string;
  onClose?: () => void;
}

export default function QRCodePreview({ unit, productName, onClose }: QRCodePreviewProps) {
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const qrUrl = generateQRCodeUrl(unit.qrToken);
    setQrImageUrl(qrUrl);
    setLoading(false);
  }, [unit]);

  const handleCopySerial = async () => {
    try {
      await navigator.clipboard.writeText(unit.serialKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrImageUrl) return;
    
    // Create a canvas to convert the QR code image to downloadable format
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // @ts-ignore
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `QR_${unit.serialKey}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };
    
    img.src = qrImageUrl;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrImageUrl) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${unit.serialKey}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                border: 2px solid #000;
                padding: 20px;
                display: inline-block;
                margin: 20px;
              }
              .qr-code {
                margin-bottom: 10px;
              }
              .serial {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
              }
              .product {
                font-size: 12px;
                color: #666;
              }
              @media print {
                body { margin: 0; }
                .qr-container { border: 1px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-code">
                <img src="${qrImageUrl}" alt="QR Code" />
              </div>
              <div class="serial">${unit.serialKey}</div>
              ${productName ? `<div class="product">${productName}</div>` : ''}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : qrImageUrl ? (
          <>
            <div className="flex justify-center">
              <Image
                  src={qrImageUrl}
                  alt="QR Code"
                  width={200} // adjust width/height based on your layout needs
                  height={200}
                  className="border border-gray-300 rounded-lg p-2"
                  unoptimized // optional: use if qrImageUrl is from an external or dynamic source that cannot be optimized
              />

            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-sm">{unit.serialKey}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySerial}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {productName && (
                <p className="text-sm text-gray-600">{productName}</p>
              )}
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </>
        ) : (
          <div className="text-red-600">
            Failed to generate QR code
          </div>
        )}
        
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="w-full">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
}