# AlagaVet Deployment Guide

## Architecture
- **Frontend**: Vercel (React + TypeScript + TanStack Router)
- **Backend**: Render (Express + TypeScript)
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary

---

## Phase 1: MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or login
3. Create a new project called "AlagaVet"

### 2. Create Cluster
1. Click "Build a Database"
2. Choose "M0 Free" tier
3. Select region closest to your users (e.g., Singapore for Philippines)
4. Name cluster: "alagavet-cluster"
5. Click "Create Cluster"

### 3. Setup Database Access
1. Click "Database Access" in sidebar
2. Click "Add New Database User"
3. Username: `alagavet_admin`
4. Password: Generate strong password (SAVE THIS!)
5. Privileges: "Read and write to any database"
6. Click "Add User"

### 4. Setup Network Access
1. Click "Network Access" in sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Render deployment)
4. Click "Confirm"

### 5. Get Connection String
1. Click "Database" → "Connect"
2. Click "Drivers"
3. Select "Node.js"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Save this for later use

---

## Phase 2: Cloudinary Setup

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for free
3. Verify email

### 2. Get Credentials
1. Go to Dashboard
2. Find:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Save these for later use

---

## Phase 3: Backend Deployment (Render)

### 1. Prepare Backend for Deployment

In `backend/` folder, create `.env` file:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://alagavet_admin:YOUR_PASSWORD@cluster.mongodb.net/alagavet?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-here-min-32-characters
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository

### 3. Create Web Service
1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `alagavet-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add Environment Variables:
   - Add all variables from `.env` above
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Copy the deployed URL (e.g., `https://alagavet-api.onrender.com`)

---

## Phase 4: Frontend Deployment (Vercel)

### 1. Prepare Frontend

Update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### 2. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository

### 3. Deploy
1. Click "New Project"
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or `frontend/` if separated)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api`
5. Click "Deploy"
6. Wait for deployment
7. Copy the deployed URL

### 4. Update Backend CORS
Go back to Render dashboard:
1. Update `FRONTEND_URL` environment variable with your Vercel URL
2. Redeploy backend

---

## Phase 5: Create First Admin

### Option 1: Using API (Recommended)

Use Postman or curl:
```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alagavet.ph",
    "password": "securePassword123",
    "role": "admin"
  }'
```

### Option 2: Using MongoDB Compass

1. Download MongoDB Compass
2. Connect using your MongoDB URI
3. Go to `alagavet` database → `users` collection
4. Insert document:
```json
{
  "email": "admin@alagavet.ph",
  "password": "$2a$12$...", // bcrypt hashed password
  "role": "admin",
  "createdAt": { "$date": "2024-01-01T00:00:00Z" }
}
```

---

## Phase 6: Test Everything

### 1. Test Backend API

Health check:
```bash
curl https://your-backend-url.onrender.com/api/health
```

### 2. Test Admin Login

```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alagavet.ph",
    "password": "your-password"
  }'
```

### 3. Test Frontend

1. Go to your Vercel URL
2. Navigate to `/admin-login`
3. Login with admin credentials
4. Test adding a product
5. Test placing an order from landing page

---

## Project Structure Summary

```
Gamot website/
├── backend/                 # Express Backend (Render)
│   ├── src/
│   │   ├── config/         # DB & Cloudinary config
│   │   ├── middleware/      # Auth, error handling, upload
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Environment variables
│
├── src/                     # React Frontend (Vercel)
│   ├── routes/              # Page components
│   ├── components/          # UI components
│   ├── integrations/        # API integration
│   └── ...
├── package.json
└── DEPLOYMENT_GUIDE.md      # This file
```

---

## API Endpoints Summary

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset

### Products (Public)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product

### Products (Admin)
- `POST /api/products` - Create product (with image upload)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders (Admin)
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Orders (Public)
- `POST /api/orders` - Place order (no auth required)

### Testimonials (Public)
- `GET /api/testimonials` - List approved testimonials

### Testimonials (Admin)
- `GET /api/testimonials/admin` - List all testimonials
- `POST /api/testimonials` - Create testimonial
- `PUT /api/testimonials/:id` - Update testimonial
- `PUT /api/testimonials/:id/approve` - Approve testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `PORT` - Usually 5000 or 10000 (Render)
- [ ] `NODE_ENV` - production
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random string (min 32 chars)
- [ ] `JWT_EXPIRES_IN` - 7d
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `FRONTEND_URL` - Your Vercel URL

### Frontend (.env.production)
- [ ] `VITE_API_URL` - Your Render URL + /api

---

## Troubleshooting

### 1. CORS Errors
- Check `FRONTEND_URL` in backend matches actual Vercel URL
- Include `https://` in URL

### 2. MongoDB Connection Fails
- Check IP whitelist in MongoDB Atlas (0.0.0.0/0 for all)
- Verify password in connection string
- Check database user has correct permissions

### 3. Image Upload Fails
- Verify Cloudinary credentials
- Check Cloudinary dashboard for usage limits
- Ensure multer is configured correctly

### 4. JWT Errors
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration settings

---

## Next Steps After Deployment

1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL (automatic on Vercel/Render)
3. ✅ Set up monitoring (Render has built-in logs)
4. ✅ Configure backup strategy for MongoDB
5. ✅ Set up email notifications (optional)
6. ✅ Configure CDN for images (Cloudinary handles this)

---

## Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Test API endpoints using Postman
4. Verify all environment variables are set

---

## 🎉 You're Done!

Your AlagaVet website is now live with:
- ✅ React frontend on Vercel
- ✅ Express backend on Render  
- ✅ MongoDB Atlas database
- ✅ Cloudinary image storage
- ✅ JWT authentication
- ✅ Full CRUD operations
