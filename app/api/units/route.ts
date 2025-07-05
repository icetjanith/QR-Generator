import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductUnit from '@/models/ProductUnit';
import Product from '@/models/Product';
import ProductBatch from '@/models/ProductBatch';
import { verifyToken } from '@/lib/auth-db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = {};

    if (batchId) {
      query.batchId = batchId;
    }

    if (status) {
      query.status = status;
    }

    const units = await ProductUnit.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ProductUnit.countDocuments(query);

    return NextResponse.json({
      units,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Units fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || !['admin', 'shop_owner', 'inventory_user'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const unitsData = await request.json();
    
    // Handle bulk creation
    if (Array.isArray(unitsData)) {
      const units = await ProductUnit.insertMany(unitsData);
      return NextResponse.json(units, { status: 201 });
    } else {
      const unit = new ProductUnit(unitsData);
      await unit.save();
      return NextResponse.json(unit, { status: 201 });
    }
  } catch (error) {
    console.error('Unit creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create units' },
      { status: 500 }
    );
  }
}