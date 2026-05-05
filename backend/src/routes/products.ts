import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Product } from '../models';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, featured, page = 1, limit = 50 } = req.query;

    // Build query
    const query: any = {};

    if (category) {
      query.category = (category as string).toLowerCase();
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
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

// @route   POST /api/products/upload
// @desc    Upload product image to Cloudinary
// @access  Private/Admin
router.post(
  '/upload',
  protect,
  adminOnly,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }
      
      res.json({
        success: true,
        imageUrl: req.file.path,
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Handle labels - can be array or string
      let labels: string[] = [];
      if (req.body.labels) {
        if (Array.isArray(req.body.labels)) {
          labels = req.body.labels.filter(Boolean); // Remove empty strings
        } else if (typeof req.body.labels === 'string' && req.body.labels.trim()) {
          try {
            labels = JSON.parse(req.body.labels);
          } catch {
            labels = req.body.labels.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }
      
      const productData = {
        ...req.body,
        image: req.body.image || '',
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock) || 0,
        labels,
        isFeatured: req.body.isFeatured === 'true',
      };

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const updateData: any = { ...req.body };

      // Parse numeric fields
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.stock) updateData.stock = parseInt(req.body.stock);
      if (req.body.labels) {
        // Handle both array and string inputs
        if (Array.isArray(req.body.labels)) {
          updateData.labels = req.body.labels.filter(Boolean); // Remove empty strings
        } else if (typeof req.body.labels === 'string' && req.body.labels.trim()) {
          try {
            updateData.labels = JSON.parse(req.body.labels);
          } catch {
            updateData.labels = req.body.labels.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }
      if (req.body.isFeatured) updateData.isFeatured = req.body.isFeatured === 'true';

      // Use image from request body (uploaded via /upload endpoint)
      if (req.body.image !== undefined) {
        updateData.image = req.body.image;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
