import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, QrCode, Users, BarChart3, HeadphonesIcon, FileText } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Generate unique QR codes for each product with secure serial keys and bulk printing capabilities.',
    },
    {
      icon: Shield,
      title: 'Warranty Management',
      description: 'Complete warranty lifecycle management from activation to claims processing.',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Role-based access control for admins, shop owners, inventory users, and middlemen.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for warranty activations and claim insights.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Customer Support',
      description: 'Integrated support system with ticket management and knowledge base.',
    },
    {
      icon: FileText,
      title: 'Claim Processing',
      description: 'Streamlined warranty claim processing with status tracking and resolution management.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20"></div>
                <Shield className="relative h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Advanced Warranty
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Revolutionize your warranty management with QR code technology, automated tracking, 
              and comprehensive customer support. Streamline operations from manufacturing to claims.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage warranties efficiently and provide exceptional customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Warranty Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to streamline their warranty operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}