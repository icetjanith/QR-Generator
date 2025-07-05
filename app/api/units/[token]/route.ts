import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductUnit from '@/models/ProductUnit';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();
    
    const unit = await ProductUnit.findOne({ qrToken: params.token });
    if (!unit) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = await Product.findById(unit.productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      unit,
      product,
    });
  } catch (error) {
    console.error('Unit fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    
    const unit = await ProductUnit.findOneAndUpdate(
      { qrToken: params.token },
      updateData,
      { new: true }
    );

    if (!unit) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error('Unit update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}