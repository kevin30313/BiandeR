import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDailySalesReport = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    let startOfDay: Date;
    let endOfDay: Date;

    if (date && typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

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

    const cashSales = await prisma.cashSale.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      include: {
        table: true,
        orders: { include: { order: { include: { items: { include: { product: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalCash = 0;
    let totalPosDebit = 0;
    let totalPosCredit = 0;
    let totalTransfer = 0;
    let totalMixed = 0;
    let totalUnassigned = 0;

    const productSalesMap: Record<
      string,
      { name: string; quantity: number; totalAmount: number }
    > = {};

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
        case 'MIXED':
          totalMixed += p.amount;
          break;
      }

      p.order.items.forEach((item) => {
        const prodId = item.productId;
        const itemTotal = item.unitPrice * item.quantity;

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

    cashSales.forEach((sale) => {
      switch (sale.paymentMethod) {
        case 'CASH': totalCash += sale.totalAmount; break;
        case 'POS_DEBIT': totalPosDebit += sale.totalAmount; break;
        case 'POS_CREDIT': totalPosCredit += sale.totalAmount; break;
        case 'TRANSFER': totalTransfer += sale.totalAmount; break;
        case 'MIXED': totalMixed += sale.totalAmount; break;
        default: totalUnassigned += sale.totalAmount;
      }
      sale.orders.forEach(({ order }) => order.items.forEach((item) => {
        const prodId = item.productId;
        const itemTotal = item.unitPrice * item.quantity;
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = { name: item.product.name, quantity: 0, totalAmount: 0 };
        }
        productSalesMap[prodId].quantity += item.quantity;
        productSalesMap[prodId].totalAmount += itemTotal;
      }));
    });

    const topProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);
    const totalSales = totalCash + totalPosDebit + totalPosCredit + totalTransfer + totalMixed + totalUnassigned;

    return res.json({
      date: startOfDay.toISOString().split('T')[0],
      summary: {
        totalSales,
        totalTransactions: payments.length + cashSales.length,
        byMethod: {
          cash: totalCash,
          posDebit: totalPosDebit,
          posCredit: totalPosCredit,
          posTotal: totalPosDebit + totalPosCredit,
          transfer: totalTransfer,
          mixed: totalMixed,
          unassigned: totalUnassigned,
        },
      },
      topProducts,
      payments,
      cashSales,
    });
  } catch (error) {
    console.error('Error al generar reporte diario:', error);
    return res.status(500).json({ message: 'Error al generar el reporte de ventas' });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { openedAt } = req.body;

    const shiftStart = openedAt ? new Date(openedAt) : new Date(new Date().setHours(0, 0, 0, 0));
    const shiftEnd = new Date();

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: shiftStart,
          lte: shiftEnd,
        },
        order: { cashSaleOrder: null },
      },
    });

    const cashSales = await prisma.cashSale.findMany({
      where: { createdAt: { gte: shiftStart, lte: shiftEnd } },
      select: { totalAmount: true, paymentMethod: true },
    });

    let totalCash = 0;
    let totalPos = 0;
    let totalPosDebit = 0;
    let totalPosCredit = 0;
    let totalTransfer = 0;
    let totalMixed = 0;
    let totalUnassigned = 0;

    payments.forEach((p) => {
      if (p.paymentMethod === 'CASH') {
        totalCash += p.amount;
      } else if (p.paymentMethod === 'POS_DEBIT' || p.paymentMethod === 'POS_CREDIT') {
        totalPos += p.amount;
        if (p.paymentMethod === 'POS_DEBIT') totalPosDebit += p.amount;
        else totalPosCredit += p.amount;
      } else if (p.paymentMethod === 'TRANSFER') {
        totalTransfer += p.amount;
      } else if (p.paymentMethod === 'MIXED') {
        totalMixed += p.amount;
      }
    });

    cashSales.forEach((sale) => {
      switch (sale.paymentMethod) {
        case 'CASH': totalCash += sale.totalAmount; break;
        case 'POS_DEBIT': totalPos += sale.totalAmount; totalPosDebit += sale.totalAmount; break;
        case 'POS_CREDIT': totalPos += sale.totalAmount; totalPosCredit += sale.totalAmount; break;
        case 'TRANSFER': totalTransfer += sale.totalAmount; break;
        case 'MIXED': totalMixed += sale.totalAmount; break;
        default: totalUnassigned += sale.totalAmount;
      }
    });

    const totalAmount = totalCash + totalPos + totalTransfer + totalMixed + totalUnassigned;

    const shiftClose = await prisma.shiftClose.create({
      data: {
        openedAt: shiftStart,
        closedAt: shiftEnd,
        totalCash,
        totalPos,
        totalAmount,
        totalPosDebit,
        totalPosCredit,
        totalTransfer,
        totalMixed,
        totalUnassigned,
        salesCount: payments.length + cashSales.length,
      },
    });

    return res.status(201).json({
      message: 'Cierre de turno realizado con éxito',
      shiftClose,
    });
  } catch (error) {
    console.error('Error al realizar el cierre de turno:', error);
    return res.status(500).json({ message: 'Error al realizar el cierre de turno' });
  }
};
