export type UserRole = 'ADMIN' | 'KITCHEN' | 'WAITER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}
