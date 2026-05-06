import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { Testimonial } from '../models';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/testimonials
// @desc    Get all approved testimonials
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { featured, limit = 10 } = req.query;

    const query: any = { isApproved: true };

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    // Get rating stats
    const stats = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Testimonial.countDocuments(query);
    const avgRating = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    res.json({
      success: true,
      testimonials,
      stats: {
        total,
        average: avgRating[0]?.avg || 0,
        distribution: stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/testimonials/admin
// @desc    Get all testimonials (Admin only)
// @access  Private/Admin
router.get('/admin', protect, adminOnly, async (req, res, next) => {
  try {
    const { isApproved, page = 1, limit = 50 } = req.query;

    const query: any = {};

    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      testimonials,
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

// @route   POST /api/testimonials
// @desc    Create testimonial
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const testimonial = await Testimonial.create({
        ...req.body,
        isApproved: req.body.isApproved !== undefined ? req.body.isApproved : true,
        isFeatured: req.body.isFeatured === true,
      });

      res.status(201).json({
        success: true,
        message: 'Testimonial created successfully',
        testimonial,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/testimonials/:id
// @desc    Update testimonial
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    const updateData: any = { ...req.body };

    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial: updated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/testimonials/:id/approve
// @desc    Approve testimonial
// @access  Private/Admin
router.put('/:id/approve', protect, adminOnly, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Testimonial approved',
      testimonial,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    // Handle non-ObjectId IDs gracefully
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    await Testimonial.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
