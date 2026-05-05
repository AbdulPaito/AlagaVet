# AlagaVet Backend Integration Plan - 10 Phases

## 📋 Current State Analysis

### Landing Page Features (Completed UI):
- ✅ Hero section with CTA
- ✅ Product catalog with categories
- ✅ Product detail modal
- ✅ Order modal (frontend only)
- ✅ Testimonials display
- ✅ Contact floating button
- ✅ Fully responsive design

### Admin Pages (Completed UI):
- ✅ Dashboard with stats, recent orders, quick actions
- ✅ Orders page with search, filters, status management
- ✅ Products page with category filters, CRUD
- ✅ Testimonials page with rating stats, CRUD
- ✅ Responsive sidebar with mobile menu

### Database Schema (Supabase):
- ✅ `products` - id, name, description, price, category, image, stock, labels[], timestamps
- ✅ `orders` - id, code, customer_name, phone, address, product_name, quantity, message, status, timestamps
- ✅ `testimonials` - id, name, location, rating, message, created_at
- ✅ `user_roles` - id, user_id, role (admin/user)
- ✅ Enums: order_status (Pending/Confirmed/Delivered/Cancelled), app_role (admin/user)

---

## 🚀 Phase 1: Database Schema Enhancement & Real-time Setup
**Goal:** Complete the database schema and enable real-time subscriptions

### Tasks:
1. Add `delivery_days` column to `orders` table (3/5/7 days delivery option)
2. Add `is_featured` column to `products` table for featured products
3. Add `product_id` foreign key to `orders` table (optional product reference)
4. Enable real-time for all tables in Supabase Dashboard
5. Set up Row Level Security (RLS) policies for all tables
6. Create database indexes for performance:
   - `products(category)`
   - `orders(status, created_at)`
   - `orders(customer_name)`

### Deliverables:
- [ ] SQL migration file
- [ ] Updated types.ts with new columns
- [ ] RLS policies configured

---

## 🚀 Phase 2: Authentication & Authorization System
**Goal:** Implement complete auth flow for admin access

### Tasks:
1. **AdminAuthProvider** - Uncomment and fix auth checks in `AdminShell.tsx`
2. **Admin Login** (`admin-login.tsx`):
   - Connect Supabase auth.signInWithPassword()
   - Add "Remember me" functionality
   - Add password reset flow
   - Show loading states
3. **Admin Signup** (`admin-signup.tsx`):
   - Connect auth.signUp()
   - Auto-assign admin role to first user
   - Email verification handling
4. **Protected Routes**:
   - Enable auth guards in AdminShell
   - Redirect to /admin-login if not authenticated
   - Check user_roles for "admin" role
5. **Logout**:
   - Implement real signOut()
   - Clear all state
   - Redirect to login

### Deliverables:
- [ ] Working login/logout
- [ ] Role-based access control
- [ ] Session persistence

---

## 🚀 Phase 3: Product Management Backend
**Goal:** Full CRUD operations for products with image uploads

### Tasks:
1. **Image Upload System**:
   - Set up Supabase Storage bucket "product-images"
   - Implement image upload in ProductFormDialog
   - Add image resize/compression before upload
   - Generate unique filenames (UUID)
2. **Product CRUD**:
   - Create product with image
   - Update product (including image replacement)
   - Delete product (remove image from storage)
3. **Product Search/Filter Backend**:
   - Full-text search on name/description
   - Category filtering
   - Stock alerts (low stock notification)
4. **Landing Page Integration**:
   - Products fetch from Supabase
   - Categories from distinct product categories
   - Featured products flag

### Deliverables:
- [ ] Image upload working
- [ ] Product CRUD complete
- [ ] Real-time product updates

---

## 🚀 Phase 4: Order Management System
**Goal:** Complete order lifecycle from placement to delivery

### Tasks:
1. **Order Placement** (Landing Page):
   - Submit order to Supabase
   - Auto-generate order code (e.g., ORD-20250104-XXXX)
   - SMS/Email notification (optional via webhooks)
   - Stock deduction on order
2. **Order Status Workflow**:
   - Pending → Confirmed (admin action)
   - Confirmed → Delivered (admin action)
   - Any status → Cancelled (with stock restore)
3. **Order Details Enhancement**:
   - Add delivery_days to order form
   - Show order timeline/history
   - Customer order lookup by phone
4. **Admin Order Management**:
   - Bulk status updates
   - Export orders to CSV
   - Order analytics (daily/weekly/monthly)

### Deliverables:
- [ ] Orders saving to database
- [ ] Status workflow implemented
- [ ] Stock management linked to orders

---

## 🚀 Phase 5: Testimonials System
**Goal:** Complete testimonials management with moderation

### Tasks:
1. **Landing Page Integration**:
   - Fetch approved testimonials only
   - Randomize or sort by newest
   - Show average rating
2. **Admin Management**:
   - CRUD operations (already have UI)
   - Add "is_approved" flag for moderation
   - Bulk actions (approve/reject/delete)
