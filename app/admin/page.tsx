'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { mockAnalytics } from '@/lib/mock-data';
import { Analytics } from '@/types';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { 
  Package, 
  QrCode, 
  Shield, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Ticket,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);
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

    if (!hasRole(user, ['admin', 'shop_owner', 'inventory_user'])) {
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

  const stats = [
    {
      title: 'Total Products',
      value: analytics.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Product Units',
      value: analytics.totalUnits,
      icon: QrCode,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Activated Units',
      value: analytics.activatedUnits,
      icon: Shield,
      color: 'bg-purple-500',
      change: '+15%',
    },
    {
      title: 'Activation Rate',
      value: `${analytics.activationRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%',
    },
    {
      title: 'Expiring Soon',
      value: analytics.warrantyExpiringSoon,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-2%',
    },
    {
      title: 'Active Claims',
      value: analytics.activeClaims,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+3%',
    },
    {
      title: 'Open Tickets',
      value: analytics.openTickets,
      icon: Ticket,
      color: 'bg-indigo-500',
      change: '+1%',
    },
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'bg-teal-500',
      change: '+7%',
    },
  ];

  const quickActions = [
    {
      title: 'Create Product',
      description: 'Add new products to the system',
      href: '/admin/products/create',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Generate QR Codes',
      description: 'Create QR codes for product batches',
      href: '/admin/qr-codes',
      icon: QrCode,
      color: 'bg-green-500',
    },
    {
      title: 'Manage Claims',
      description: 'Process warranty claims',
      href: '/admin/claims',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Support Tickets',
      description: 'Handle customer support requests',
      href: '/admin/tickets',
      icon: Ticket,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.name}. Here&rsquo;s what&rsquo;s happening with your warranty system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used actions for managing your warranty system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest warranty activations and system updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivations.slice(0, 5).map((activation, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activation.customerName} activated warranty
                      </p>
                      <p className="text-xs text-gray-500">
                        Serial: {activation.serialKey}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {activation.activatedAt ? formatDateToYYYYMMDD(activation.activatedAt) : ''}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/products">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage products, categories, and specifications</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/batches">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Batches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Create and manage product batches with QR codes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">View detailed analytics and reports</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}