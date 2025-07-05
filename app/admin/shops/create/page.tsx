'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { User } from '@/types';
import { ArrowLeft, Store, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateShopPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

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

    if (!hasRole(user, ['admin'])) {
      router.push('/');
      return;
    }
  }, [user, router, mounted]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }

    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Please enter a valid email address';
    }

    if (!formData.ownerPassword) {
      newErrors.ownerPassword = 'Password is required';
    } else if (formData.ownerPassword.length < 6) {
      newErrors.ownerPassword = 'Password must be at least 6 characters';
    }

    if (formData.ownerPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would create the shop and owner account
      console.log('Creating shop:', {
        shop: {
          name: formData.shopName,
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
          phone: formData.phone,
          email: formData.ownerEmail,
          ownerName: formData.ownerName,
          status: 'active',
        },
        owner: {
          name: formData.ownerName,
          email: formData.ownerEmail,
          password: formData.ownerPassword,
          role: 'shop_owner',
        }
      });

      // Show success message and redirect
      alert('Shop and owner account created successfully!');
      router.push('/admin/shops');
    } catch (error) {
      console.error('Shop creation error:', error);
      alert('Failed to create shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/admin/shops">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shops
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Shop</h1>
              <p className="text-gray-600 mt-2">
                Create a new retail shop and owner account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Shop Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>Shop Information</span>
              </CardTitle>
              <CardDescription>
                Basic information about the retail shop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name *</Label>
                  <Input
                    id="shopName"
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    placeholder="Enter shop name"
                    className={errors.shopName ? 'border-red-500' : ''}
                  />
                  {errors.shopName && (
                    <p className="text-sm text-red-600">{errors.shopName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                  rows={2}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP"
                    className={errors.zipCode ? 'border-red-500' : ''}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-600">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Account Information</CardTitle>
              <CardDescription>
                Create login credentials for the shop owner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Full Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="Enter owner's full name"
                    className={errors.ownerName ? 'border-red-500' : ''}
                  />
                  {errors.ownerName && (
                    <p className="text-sm text-red-600">{errors.ownerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Owner Email Address *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    placeholder="Enter owner's email"
                    className={errors.ownerEmail ? 'border-red-500' : ''}
                  />
                  {errors.ownerEmail && (
                    <p className="text-sm text-red-600">{errors.ownerEmail}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    This will be used for login credentials
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ownerPassword">Password *</Label>
                  <Input
                    id="ownerPassword"
                    type="password"
                    value={formData.ownerPassword}
                    onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                    placeholder="Enter password"
                    className={errors.ownerPassword ? 'border-red-500' : ''}
                  />
                  {errors.ownerPassword && (
                    <p className="text-sm text-red-600">{errors.ownerPassword}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Minimum 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link href="/admin/shops">
              <Button variant="outline" disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Shop...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Shop & Owner Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}