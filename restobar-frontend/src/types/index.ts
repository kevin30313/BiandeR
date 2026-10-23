// src/types/index.ts

export type UserRole = 'ADMIN' | 'WAITER' | 'KITCHEN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export type TableStatus = 'FREE' | 'BUSY' | 'WAITING_BILL';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
}

export type OrderStatus = 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'PAID';

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}