import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'shop_owner' | 'inventory_user' | 'middleman';
  shopId?: string;
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    await connectDB();
    
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return null;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      shopId: decoded.shopId,
    };
  } catch (error) {
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'shop_owner' | 'inventory_user' | 'middleman';
  shopId?: string;
}): Promise<AuthUser | null> {
  try {
    await connectDB();
    
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User(userData);
    await user.save();

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId,
    };
  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
}