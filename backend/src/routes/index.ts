import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import orderRoutes from './orders';
import testimonialRoutes from './testimonials';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/testimonials', testimonialRoutes);

export default router;
