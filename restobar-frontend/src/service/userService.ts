type UserRole = 'ADMIN' | 'KITCHEN' | 'WAITER' | 'CASHIER';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

type CreateUserInput = Pick<User, 'name' | 'email' | 'role'>;

const STORAGE_KEY = 'restobar_users_mock';

const initialUsers: User[] = [
  { id: '1', name: 'Admin Restobar', email: 'admin@restobar.cl', role: 'ADMIN', active: true },
  { id: '2', name: 'Cocina Principal', email: 'cocina@restobar.cl', role: 'KITCHEN', active: true },
  { id: '3', name: 'Juan Garzón', email: 'juan@restobar.cl', role: 'WAITER', active: true },
  { id: '4', name: 'Maria Caja', email: 'maria@restobar.cl', role: 'CASHIER', active: true },
];

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(data);
};

export const createUser = (input: CreateUserInput): User => {
  const users = getUsers();
  const newUser: User = {
    id: Date.now().toString(),
    name: input.name,
    email: input.email,
    role: input.role,
    active: true,
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return newUser;
};

export const toggleUserStatus = (id: string): User[] => {
  const users = getUsers().map((u) =>
    u.id === id ? { ...u, active: !u.active } : u
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
};

export const deleteUser = (id: string): User[] => {
  const users = getUsers().filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
};