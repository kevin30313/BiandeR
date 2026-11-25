import { PaymentMethod, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../prisma';

const chargeableStatuses = ['PENDING_APPROVAL', 'PENDING', 'IN_PREPARATION', 'READY', 'DELIVERED'] as const;
const paymentMethods = Object.values(PaymentMethod);

class NoChargeableOrdersError extends Error {}
class ConcurrentTableChargeError extends Error {}
class TableNotFoundError extends Error {}

const dateRange = (query: Request['query'] | Record<string, unknown>) => {
  const fromValue = query.from;
  const toValue = query.to;
  const now = new Date();
  const start = typeof fromValue === 'string' ? new Date(`${fromValue}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = typeof toValue === 'string' ? new Date(`${toValue}T23:59:59.999`) : now;
  return { start, end };
};

export const getChargeableTables = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: [...chargeableStatuses] },
        payment: null,
        cashSaleOrder: null,
      },
      include: { table: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const tables = new Map<string, {
      id: string;
      number: number;
      orders: typeof orders;
      totalAmount: number;
      itemTotals: Map<string, { productId: string; name: string; quantity: number; unitPrice: number; subtotal: number }>;
    }>();

    for (const order of orders) {
      let entry = tables.get(order.tableId);
      if (!entry) {
        entry = { id: order.tableId, number: order.table.number, orders: [], totalAmount: 0, itemTotals: new Map() };
        tables.set(order.tableId, entry);
      }
      entry.orders.push(order);
      entry.totalAmount += order.totalAmount;
      for (const item of order.items) {
        const key = `${item.productId}:${item.unitPrice}`;
        const itemTotal = item.unitPrice * item.quantity;
        const existing = entry.itemTotals.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.subtotal += itemTotal;
        } else {
          entry.itemTotals.set(key, {
            productId: item.productId,
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: itemTotal,
          });
        }
      }
    }

    return res.json([...tables.values()].map(({ itemTotals, ...table }) => ({
      ...table,
      items: [...itemTotals.values()],
    })));
  } catch (error) {
    console.error('Error consolidando mesas por cobrar:', error);
    return res.status(500).json({ message: 'Error al obtener las mesas por cobrar' });
  }
};

export const payTable = async (req: Request, res: Response) => {
  const tableId = req.params.tableId as string;
  const { paymentMethod, referenceNum } = req.body as { paymentMethod?: string | null; referenceNum?: string };
  if (paymentMethod && !paymentMethods.includes(paymentMethod as PaymentMethod)) {
    return res.status(400).json({ message: 'Método de pago no válido' });
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const table = await tx.table.findUnique({ where: { id: tableId } });
      if (!table) throw new TableNotFoundError('No se encontró la mesa');

      const orders = await tx.order.findMany({
        where: {
          tableId,
          status: { in: [...chargeableStatuses] },
          payment: null,
          cashSaleOrder: null,
        },
        select: { id: true, totalAmount: true },
      });
      if (orders.length === 0) throw new NoChargeableOrdersError('No hay órdenes pendientes de pago en esta mesa');

      const ids = orders.map((order) => order.id);
      const updated = await tx.order.updateMany({
        where: { id: { in: ids }, status: { in: [...chargeableStatuses] }, payment: null, cashSaleOrder: null },
        data: { status: 'PAID' },
      });
      if (updated.count !== ids.length) throw new ConcurrentTableChargeError('Las órdenes de la mesa cambiaron mientras se cobraba');

      const createdSale = await tx.cashSale.create({
        data: {
          tableId,
          totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          paymentMethod: paymentMethod ? paymentMethod as PaymentMethod : null,
          referenceNum: referenceNum?.trim() || null,
          isReconciled: Boolean(paymentMethod),
          orders: { create: ids.map((orderId) => ({ orderId })) },
        },
        include: {
          table: true,
          orders: { include: { order: { include: { items: { include: { product: true } }, table: true } } } },
        },
      });

      await tx.table.update({ where: { id: tableId }, data: { status: 'FREE' } });
      return createdSale;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const io = req.app.get('io');
    const saleRecord = { ...sale, source: 'CASH_SALE' as const, amount: sale.totalAmount };
    if (io) {
      for (const { order } of sale.orders) {
        io.to('role:WAITER').emit('order:status_updated', order);
        io.to('role:KITCHEN').emit('order:status_updated', order);
        io.to('role:CASHIER').emit('order:status_updated', order);
      }
      io.to('role:WAITER').emit('table:freed', { tableId, tableNumber: sale.table.number });
      io.to('role:CASHIER').emit('cashier:sale_created', saleRecord);
      io.to('role:CASHIER').emit('cashier:tables_updated', { tableId });
    }
    return res.status(201).json(saleRecord);
  } catch (error) {
    if (error instanceof NoChargeableOrdersError) return res.status(400).json({ message: error.message });
    if (error instanceof TableNotFoundError) return res.status(404).json({ message: error.message });
    if (error instanceof ConcurrentTableChargeError || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')) {
      return res.status(409).json({ message: error.message || 'La mesa cambió durante el cobro. Actualiza e inténtalo nuevamente.' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'No se encontró la mesa' });
    }
    console.error('Error al cobrar mesa:', error);
    return res.status(500).json({ message: 'Error al cobrar la mesa' });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const { start, end } = dateRange(req.query);
    const [sales, legacyPayments] = await Promise.all([
      prisma.cashSale.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { table: true, orders: { include: { order: { include: { items: { include: { product: true } } } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { createdAt: { gte: start, lte: end }, order: { cashSaleOrder: null } },
        include: { order: { include: { table: true, items: { include: { product: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const records = [
      ...sales.map((sale) => ({
        id: sale.id,
        source: 'CASH_SALE' as const,
        table: sale.table,
        amount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        referenceNum: sale.referenceNum,
        isReconciled: sale.isReconciled,
        createdAt: sale.createdAt,
        orders: sale.orders,
      })),
      ...legacyPayments.map((payment) => ({
        id: payment.id,
        source: 'PAYMENT' as const,
        table: payment.order.table,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        referenceNum: payment.referenceNum,
        isReconciled: true,
        createdAt: payment.createdAt,
        orders: [{ order: payment.order }],
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.json(records);
  } catch (error) {
    console.error('Error obteniendo historial de caja:', error);
    return res.status(500).json({ message: 'Error al obtener los cobros' });
  }
};

export const updateSalePayment = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { paymentMethod, referenceNum } = req.body as { paymentMethod?: string | null; referenceNum?: string | null };
  if (paymentMethod && !paymentMethods.includes(paymentMethod as PaymentMethod)) {
    return res.status(400).json({ message: 'Método de pago no válido' });
  }

  try {
    const sale = await prisma.cashSale.findUnique({ where: { id } });
    if (sale) {
      const updated = await prisma.cashSale.update({
        where: { id },
        data: {
          paymentMethod: paymentMethod ? paymentMethod as PaymentMethod : null,
          referenceNum: referenceNum?.trim() || null,
          isReconciled: Boolean(paymentMethod),
        },
        include: { table: true },
      });
      req.app.get('io')?.to('role:CASHIER').emit('cashier:sale_updated', updated);
      return res.json(updated);
    }

    if (!paymentMethod) return res.status(400).json({ message: 'Los pagos anteriores requieren un método de pago' });
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { paymentMethod: paymentMethod as PaymentMethod, referenceNum: referenceNum?.trim() || null },
      include: { order: { include: { table: true } } },
    });
    const paymentRecord = { id: updatedPayment.id, source: 'PAYMENT' as const, table: updatedPayment.order.table, amount: updatedPayment.amount, paymentMethod: updatedPayment.paymentMethod, referenceNum: updatedPayment.referenceNum, isReconciled: true, createdAt: updatedPayment.createdAt };
    req.app.get('io')?.to('role:CASHIER').emit('cashier:sale_updated', paymentRecord);
    return res.json(paymentRecord);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'No se encontró el cobro' });
    }
    console.error('Error actualizando método de pago:', error);
    return res.status(500).json({ message: 'Error al actualizar el método de pago' });
  }
};

const createSummary = async (start: Date, end: Date) => {
  const [sales, legacyPayments] = await Promise.all([
    prisma.cashSale.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { totalAmount: true, paymentMethod: true } }),
    prisma.payment.findMany({ where: { createdAt: { gte: start, lte: end }, order: { cashSaleOrder: null } }, select: { amount: true, paymentMethod: true } }),
  ]);
  const byMethod: Record<string, { count: number; total: number }> = {
    CASH: { count: 0, total: 0 },
    POS_DEBIT: { count: 0, total: 0 },
    POS_CREDIT: { count: 0, total: 0 },
    TRANSFER: { count: 0, total: 0 },
    MIXED: { count: 0, total: 0 },
    UNASSIGNED: { count: 0, total: 0 },
  };
  const records = [
    ...sales.map((sale) => ({ amount: sale.totalAmount, method: sale.paymentMethod || 'UNASSIGNED' })),
    ...legacyPayments.map((payment) => ({ amount: payment.amount, method: payment.paymentMethod })),
  ];
  for (const record of records) {
    const bucket = byMethod[record.method] || byMethod.UNASSIGNED;
    bucket.count += 1;
    bucket.total += record.amount;
  }
  return {
    from: start,
    to: end,
    salesCount: records.length,
    totalAmount: records.reduce((sum, sale) => sum + sale.amount, 0),
    byMethod,
  };
};

export const getCashSummary = async (req: Request, res: Response) => {
  try {
    const { start, end } = dateRange(req.query);
    return res.json(await createSummary(start, end));
  } catch (error) {
    console.error('Error generando resumen de caja:', error);
    return res.status(500).json({ message: 'Error al generar el resumen de caja' });
  }
};

export const closeCashRegister = async (req: Request, res: Response) => {
  try {
    const { start, end } = dateRange(req.body || {});
    const summary = await createSummary(start, end);
    const totals = summary.byMethod;
    const shiftClose = await prisma.shiftClose.create({
      data: {
        openedAt: start,
        closedAt: new Date(),
        totalCash: totals.CASH.total,
        totalPos: totals.POS_DEBIT.total + totals.POS_CREDIT.total,
        totalAmount: summary.totalAmount,
        totalPosDebit: totals.POS_DEBIT.total,
        totalPosCredit: totals.POS_CREDIT.total,
        totalTransfer: totals.TRANSFER.total,
        totalMixed: totals.MIXED.total,
        totalUnassigned: totals.UNASSIGNED.total,
        salesCount: summary.salesCount,
      },
    });
    return res.status(201).json({ message: 'Cierre de caja registrado', shiftClose, summary });
  } catch (error) {
    console.error('Error cerrando caja:', error);
    return res.status(500).json({ message: 'Error al registrar el cierre de caja' });
  }
};
