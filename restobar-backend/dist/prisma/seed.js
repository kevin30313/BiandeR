"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const plainPassword = 'restobar2026';
    const hashedPassword = await bcryptjs_1.default.hash(plainPassword, 10);
    // 1. Usuarios iniciales del sistema bajo el dominio @errandbi.com
    const usersToSeed = [
        {
            name: 'Administrador Sistema',
            email: 'admin@errandbi.com',
            role: client_1.Role.ADMIN,
        },
        {
            name: 'Caja Principal',
            email: 'caja@errandbi.com',
            role: client_1.Role.CASHIER,
        },
        {
            name: 'Garzon Turno',
            email: 'mesero@errandbi.com',
            role: client_1.Role.WAITER,
        },
        {
            name: 'Cocina Central',
            email: 'kitchen@errandbi.com',
            role: client_1.Role.KITCHEN,
        },
    ];
    for (const user of usersToSeed) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password: hashedPassword,
                role: user.role,
            },
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
    console.log('✅ Base de datos poblada y usuarios sincronizados con éxito (@errandbi.com)');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
