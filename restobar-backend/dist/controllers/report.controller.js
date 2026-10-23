"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeShift = exports.getDailySalesReport = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDailySalesReport = async (req, res) => {
    try {
        const { date } = req.query;
        let startOfDay;
        let endOfDay;
        if (date && typeof date === 'string') {
            // Evitar desfasajes de zona horaria parseando año, mes y día de forma explícita
            const [year, month, day] = date.split('-').map(Number);
            startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
            endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        }
        else {
            const now = new Date();
            startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
        // 1. Obtener todos los pagos del rango de fecha
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: { product: true },
                        },
                        table: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // 2. Acumuladores de totales y productos más vendidos
        let totalCash = 0;
        let totalPosDebit = 0;
        let totalPosCredit = 0;
        let totalTransfer = 0;
        const productSalesMap = {};
        payments.forEach((p) => {
            // Sumar según método de pago
            switch (p.paymentMethod) {
                case 'CASH':
                    totalCash += p.amount;
                    break;
                case 'POS_DEBIT':
                    totalPosDebit += p.amount;
                    break;
                case 'POS_CREDIT':
                    totalPosCredit += p.amount;
                    break;
                case 'TRANSFER':
                    totalTransfer += p.amount;
                    break;
            }
            // Agrupar productos para ranking
            p.order.items.forEach((item) => {
                const prodId = item.productId;
                const itemTotal = item.product.price * item.quantity;
                if (!productSalesMap[prodId]) {
                    productSalesMap[prodId] = {
                        name: item.product.name,
                        quantity: 0,
                        totalAmount: 0,
                    };
                }
                productSalesMap[prodId].quantity += item.quantity;
                productSalesMap[prodId].totalAmount += itemTotal;
            });
        });
        // Ordenar top productos vendidos
        const topProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);
        const totalSales = totalCash + totalPosDebit + totalPosCredit + totalTransfer;
        return res.json({
            date: startOfDay.toISOString().split('T')[0],
            summary: {
                totalSales,
                totalTransactions: payments.length,
                byMethod: {
                    cash: totalCash,
                    posDebit: totalPosDebit,
                    posCredit: totalPosCredit,
                    posTotal: totalPosDebit + totalPosCredit,
                    transfer: totalTransfer,
                },
            },
            topProducts,
            payments,
        });
    }
    catch (error) {
        console.error('Error al generar reporte diario:', error);
        return res.status(500).json({ message: 'Error al generar el reporte de ventas' });
    }
};
exports.getDailySalesReport = getDailySalesReport;
const closeShift = async (req, res) => {
    try {
        const { openedAt } = req.body; // Fecha/hora de inicio del turno
        const shiftStart = openedAt ? new Date(openedAt) : new Date(new Date().setHours(0, 0, 0, 0));
        const shiftEnd = new Date();
        // Obtener los pagos realizados dentro del rango del turno
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: shiftStart,
                    lte: shiftEnd,
                },
            },
        });
        let totalCash = 0;
        let totalPos = 0;
        payments.forEach((p) => {
            if (p.paymentMethod === 'CASH') {
                totalCash += p.amount;
            }
            else if (p.paymentMethod === 'POS_DEBIT' || p.paymentMethod === 'POS_CREDIT') {
                totalPos += p.amount;
            }
        });
        const totalAmount = totalCash + totalPos;
        // Registrar el cierre de turno en la base de datos
        const shiftClose = await prisma.shiftClose.create({
            data: {
                openedAt: shiftStart,
                closedAt: shiftEnd,
                totalCash,
                totalPos,
                totalAmount,
            },
        });
        return res.status(201).json({
            message: 'Cierre de turno realizado con éxito',
            shiftClose,
        });
    }
    catch (error) {
        console.error('Error al realizar el cierre de turno:', error);
        return res.status(500).json({ message: 'Error al realizar el cierre de turno' });
    }
};
exports.closeShift = closeShift;
