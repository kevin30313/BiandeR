import { Request, Response } from 'express';
import prisma from '../prisma';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, items } = req.body;

    const numericTableId = Number(tableId);

    if (!tableId || isNaN(numericTableId) || !items || !Array.isArray(items) || items.length === 0) {
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
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado de la mesa usando su número (Int)
      const updatedTable = await tx.table.update({
        where: { number: numericTableId },
        data: { status: 'BUSY' },
      });

      // 2. Crear la orden asociando el UUID de la mesa (updatedTable.id)
      const newOrder = await tx.order.create({
        data: {
          tableId: updatedTable.id,
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
      io.emit('order:created', order);
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error detallado:', error);
    return res.status(500).json({ message: 'Error al crear la orden' });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
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

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'El estado es requerido' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
        table: true,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('order:status_updated', updatedOrder);
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
    const validMethods = ['CASH', 'POS_DEBIT', 'POS_CREDIT', 'TRANSFER'];
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
      io.emit('order:paid', { order: completedOrder, payment });
      io.emit('table:freed', { tableId: order.tableId });
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