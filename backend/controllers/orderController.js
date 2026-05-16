const { prisma } = require('../config/prisma');
const sendEmail = require('../utils/sendEmail');

const addOrderItems = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!address || !address.fullName || !address.street || !address.city || !address.postalCode || !address.country) {
      return res.status(400).json({ message: 'Complete address is required' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId || item._id || item.id,
      qty: parseInt(item.qty),
      price: parseFloat(item.price),
    }));

    const invalidItem = normalizedItems.find(
      (item) => !item.productId || !item.qty || isNaN(item.price)
    );
    if (invalidItem) {
      return res.status(400).json({ message: 'Invalid order item data' });
    }

    // Use transaction for data consistency
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await prisma.$transaction(async (tx) => {
      // Create address
      const createdAddress = await tx.address.create({
        data: {
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
          userId: req.user.id,
        },
      });

      // Create order
      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          addressId: createdAddress.id,
          totalAmount: parseFloat(totalAmount),
          status: 'PENDING',
          paymentId: paymentId || null,
        },
      });

      // Create order items and update product stock
      for (const item of normalizedItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            qty: item.qty,
            price: item.price,
          },
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: Math.max(0, product.stock - item.qty),
          },
        });
      }

      return createdOrder;
    });

    // Send Order Confirmation Email
    const message = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Hello ${user.name},</p>
          <p>Your order has been successfully placed!</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          <p><strong>Status:</strong> Pending</p>
          <p><strong>Shipping Address:</strong><br/>${address.street}<br/>${address.city}, ${address.postalCode}<br/>${address.country}</p>
          <p>Thank you for shopping with Saha Traditions!</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Saha Traditions - Order Confirmation',
      message,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: true,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrderItems, getMyOrders, getOrders, updateOrderStatus };
