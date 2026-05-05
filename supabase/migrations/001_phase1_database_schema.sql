-- ============================================================
-- PHASE 1: Database Schema Enhancement
-- AlagaVet Supply - Backend Integration
-- ============================================================
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1.1: Add new columns to orders table
-- ============================================================

-- Add delivery_days column (for 3/5/7 day delivery options)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_days INTEGER CHECK (delivery_days IN (3, 5, 7));

-- Add delivery_note column (for special delivery instructions)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_note TEXT;

-- Add product_id foreign key (optional reference to products table)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add estimated_delivery_date column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- ============================================================
-- STEP 1.2: Add new columns to products table
-- ============================================================

-- Add is_featured column (for highlighting featured products)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add sku column (for product SKU codes)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(50);

-- Add weight_kg column (for shipping calculations)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8, 2);

-- ============================================================
-- STEP 1.3: Add new columns to testimonials table
-- ============================================================

-- Add is_approved column (for moderation)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

-- Add is_featured column (for featuring top testimonials)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add avatar_url column (for customer photos)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================
-- STEP 1.4: Create database indexes for performance
-- ============================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock < 20;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- ============================================================
-- STEP 1.5: Enable Row Level Security on all tables
-- ============================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 1.6: Create RLS Policies for products table
-- ============================================================

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be inserted by admins" ON products;
DROP POLICY IF EXISTS "Products can be updated by admins" ON products;
DROP POLICY IF EXISTS "Products can be deleted by admins" ON products;

-- Policy: Everyone can view products
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Policy: Only admins can insert products
CREATE POLICY "Products can be inserted by admins" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can update products
CREATE POLICY "Products can be updated by admins" 
ON products FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can delete products
CREATE POLICY "Products can be deleted by admins" 
ON products FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- STEP 1.7: Create RLS Policies for orders table
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Orders are viewable by admins" ON orders;
DROP POLICY IF EXISTS "Orders can be created by anyone" ON orders;
DROP POLICY IF EXISTS "Orders can be updated by admins" ON orders;
DROP POLICY IF EXISTS "Orders can be deleted by admins" ON orders;

-- Policy: Only admins can view all orders
CREATE POLICY "Orders are viewable by admins" 
ON orders FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Anyone (including anonymous) can create orders
CREATE POLICY "Orders can be created by anyone" 
ON orders FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Policy: Only admins can update orders
CREATE POLICY "Orders can be updated by admins" 
ON orders FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can delete orders
CREATE POLICY "Orders can be deleted by admins" 
ON orders FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- STEP 1.8: Create RLS Policies for testimonials table
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Testimonials are viewable by everyone" ON testimonials;
DROP POLICY IF EXISTS "Testimonials can be managed by admins" ON testimonials;

-- Policy: Everyone can view approved testimonials
CREATE POLICY "Testimonials are viewable by everyone" 
ON testimonials FOR SELECT 
USING (is_approved = true);

-- Policy: Only admins can manage testimonials
CREATE POLICY "Testimonials can be managed by admins" 
ON testimonials FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- STEP 1.9: Create RLS Policies for user_roles table
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "User roles can be managed by admins" ON user_roles;

-- Policy: Users can view their own role
CREATE POLICY "Users can view own role" 
ON user_roles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Policy: Only admins can manage roles
CREATE POLICY "User roles can be managed by admins" 
ON user_roles FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- STEP 1.10: Create helper functions and triggers
-- ============================================================

-- Function to auto-generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_generate_order_code ON orders;

-- Create trigger to auto-generate order code on insert
CREATE TRIGGER trg_generate_order_code
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION generate_order_code();

-- Function to calculate estimated delivery date
CREATE OR REPLACE FUNCTION calculate_delivery_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_days IS NOT NULL THEN
    NEW.estimated_delivery_date := CURRENT_DATE + NEW.delivery_days;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_calculate_delivery_date ON orders;

-- Create trigger to calculate delivery date
CREATE TRIGGER trg_calculate_delivery_date
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_delivery_date();

-- Function to get order statistics
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
  status TEXT,
  count BIGINT,
  total_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.status::TEXT,
    COUNT(*)::BIGINT,
    COALESCE(SUM(p.price * o.quantity), 0)::NUMERIC
  FROM orders o
  LEFT JOIN products p ON o.product_id = p.id
  WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY o.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 1.11: Enable Realtime for all tables
-- ============================================================

-- Remove tables from realtime if they exist (to avoid errors)
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS products;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS orders;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS testimonials;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;

-- ============================================================
-- STEP 1.12: Create storage bucket for product images
-- ============================================================

-- Note: This needs to be done in Supabase Dashboard Storage section
-- Cannot be done via SQL. Go to:
-- Supabase Dashboard → Storage → New Bucket → Name: "product-images"

-- ============================================================
-- PHASE 1 COMPLETE!
-- ============================================================
-- Summary of changes:
-- 1. Added 4 new columns to orders table
-- 2. Added 3 new columns to products table
-- 3. Added 3 new columns to testimonials table
-- 4. Created 13 database indexes for performance
-- 5. Enabled RLS on all tables
-- 6. Created 10 RLS policies
-- 7. Created 2 helper functions and triggers
-- 8. Enabled realtime for 3 tables
-- ============================================================
