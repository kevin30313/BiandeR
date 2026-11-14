"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeShift = exports.getDailySalesReport = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getDailySalesReport = async (req, res) => {
    try {
        const { date } = req.query;
        let startOfDay;
        let endOfDay;
        if (date && typeof date === 'string') {
            const [year, month, day] = date.split('-').map(Number);
            startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
            endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        }
        else {
            const now = new Date();
            startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
        const payments = await prisma_1.default.payment.findMany({
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
        let totalCash = 0;
        let totalPosDebit = 0;
        let totalPosCredit = 0;
        let totalTransfer = 0;
        const productSalesMap = {};
        payments.forEach((p) => {
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
        const { openedAt } = req.body;
        const shiftStart = openedAt ? new Date(openedAt) : new Date(new Date().setHours(0, 0, 0, 0));
        const shiftEnd = new Date();
        const payments = await prisma_1.default.payment.findMany({
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
        const shiftClose = await prisma_1.default.shiftClose.create({
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