3. **Customer Submission** (optional):
   - Add testimonial submit form on landing page
   - Submit goes to pending approval
   - Admin notification on new submission

### Deliverables:
- [ ] Testimonials display working
- [ ] Moderation system
- [ ] Customer submission (optional)

---

## 🚀 Phase 6: Dashboard Analytics & Reporting
**Goal:** Real-time dashboard with meaningful metrics

### Tasks:
1. **Dashboard Stats**:
   - Revenue calculation (delivered orders × price)
   - Sales chart (7-day, 30-day, yearly)
   - Top selling products
   - Low stock alerts
2. **Real-time Updates**:
   - Live order count updates
   - New order notifications
   - Toast notifications for status changes
3. **Reports**:
   - Daily sales report
   - Product performance report
   - Customer order history

### Deliverables:
- [ ] Charts and graphs
- [ ] Real-time updates
- [ ] Exportable reports

---

## 🚀 Phase 7: Notifications & Communication
**Goal:** Keep customers and admin informed

### Tasks:
1. **Admin Notifications**:
   - New order push notification
   - Low stock alerts
   - Browser notification permission
2. **Customer Notifications** (optional):
   - Order confirmation SMS/Email
   - Status update notifications
   - Delivery reminders
3. **Webhooks** (optional):
   - Connect to SMS API (Twilio/Philsys)
   - Email service (Resend/SendGrid)

### Deliverables:
- [ ] In-app notifications
- [ ] Browser push notifications
- [ ] SMS/Email integration (optional)

---

## 🚀 Phase 8: Settings & Configuration
**Goal:** Admin-configurable settings

### Tasks:
1. **Site Settings Table**:
   - Store name, contact info, social links
   - Delivery fees, free shipping threshold
   - Maintenance mode toggle
2. **Admin Profile**:
   - Change password
   - Update admin info
3. **Backup & Export**:
   - Export all data
   - Database backup trigger

### Deliverables:
- [ ] Settings page
- [ ] Configurable site info
- [ ] Data export

---

## 🚀 Phase 9: Security & Performance
**Goal:** Production-ready security and optimization

### Tasks:
1. **Security**:
   - Complete RLS policies
   - Rate limiting on API calls
   - Input validation/sanitization
   - XSS protection
2. **Performance**:
   - Image optimization (WebP conversion)
   - Lazy loading for product images
   - Pagination for large lists
   - Query optimization
3. **Error Handling**:
   - Global error boundary
   - Retry logic for failed requests
   - Offline detection

### Deliverables:
- [ ] Security audit passed
- [ ] Performance optimized
- [ ] Error handling robust

---

## 🚀 Phase 10: Testing & Deployment
**Goal:** Ready for production

### Tasks:
1. **Testing**:
   - Unit tests for utilities
   - Integration tests for CRUD
   - E2E tests for order flow
   - Mobile responsiveness check
2. **Documentation**:
   - API documentation
   - Admin user guide
   - Deployment guide
3. **Deployment**:
   - Environment variables setup
   - Production build
   - Domain configuration
   - SSL/HTTPS

### Deliverables:
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Production deployed

---

## 📊 Implementation Priority Matrix

| Phase | Priority | Complexity | Est. Time |
|-------|----------|------------|-----------|
| 1. Database | 🔴 High | Medium | 2-3 days |
| 2. Auth | 🔴 High | Medium | 2-3 days |
| 3. Products | 🔴 High | High | 3-4 days |
| 4. Orders | 🔴 High | High | 3-4 days |
| 5. Testimonials | 🟡 Medium | Low | 1-2 days |
| 6. Dashboard | 🟡 Medium | Medium | 2-3 days |
| 7. Notifications | 🟡 Medium | Medium | 2-3 days |
| 8. Settings | 🟢 Low | Low | 1-2 days |
| 9. Security | 🔴 High | Medium | 2-3 days |
| 10. Deployment | 🔴 High | Low | 1-2 days |

**Total Estimated Time: 19-29 days**

---

## 🛠️ Tech Stack Used

- **Frontend:** React + TypeScript + TanStack Router + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management:** React hooks + Supabase subscriptions
- **Icons:** Lucide React
- **UI Components:** shadcn/ui

---

## 📝 Notes

1. **Auth is currently bypassed** - Uncomment auth checks in `AdminShell.tsx` after Phase 2
2. **Mock data in use** - Replace with real Supabase calls after each phase
3. **Image uploads pending** - Need Supabase Storage setup
4. **Real-time subscriptions** - Already partially implemented, needs testing

---

## ✅ Success Criteria

- [ ] Customer can place order from landing page
- [ ] Admin can login securely
- [ ] Admin can manage products with images
- [ ] Admin can process orders end-to-end
- [ ] Dashboard shows real-time stats
- [ ] All data persists in Supabase
- [ ] Mobile experience is smooth
- [ ] Site is production-ready
