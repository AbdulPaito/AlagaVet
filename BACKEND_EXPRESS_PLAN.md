# AlagaVet Backend Plan - Express + MongoDB Atlas

## Architecture
- **Frontend**: React + Vercel
- **Backend**: Express.js + Render
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary (or AWS S3)
- **Auth**: JWT (JSON Web Tokens)

## Project Structure
```
Gamot website/
├── frontend/          # React app (Vercel)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express app (Render)
│   ├── src/
│   │   ├── models/    # MongoDB schemas
│   │   ├── routes/    # API endpoints
│   │   ├── middleware/ # Auth, validation
│   │   ├── controllers/ # Business logic
│   │   └── server.ts
│   ├── package.json
│   └── .env
└── package.json (root)
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register admin
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- POST `/api/auth/forgot-password` - Send reset link
- POST `/api/auth/reset-password` - Reset password

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)
- POST `/api/products/:id/image` - Upload image (Admin)

### Orders
- GET `/api/orders` - Get all orders (Admin)
- GET `/api/orders/:id` - Get single order (Admin)
- POST `/api/orders` - Create order (Public)
- PUT `/api/orders/:id/status` - Update status (Admin)
- DELETE `/api/orders/:id` - Delete order (Admin)

### Testimonials
- GET `/api/testimonials` - Get all testimonials
- POST `/api/testimonials` - Create testimonial (Admin)
- PUT `/api/testimonials/:id` - Update testimonial (Admin)
- DELETE `/api/testimonials/:id` - Delete testimonial (Admin)

## MongoDB Schemas

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String, // Cloudinary URL
  stock: Number,
  labels: [String],
  isFeatured: Boolean,
  sku: String,
  weightKg: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  code: String, // ORD-YYYYMMDD-XXXX
  customerName: String,
  phone: String,
  address: String,
  productId: ObjectId,
  productName: String,
  quantity: Number,
  deliveryDays: Number,
  deliveryNote: String,
  status: String, // Pending, Confirmed, Delivered, Cancelled
  message: String,
  estimatedDeliveryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Testimonial
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  rating: Number,
  message: String,
  avatarUrl: String,
  isApproved: Boolean,
  isFeatured: Boolean,
  createdAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // Hashed
  role: String, // admin, user
  createdAt: Date
}
```

## Environment Variables (.env)
```
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alagavet

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (CORS)
FRONTEND_URL=https://your-frontend.vercel.app

# Server
PORT=5000
NODE_ENV=production
```
