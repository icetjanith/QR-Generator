import { User } from '@/types';

// Mock authentication - in production, integrate with Auth0 or similar
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@warranty.com',
    name: 'System Administrator',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'shop@warranty.com',
    name: 'Shop Owner',
    role: 'shop_owner',
    shopId: 'shop1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function authenticateUser(email: string, password: string): User | null {
  // Mock authentication logic
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password123') {
    return user;
  }
  return null;
}

export function getCurrentUser(): User | null {
  // In production, this would check JWT/session
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
  }
}

export function hasRole(user: User, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}