import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const shops = await Shop.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Shop.countDocuments(query);

    return NextResponse.json({
      shops,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Shops fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const shopData = await request.json();
    
    // Check if shop email already exists
    const existingShop = await Shop.findOne({ email: shopData.ownerEmail });
    if (existingShop) {
      return NextResponse.json(
        { error: 'A shop with this email already exists' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email: shopData.ownerEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create the shop
    const shop = new Shop({
      name: shopData.shopName,
      address: `${shopData.address}, ${shopData.city}, ${shopData.state} ${shopData.zipCode}, ${shopData.country}`,
      phone: shopData.phone,
      email: shopData.ownerEmail,
      ownerName: shopData.ownerName,
      status: 'active',
    });

    await shop.save();

    // Create the shop owner user account
    const shopOwner = new User({
      email: shopData.ownerEmail,
      name: shopData.ownerName,
      password: shopData.ownerPassword,
      role: 'shop_owner',
      shopId: shop._id.toString(),
    });

    await shopOwner.save();

    return NextResponse.json({
      shop,
      owner: {
        id: shopOwner._id,
        email: shopOwner.email,
        name: shopOwner.name,
        role: shopOwner.role,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Shop creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 }
    );
  }
}