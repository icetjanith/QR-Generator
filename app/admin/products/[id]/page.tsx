'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { Product, User } from '@/types';
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  Trash2, 
  Clock, 
  Tag, 
  Building, 
  Calendar,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    setMounted(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

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
    if (!mounted || !user || !productId) return;
    
    fetchProduct();
  }, [mounted, user, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProduct(productId);
      setProduct(response);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Failed to load product details.');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        await apiClient.deleteProduct(product.id);
        alert('Product deleted successfully!');
        router.push('/admin/products');
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  if (!mounted || !user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The product you&#39;re trying to view doesn&#39;t exist or has been removed.</p>
            <Link href="/admin/products">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-1">
                  {product.brand} • {product.model} • {product.category}
                </p>
              </div>
            </div>
            
            {hasRole(user, ['admin', 'shop_owner']) && (
              <div className="flex space-x-3">
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleDeleteProduct}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Product Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-80 object-cover rounded-lg border"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-100 rounded-lg border flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No image available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Product Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Category:</span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Brand:</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Model:</span>
                      <span className="font-medium">{product.model}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Warranty:</span>
                      <span className="font-medium">{product.warrantyDurationMonths} months</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Updated:</span>
                      <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{key}:</span>
                        <span className="text-sm text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specifications available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}