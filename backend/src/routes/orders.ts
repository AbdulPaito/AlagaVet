import express from 'express';
import { body, validationResult } from 'express-validator';
import { Order, Product } from '../models';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('productId', 'name price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Order.countDocuments(query);

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform orders to snake_case for frontend compatibility
    const transformedOrders = orders.map(order => ({
      id: order._id.toString(),
      code: order.code,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      product_name: order.productName,
      quantity: order.quantity,
      delivery_days: order.deliveryDays,
      message: order.message || order.deliveryNote || '',
      status: order.status,
      created_at: order.createdAt.toISOString(),
      estimated_delivery_date: order.estimatedDeliveryDate ? order.estimatedDeliveryDate.toISOString() : null,
    }));

    res.json({
      success: true,
      orders: transformedOrders,
      stats,
      pagination: {
        page: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string)),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private/Admin
router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'productId',
      'name price image'
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders
// @desc    Create order (Public)
// @access  Public
router.post(
  '/',
  [
    body('customerName').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const orderData = {
        ...req.body,
        quantity: parseInt(req.body.quantity),
        deliveryDays: parseInt(req.body.deliveryDays) || 5,
        productId: req.body.productId || null,
      };

      const order = await Order.create(orderData);

      // Reduce stock if productId is provided
      if (order.productId) {
        await Product.findByIdAndUpdate(order.productId, {
          $inc: { stock: -order.quantity },
        });
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put(
  '/:id/status',
  protect,
  adminOnly,
  [body('status').isIn(['Pending', 'Confirmed', 'Delivered', 'Cancelled'])],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { status, estimatedDeliveryDate } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      // Restore stock if cancelled
      if (status === 'Cancelled' && order.status !== 'Cancelled' && order.productId) {
        await Product.findByIdAndUpdate(order.productId, {
          $inc: { stock: order.quantity },
        });
      }

      order.status = status;
      if (estimatedDeliveryDate) {
        order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
      }
      await order.save();

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Restore stock if order is deleted and not cancelled
    if (order.status !== 'Cancelled' && order.productId) {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { stock: order.quantity },
      });
    }

    await Order.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
