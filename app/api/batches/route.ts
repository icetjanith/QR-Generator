import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductBatch from '@/models/ProductBatch';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth-db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = {};

    if (search) {
      query.batchNumber = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const batches = await ProductBatch.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Populate product information
    const batchesWithProducts = await Promise.all(
      batches.map(async (batch) => {
        const product = await Product.findById(batch.productId);
        return {
          ...batch.toObject(),
          product,
        };
      })
    );

    const total = await ProductBatch.countDocuments(query);

    return NextResponse.json({
      batches: batchesWithProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Batches fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
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

    const batchData = await request.json();
    const batch = new ProductBatch({
      ...batchData,
      createdBy: user.id,
    });

    await batch.save();

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Batch creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}