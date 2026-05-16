const { prisma } = require('../config/prisma');

const getAdminStats = async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    const orders = await prisma.order.findMany({
      select: { totalAmount: true },
    });

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats };
