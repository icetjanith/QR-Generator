'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { mockShops } from '@/lib/mock-data';
import { Shop, User } from '@/types';
import { Plus, Search, Edit, Trash2, Store, MapPin, Mail, Phone, User as UserIcon, Eye, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ShopsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>(mockShops);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredShops, setFilteredShops] = useState<Shop[]>(shops);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    const filtered = shops.filter(shop =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShops(filtered);
  }, [searchTerm, shops]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (shopId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setShops(prev => prev.map(shop => 
      shop.id === shopId 
        ? { ...shop, status: newStatus, updatedAt: new Date() }
        : shop
    ));
  };

  const handleDeleteShop = (shopId: string) => {
    if (confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      setShops(prev => prev.filter(shop => shop.id !== shopId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
              <p className="text-gray-600 mt-2">
                Manage retail shops and their owner accounts
              </p>
            </div>
            <Link href="/admin/shops/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Shop
              </Button>
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shops by name, owner, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shops</p>
                  <p className="text-2xl font-bold text-gray-900">{shops.length}</p>
                </div>
                <Store className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Shops</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shops.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Shops</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shops.filter(s => s.status === 'inactive').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shops.filter(s => s.status === 'suspended').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Store className="h-5 w-5 text-blue-600" />
                      <span>{shop.name}</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Owner: {shop.ownerName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shop.status)}`}>
                      {shop.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/shops/${shop.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/shops/${shop.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Shop
                        </DropdownMenuItem>
                        {shop.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'suspended')}>
                            Suspend Shop
                          </DropdownMenuItem>
                        )}
                        {shop.status === 'suspended' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'active')}>
                            Activate Shop
                          </DropdownMenuItem>
                        )}
                        {shop.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(shop.id, 'inactive')}>
                            Deactivate Shop
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteShop(shop.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Shop
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{shop.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{shop.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{shop.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{shop.ownerName}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: {shop.createdAt.toLocaleDateString()}</span>
                    <span>Updated: {shop.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first shop'}
            </p>
            <Link href="/admin/shops/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Shop
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}