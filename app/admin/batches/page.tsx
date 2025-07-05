'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { mockBatches, mockProducts } from '@/lib/mock-data';
import { ProductBatch } from '@/types';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { Plus, Search, QrCode, Download, Eye, Package } from 'lucide-react';
import Link from 'next/link';

export default function BatchesPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [batches, setBatches] = useState<ProductBatch[]>(mockBatches);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBatches, setFilteredBatches] = useState<ProductBatch[]>(batches);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasRole(user, ['admin', 'shop_owner', 'inventory_user'])) {
      router.push('/');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const filtered = batches.filter(batch =>
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBatches(filtered);
  }, [searchTerm, batches]);

  if (!user) {
    return <div>Loading...</div>;
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

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Batches</h1>
              <p className="text-gray-600 mt-2">
                Manage product batches and QR code generation
              </p>
            </div>
            <Link href="/admin/batches/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{batch.batchNumber}</CardTitle>
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
                    <span className="text-sm text-gray-600">Manufacturing:</span>
                    <span className="font-medium">{formatDateToYYYYMMDD(batch.manufacturingDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="font-medium">{formatDateToYYYYMMDD(batch.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <QrCode className="h-4 w-4 mr-1" />
                      QR Codes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBatches.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first batch'}
            </p>
            <Link href="/admin/batches/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}