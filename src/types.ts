export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  supplierId?: string;
  location?: string;
  quantity: number;
  minStock: number;
  price: number;
  costPrice?: number;
  unit: string;
  description: string;
  updatedAt: any;
  updatedBy: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: any;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER' | 'RETURN';

export interface Transaction {
  id: string;
  productId: string;
  productName?: string;
  type: TransactionType;
  reason?: 'RESTOCK' | 'SALE' | 'DAMAGE' | 'LOSS' | 'CORRECTION' | 'RETURN';
  quantity: number;
  previousStock: number;
  currentStock: number;
  userId: string;
  userName?: string;
  timestamp: any;
  note: string;
}
