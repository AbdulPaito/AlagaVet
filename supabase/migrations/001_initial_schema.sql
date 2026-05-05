-- Phase 1: Database Schema Enhancement
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. Add new columns to existing tables
-- ============================================================

-- Add delivery_days to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_days INTEGER CHECK (delivery_days IN (3, 5, 7));

-- Add is_featured to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add product_id foreign key to orders (optional reference)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add delivery_note to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_note TEXT;

-- ============================================================
-- 2. Create indexes for performance
-- ============================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);

-- ============================================================
-- 3. Enable Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Create RLS Policies
-- ============================================================

-- Products policies
-- Everyone can view products (for landing page)
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Only admins can insert/update/delete products
CREATE POLICY "Products can be inserted by admins" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Products can be updated by admins" 
ON products FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Products can be deleted by admins" 
ON products FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Orders policies
-- Admins can view all orders
CREATE POLICY "Orders are viewable by admins" 
ON orders FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow anonymous users to create orders (for landing page orders)
CREATE POLICY "Orders can be created by anyone" 
ON orders FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Only admins can update/delete orders
CREATE POLICY "Orders can be updated by admins" 
ON orders FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Testimonials policies
-- Everyone can view testimonials (for landing page)
CREATE POLICY "Testimonials are viewable by everyone" 
ON testimonials FOR SELECT 
USING (true);

-- Only admins can manage testimonials
CREATE POLICY "Testimonials can be managed by admins" 
ON testimonials FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- User roles policies
-- Users can view their own role
CREATE POLICY "Users can view own role" 
ON user_roles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Only admins can manage roles
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
-- 5. Create helper functions
-- ============================================================

-- Function to auto-generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order code on insert
DROP TRIGGER IF EXISTS trg_generate_order_code ON orders;
CREATE TRIGGER trg_generate_order_code
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_code();

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
-- 6. Enable Realtime for all tables
-- ============================================================

-- Add tables to realtime publication
BEGIN;
  -- Remove tables if they exist to avoid errors
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS products;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS orders;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS testimonials;
  
  -- Add tables to realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
COMMIT;

-- ============================================================
-- 7. Seed data (optional - for testing)
-- ============================================================

-- Note: Only run this if you want test data
-- Uncomment below to add sample featured product

-- INSERT INTO products (name, description, price, category, stock, labels, is_featured)
-- VALUES (
--   'Featured Test Product',
--   'This is a test featured product',
--   999.00,
--   'chicken',
--   100,
--   ARRAY['Best Seller', 'New'],
--   TRUE
-- ) ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE! Run this entire script in Supabase SQL Editor
-- ============================================================
