'use client';

import {useCallback, useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { mockBatches, mockProducts, mockUnits } from '@/lib/mock-data';
import { ProductBatch, Product, ProductUnit } from '@/types';
import { generateProductUnits, generatePrintablePDF, layoutStickersForA4 } from '@/lib/qr-generator';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { 
  QrCode, 
  Download, 
  Printer, 
  Package, 
  Plus, 
  Search,
  Eye,
  Grid3X3,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import QRCodePreview from '@/components/QRCodePreview';

export default function QRCodesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [batches, setBatches] = useState<ProductBatch[]>(mockBatches);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [units, setUnits] = useState<ProductUnit[]>(mockUnits);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredBatches, setFilteredBatches] = useState<ProductBatch[]>(batches);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewUnit, setPreviewUnit] = useState<ProductUnit | null>(null);
  const [mounted, setMounted] = useState(false);
  const [newQRData, setNewQRData] = useState({
    productName: '',
    brand: '',
    model: '',
    category: '',
    warrantyMonths: 12,
    description: '',
    specifications: ''
  });
  const [generatingNewQR, setGeneratingNewQR] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const getProductName = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  }, [products]);

  useEffect(() => {
    if (!mounted) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasRole(user, ['admin', 'shop_owner', 'inventory_user'])) {
      router.push('/');
      return;
    }
  }, [user, router, mounted]);

  useEffect(() => {
    let filtered = batches;

    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProductName(batch.productId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(batch => batch.status === statusFilter);
    }

    setFilteredBatches(filtered);
  }, [searchTerm, statusFilter, batches, getProductName]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-gray-100 text-gray-800';
      case 'printed':
        return 'bg-blue-100 text-blue-800';
      case 'distributed':
        return 'bg-green-100 text-green-800';
      case 'activated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return Clock;
      case 'printed':
        return Printer;
      case 'distributed':
        return Package;
      case 'activated':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getBatchUnits = (batchId: string) => {
    return units.filter(unit => unit.batchId === batchId);
  };

  const handleGenerateQRCodes = async (batch: ProductBatch) => {
    setGeneratingQR(batch.id);
    
    try {
      const newUnits = await generateProductUnits(batch.productId, batch.id, batch.quantity);
      setUnits(prev => [...prev, ...newUnits]);
      
      // Update batch status
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'printed' as const } : b
      ));
      
      alert(`Generated ${batch.quantity} QR codes for batch ${batch.batchNumber}`);
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Failed to generate QR codes. Please try again.');
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleDownloadPDF = async (batch: ProductBatch) => {
    const batchUnits = getBatchUnits(batch.id);
    if (batchUnits.length === 0) {
      alert('No QR codes generated for this batch yet.');
      return;
    }
    
    try {
      const pdfUrl = generatePrintablePDF(batchUnits, batch.batchNumber);
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `QR_Codes_${batch.batchNumber}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`PDF download initiated for batch ${batch.batchNumber}`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleCreateNewQR = async () => {
    if (!newQRData.productName || !newQRData.brand || !newQRData.model) {
      alert('Please fill in all required fields (Product Name, Brand, Model)');
      return;
    }

    setGeneratingNewQR(true);
    
    try {
      // Simulate QR code generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new product
      const newProduct: Product = {
        id: `product_${Date.now()}`,
        name: newQRData.productName,
        brand: newQRData.brand,
        model: newQRData.model,
        category: newQRData.category || 'General',
        description: newQRData.description || `${newQRData.brand} ${newQRData.model}`,
        warrantyDurationMonths: newQRData.warrantyMonths,
        specifications: newQRData.specifications ? 
          Object.fromEntries(
            newQRData.specifications.split('\n')
              .filter(line => line.includes(':'))
              .map(line => {
                const [key, value] = line.split(':').map(s => s.trim());
                return [key, value];
              })
          ) : {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create new batch
      const newBatch: ProductBatch = {
        id: `batch_${Date.now()}`,
        productId: newProduct.id,
        batchNumber: `${newProduct.model.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        quantity: 1,
        manufacturingDate: new Date(),
        status: 'printed',
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Generate single QR code unit
      const newUnits = await generateProductUnits(newProduct.id, newBatch.id, 1);
      
      // Update state
      setProducts(prev => [...prev, newProduct]);
      setBatches(prev => [...prev, newBatch]);
      setUnits(prev => [...prev, ...newUnits]);
      
      // Reset form
      setNewQRData({
        productName: '',
        brand: '',
        model: '',
        category: '',
        warrantyMonths: 12,
        description: '',
        specifications: ''
      });
      setShowCreateForm(false);
      
      // Show QR code preview
      setPreviewUnit(newUnits[0]);
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setGeneratingNewQR(false);
    }
  };

  const handlePreviewLayout = (batch: ProductBatch) => {
    const batchUnits = getBatchUnits(batch.id);
    if (batchUnits.length === 0) {
      alert('No QR codes generated for this batch yet.');
      return;
    }
    
    setSelectedBatch(batch);
    setShowPreview(true);
  };

  const PreviewModal = () => {
    if (!selectedBatch || !showPreview) return null;
    
    const batchUnits = getBatchUnits(selectedBatch.id);
    const pages = layoutStickersForA4(batchUnits);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Print Preview - {selectedBatch.batchNumber}</h2>
                <p className="text-gray-600">{batchUnits.length} QR codes, {pages.length} pages</p>
              </div>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            {pages.map((page, pageIndex) => (
              <div key={pageIndex} className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Page {page.pageNumber}</h3>
                <div className="grid grid-cols-10 gap-2">
                  {page.rows.map((row: any[], rowIndex: number) =>
                    row.map((unit, colIndex) => (
                      <div key={`${rowIndex}-${colIndex}`} className="border rounded p-2 text-center">
                        <div className="w-12 h-12 bg-gray-200 mx-auto mb-1 flex items-center justify-center">
                          <QrCode className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="text-xs font-mono">{unit.serialKey}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CreateQRModal = () => {
    if (!showCreateForm) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Create New QR Code</h2>
                <p className="text-gray-600">Generate a single QR code for a new product</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <Input
                  value={newQRData.productName}
                  onChange={(e) => setNewQRData({...newQRData, productName: e.target.value})}
                  placeholder="Enter product name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <Input
                  value={newQRData.brand}
                  onChange={(e) => setNewQRData({...newQRData, brand: e.target.value})}
                  placeholder="Enter brand name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <Input
                  value={newQRData.model}
                  onChange={(e) => setNewQRData({...newQRData, model: e.target.value})}
                  placeholder="Enter model number"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={newQRData.category} onValueChange={(value) => setNewQRData({...newQRData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Appliances">Appliances</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Period (Months)
                </label>
                <Input
                  type="number"
                  value={newQRData.warrantyMonths}
                  onChange={(e) => setNewQRData({...newQRData, warrantyMonths: parseInt(e.target.value) || 12})}
                  placeholder="12"
                  min="1"
                  max="120"
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newQRData.description}
                onChange={(e) => setNewQRData({...newQRData, description: e.target.value})}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <textarea
                value={newQRData.specifications}
                onChange={(e) => setNewQRData({...newQRData, specifications: e.target.value})}
                placeholder="Enter specifications (one per line, format: Key: Value)&#10;Example:&#10;Display: 6.1 inch OLED&#10;Battery: 3000mAh&#10;Storage: 128GB"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: &quot;Key: Value&quot; (one per line)
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
                disabled={generatingNewQR}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewQR}
                disabled={generatingNewQR || !newQRData.productName || !newQRData.brand || !newQRData.model}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {generatingNewQR ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
              <p className="text-gray-600 mt-2">
                Generate, manage, and print QR codes for product batches
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Create New QR Code
              </Button>
              <Link href="/admin/batches/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search batches or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="printed">Printed</SelectItem>
                <SelectItem value="distributed">Distributed</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">QR Codes Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{units.length}</p>
                </div>
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Printed Batches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {batches.filter(b => b.status === 'printed' || b.status === 'distributed').length}
                  </p>
                </div>
                <Printer className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activated Units</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {units.filter(u => u.status === 'activated').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => {
            const StatusIcon = getStatusIcon(batch.status);
            const batchUnits = getBatchUnits(batch.id);
            const hasQRCodes = batchUnits.length > 0;
            
            return (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{batch.batchNumber}</span>
                        <StatusIcon className="h-4 w-4 text-gray-500" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {getProductName(batch.productId)}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-medium">{batch.quantity} units</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">QR Codes:</span>
                      <span className="font-medium">
                        {hasQRCodes ? `${batchUnits.length} generated` : 'Not generated'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Manufacturing:</span>
                      <span className="font-medium">{formatDateToYYYYMMDD(batch.manufacturingDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="font-medium">{formatDateToYYYYMMDD(batch.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t space-y-3">
                    {!hasQRCodes ? (
                      <Button
                        onClick={() => handleGenerateQRCodes(batch)}
                        disabled={generatingQR === batch.id}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        {generatingQR === batch.id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <QrCode className="h-4 w-4 mr-2" />
                            Generate QR Codes
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewLayout(batch)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(batch)}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handlePreviewLayout(batch)}
                        >
                          <Grid3X3 className="h-4 w-4 mr-2" />
                          View Layout ({Math.ceil(batchUnits.length / 50)} pages)
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBatches.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create a batch to start generating QR codes'
              }
            </p>
            <Link href="/admin/batches/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </Link>
          </div>
        )}

        <PreviewModal />
        <CreateQRModal />
        
        {/* QR Code Preview Modal */}
        {previewUnit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <QRCodePreview
              unit={previewUnit}
              productName={newQRData.productName}
              onClose={() => setPreviewUnit(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}