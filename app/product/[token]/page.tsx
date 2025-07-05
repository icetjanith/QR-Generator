'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockUnits, mockProducts } from '@/lib/mock-data';
import { ProductUnit, Product } from '@/types';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { 
  Shield, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock,
  HeadphonesIcon,
  FileText
} from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const token = params.token as string;
  const [productUnit, setProductUnit] = useState<ProductUnit | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [showActivationForm, setShowActivationForm] = useState(false);
  const [activationData, setActivationData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shopId: '',
  });

  useEffect(() => {
    // Find product unit by token
    const unit = mockUnits.find(u => u.qrToken === token);
    setProductUnit(unit || null);
    
    if (unit) {
      const prod = mockProducts.find(p => p.id === unit.productId);
      setProduct(prod || null);
    }
  }, [token]);

  const handleActivation = () => {
    if (!productUnit) return;

    // Mock activation logic
    const updatedUnit = {
      ...productUnit,
      status: 'activated' as const,
      activatedAt: new Date(),
      warrantyExpiresAt: new Date(Date.now() + (product?.warrantyDurationMonths || 12) * 30 * 24 * 60 * 60 * 1000),
      ...activationData,
    };

    setProductUnit(updatedUnit);
    setShowActivationForm(false);
  };

  if (!productUnit || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Product Not Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              The QR code you scanned doesn't match any product in our system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWarrantyActive = productUnit.status === 'activated' && 
    productUnit.warrantyExpiresAt && 
    new Date() < productUnit.warrantyExpiresAt;

  const warrantyDaysRemaining = productUnit.warrantyExpiresAt 
    ? Math.ceil((productUnit.warrantyExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">{product.brand} • {product.model}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Serial: {productUnit.serialKey}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              productUnit.status === 'activated' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {productUnit.status === 'activated' ? 'Warranty Active' : 'Not Activated'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model:</span>
                    <span className="font-medium">{product.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warranty Period:</span>
                    <span className="font-medium">{product.warrantyDurationMonths} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warranty & Actions */}
          <div className="space-y-6">
            {/* Warranty Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Warranty Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productUnit.status === 'activated' ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Warranty Active</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Activated: {productUnit.activatedAt ? formatDateToYYYYMMDD(productUnit.activatedAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Expires: {productUnit.warrantyExpiresAt ? formatDateToYYYYMMDD(productUnit.warrantyExpiresAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {warrantyDaysRemaining} days remaining
                        </span>
                      </div>
                    </div>

                    {productUnit.customerName && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{productUnit.customerName}</span>
                          </div>
                          {productUnit.customerEmail && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{productUnit.customerEmail}</span>
                            </div>
                          )}
                          {productUnit.customerPhone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{productUnit.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Warranty Not Activated
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This product's warranty has not been activated yet. Contact your retailer to activate the warranty.
                    </p>
                    <Button onClick={() => setShowActivationForm(true)}>
                      Activate Warranty
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HeadphonesIcon className="h-5 w-5" />
                  <span>Customer Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    File Warranty Claim
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HeadphonesIcon className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    View Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activation Form Modal */}
        {showActivationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Activate Warranty</CardTitle>
                <CardDescription>
                  Please provide customer information to activate the warranty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <Input
                      value={activationData.customerName}
                      onChange={(e) => setActivationData({...activationData, customerName: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={activationData.customerEmail}
                      onChange={(e) => setActivationData({...activationData, customerEmail: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={activationData.customerPhone}
                      onChange={(e) => setActivationData({...activationData, customerPhone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowActivationForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleActivation}
                      className="flex-1"
                    >
                      Activate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}