export type UserRole = 'ADMIN' | 'KITCHEN' | 'WAITER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}