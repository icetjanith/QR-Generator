'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { Product, User } from '@/types';
import { ArrowLeft, Package, Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface SpecificationPair {
  key: string;
  value: string;
}

export default function EditProductPage() {
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    warrantyDurationMonths: 12,
    imageUrl: '',
    specifications: [] as SpecificationPair[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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

    if (!hasRole(user, ['admin', 'shop_owner'])) {
      router.push('/');
      return;
    }
  }, [user, router, mounted]);

  useEffect(() => {
    if (!mounted || !user || !productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProduct(productId);
        setProduct(response);

        const specificationsArray = Object.entries(response.specifications || {}).map(([key, value]) => ({
          key,
          value
        }));

        setFormData({
          name: response.name,
          description: response.description,
          category: response.category,
          brand: response.brand,
          model: response.model,
          warrantyDurationMonths: response.warrantyDurationMonths,
          imageUrl: response.imageUrl || '',
          specifications: specificationsArray.length > 0 ? specificationsArray : [{ key: '', value: '' }],
        });
      } catch (error) {
        console.error('Failed to fetch product:', error);
        alert('Failed to load product details.');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [mounted, user, productId, router]);




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
            <p className="text-gray-600 mb-4">
              The product you&#39;re trying to edit doesn&#39;t exist or has been removed.
            </p>
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (formData.warrantyDurationMonths < 1 || formData.warrantyDurationMonths > 120) {
      newErrors.warrantyDurationMonths = 'Warranty duration must be between 1 and 120 months';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Convert specifications array to object
      const specifications = formData.specifications
        .filter(spec => spec.key.trim() && spec.value.trim())
        .reduce((acc, spec) => {
          acc[spec.key.trim()] = spec.value.trim();
          return acc;
        }, {} as Record<string, string>);

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        warrantyDurationMonths: formData.warrantyDurationMonths,
        imageUrl: formData.imageUrl.trim() || undefined,
        specifications,
      };

      await apiClient.updateProduct(productId, updateData);

      alert('Product updated successfully!');
      router.push(`/admin/products/${productId}`);
    } catch (error) {
      console.error('Product update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const categories = [
    'Electronics',
    'Appliances',
    'Automotive',
    'Tools',
    'Furniture',
    'Sports',
    'Wearables',
    'Audio',
    'Computing',
    'Mobile',
    'Gaming',
    'Home & Garden',
    'Health & Beauty',
    'Toys',
    'Books',
    'Clothing',
    'General'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/admin/products/${productId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">
                Update product information and specifications
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Essential product details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand name"
                    className={errors.brand ? 'border-red-500' : ''}
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-600">{errors.brand}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Enter model number"
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && (
                    <p className="text-sm text-red-600">{errors.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyDurationMonths">Warranty Duration (Months) *</Label>
                  <Input
                    id="warrantyDurationMonths"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.warrantyDurationMonths}
                    onChange={(e) => handleInputChange('warrantyDurationMonths', parseInt(e.target.value) || 12)}
                    placeholder="12"
                    className={errors.warrantyDurationMonths ? 'border-red-500' : ''}
                  />
                  {errors.warrantyDurationMonths && (
                    <p className="text-sm text-red-600">{errors.warrantyDurationMonths}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter warranty duration in months (1-120)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Product Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? 'border-red-500' : ''}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-600">{errors.imageUrl}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Optional: URL to product image
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter detailed product description"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
              <CardDescription>
                Update technical specifications and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex space-x-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`spec-key-${index}`}>Specification Name</Label>
                    <Input
                      id={`spec-key-${index}`}
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      placeholder="e.g., Display, Battery, Storage"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`spec-value-${index}`}>Value</Label>
                    <Input
                      id={`spec-value-${index}`}
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      placeholder="e.g., 6.1 inch OLED, 3000mAh, 128GB"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSpecification(index)}
                    disabled={formData.specifications.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addSpecification}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link href={`/admin/products/${productId}`}>
              <Button variant="outline" disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Product...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}