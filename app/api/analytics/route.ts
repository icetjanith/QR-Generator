import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductUnit from '@/models/ProductUnit';
import WarrantyClaim from '@/models/WarrantyClaim';
import { verifyToken } from '@/lib/auth-db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get analytics data
    const [
      totalProducts,
      totalUnits,
      activatedUnits,
      activeClaims,
      recentActivations,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      ProductUnit.countDocuments(),
      ProductUnit.countDocuments({ status: 'activated' }),
      WarrantyClaim.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      ProductUnit.find({ status: 'activated' })
        .sort({ activatedAt: -1 })
        .limit(10),
    ]);

    // Calculate warranty expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const warrantyExpiringSoon = await ProductUnit.countDocuments({
      status: 'activated',
      warrantyExpiresAt: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    });

    const activationRate = totalUnits > 0 ? Math.round((activatedUnits / totalUnits) * 100) : 0;

    const analytics = {
      totalProducts,
      totalUnits,
      activatedUnits,
      activationRate,
      warrantyExpiringSoon,
      activeClaims,
      openTickets: 0, // Implement when support tickets are added
      recentActivations,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}