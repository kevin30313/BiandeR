import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

const createOrderWithStatus = async (req: Request, res: Response, status: 'PENDING_APPROVAL' | 'PENDING') => {
  try {
    const { tableId, items } = req.body;

    const numericTableId = Number(tableId);

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Mesa e ítems son requeridos' });
    }

    let totalAmount = 0;
    const orderItemsData: OrderItemInput[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }

      const itemPrice = product.price * item.quantity;
      totalAmount += itemPrice;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        notes: item.notes,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      // El menú público envía el número de mesa y el panel del garzón su UUID.
      const table = await tx.table.findFirst({
        where: Number.isNaN(numericTableId) ? { id: String(tableId) } : { number: numericTableId },
      });
      if (!table) throw new Error(`Mesa no encontrada: ${tableId}`);
      const updatedTable = await tx.table.update({ where: { id: table.id }, data: { status: 'BUSY' } });

      // 2. Crear la orden asociando el UUID de la mesa (updatedTable.id)
      const newOrder = await tx.order.create({
        data: {
          tableId: updatedTable.id,
          status,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          table: true,
        },
      });

      return newOrder;
    });

    const io = req.app.get('io');
    if (io) {
      if (status === 'PENDING_APPROVAL') {
        io.to('role:WAITER').emit('order:preorder_created', order);
      } else {
        io.to('role:WAITER').emit('order:status_updated', order);
        io.to('role:KITCHEN').emit('order:created', order);
        io.to('role:CASHIER').emit('order:created', order);
      }
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error detallado:', error);
    return res.status(500).json({ message: 'Error al crear la orden' });
  }
};

export const createPublicPreorder = (req: Request, res: Response) =>
  createOrderWithStatus(req, res, 'PENDING_APPROVAL');

export const createWaiterOrder = (req: Request, res: Response) =>
  createOrderWithStatus(req, res, 'PENDING');

export const approvePreorder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Orden no encontrada' });
    if (current.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ message: 'La orden ya no está pendiente de aprobación' });
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'PENDING' },
      include: { items: { include: { product: true } }, table: true },
    });
    const io = req.app.get('io');
    if (io) {
      io.to('role:WAITER').emit('order:status_updated', order);
      io.to('role:KITCHEN').emit('order:created', order);
      io.to('role:CASHIER').emit('order:created', order);
    }
    return res.json(order);
  } catch (error) {
    console.error('Error al aprobar preorden:', error);
    return res.status(500).json({ message: 'Error al aprobar la preorden' });
  }
};

export const rejectPreorder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Orden no encontrada' });
    if (current.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ message: 'La orden ya no está pendiente de aprobación' });
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: { include: { product: true } }, table: true },
    });
    const io = req.app.get('io');
    if (io) io.to('role:WAITER').emit('order:status_updated', order);
    return res.json(order);
  } catch (error) {
    console.error('Error al rechazar preorden:', error);
    return res.status(500).json({ message: 'Error al rechazar la preorden' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: ['WAITER', 'ADMIN'].includes(req.user?.role || '') ? {} : { status: { not: 'PENDING_APPROVAL' } },
      include: {
        items: {
          include: { product: true },
        },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    return res.status(500).json({ message: 'Error al obtener las órdenes' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'El estado es requerido' });
    }

    const current = await prisma.order.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Orden no encontrada' });
    if (current.status === 'PENDING_APPROVAL') {
      return res.status(400).json({ message: 'Las preórdenes deben aprobarse o rechazarse desde la bandeja del garzón' });
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['IN_PREPARATION'],
      IN_PREPARATION: ['READY'],
      READY: ['DELIVERED'],
    };
    if (!allowedTransitions[current.status]?.includes(status)) {
      return res.status(400).json({ message: `No se permite cambiar de ${current.status} a ${status}` });
    }

    if (status === 'IN_PREPARATION' && !['KITCHEN', 'ADMIN'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Solo cocina puede iniciar la preparación' });
    }
    if (status === 'READY' && !['KITCHEN', 'ADMIN'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Solo cocina puede marcar la orden como lista' });
    }
    if (status === 'DELIVERED' && !['WAITER', 'ADMIN'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Solo el garzón puede marcar la orden como entregada' });
    }

    const transition = await prisma.order.updateMany({
      where: { id, status: current.status },
      data: { status },
    });
    if (transition.count === 0) {
      return res.status(409).json({ message: 'La orden cambió de estado. Actualiza la bandeja e inténtalo otra vez.' });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        table: true,
      },
    });
    if (!updatedOrder) return res.status(404).json({ message: 'Orden no encontrada' });

    const io = req.app.get('io');
    if (io) {
      io.to('role:WAITER').emit('order:status_updated', updatedOrder);
      io.to('role:KITCHEN').emit('order:status_updated', updatedOrder);
      io.to('role:CASHIER').emit('order:status_updated', updatedOrder);
      if (updatedOrder.status === 'READY') {
        io.to('role:WAITER').emit('order:ready', {
          order: updatedOrder,
          tableNumber: updatedOrder.table.number,
          items: updatedOrder.items.map((item) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
          })),
          readyAt: updatedOrder.updatedAt,
        });
      }
    }

    return res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado de la orden' });
  }
};

export const payOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { paymentMethod, referenceNum } = req.body;

    // 1. Validar que se proporcione un método de pago válido
    const validMethods = ['CASH', 'POS_DEBIT', 'POS_CREDIT', 'TRANSFER', 'MIXED'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Método de pago inválido. Debe ser CASH, POS_DEBIT, POS_CREDIT o TRANSFER',
      });
    }

    // 2. Obtener la orden con su pago existente (si lo tiene)
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.status === 'PAID' || order.payment) {
      return res.status(400).json({ message: 'Esta orden ya ha sido pagada previamente' });
    }

    // 3. Ejecutar la transacción atómica
    const { completedOrder, payment } = await prisma.$transaction(async (tx) => {
      // Crear el registro de pago
      const newPayment = await tx.payment.create({
        data: {
          orderId: id,
          amount: order.totalAmount,
          paymentMethod,
          referenceNum: referenceNum || null,
        },
      });

      // Actualizar el estado de la orden a PAID
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'PAID' },
        include: {
          items: {
            include: { product: true },
          },
          table: true,
          payment: true,
        },
      });

      // Liberar la mesa usando su UUID
      await tx.table.update({
        where: { id: order.tableId },
        data: { status: 'FREE' },
      });

      return { completedOrder: updatedOrder, payment: newPayment };
    });

    // 4. Emitir eventos en tiempo real
    const io = req.app.get('io');
    if (io) {
      io.to('role:CASHIER').emit('order:paid', { order: completedOrder, payment });
      io.to('role:WAITER').emit('order:paid', { order: completedOrder, payment });
      io.to('role:WAITER').emit('table:freed', { tableId: order.tableId });
    }

    return res.json({
      message: 'Orden pagada y mesa liberada con éxito',
      order: completedOrder,
      payment,
    });
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return res.status(500).json({ message: 'Error al procesar el pago de la orden' });
  }
};
