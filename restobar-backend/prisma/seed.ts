import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  const plainPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!plainPassword) {
    throw new Error('Falta SEED_DEFAULT_PASSWORD. Configúrala en el entorno antes de ejecutar el seed.');
  }
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Usuario maestro. El personal se registra desde /admin/users.
  const usersToSeed = [
    {
      name: 'Administrador Sistema',
      email: 'admin@errandbi.com',
      role: Role.ADMIN,
    },
  ];

  for (const user of usersToSeed) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  // 2. Mesas iniciales
  for (let i = 1; i <= 5; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    });
  }

  console.log('✅ Base de datos poblada con el usuario ADMIN maestro y las mesas iniciales');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
