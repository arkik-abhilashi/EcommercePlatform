![App Showcase](./screenshots/homepage-screenshot.png)

# Shopzy E-Commerce Store 🛒✨

An elegant, full-featured MERN (MongoDB, Express, React, Node.js) e-commerce application styled with a premium dark blue glow theme. The platform handles user authentication, product management, dynamic cart updates, discount coupons, secure payments with Stripe, and displays key metrics through a live admin analytics dashboard.

---

## 🚀 Key Features

- **Premium Blue Theme UI**: Implemented with Tailwind CSS v4, Framer Motion transitions, custom responsive scroll containers, and dark-mode glassmorphism.
- **Secure Authentication**: Custom JWT flow using access/refresh tokens stored securely in HTTP-only cookies.
- **Product Exploration**: Browse items categorized cleanly (Jeans, T-shirts, Shoes, Glasses, Jackets, Suits, Bags) with lazy-loaded image grids.
- **Dynamic Cart System**: Local Zustand state synchronized with the MongoDB database to save client cart items persistently. Includes dynamic quantity counters and a matching product recommendations panel ("People also bought").
- **Coupon Discount System**: Dynamic coupon validation. Reward coupons generated for users can be applied during checkout to get percentage-based discounts.
- **Stripe Integration**: Redirects users to Stripe's secure checkout page, processing orders and updating cart states on success.
- **Admin Dashboard**:
  - **Create Products**: Admin interface supporting Cloudinary image uploads, category selection, and descriptions.
  - **Manage Products**: List of all inventory items, option to toggle products as "featured", and full delete actions.
  - **Live Analytics**: Cards showing totals for Users, Products, Sales, and Revenue, alongside a dynamic line graph showcasing daily Sales/Revenue trends using Recharts.

---

## 🛠️ Technology Stack

### Backend

- **Core**: Node.js & Express
- **Database**: MongoDB (via Mongoose ODM)
- **Caching/Session store**: Redis (via Upstash Redis REST API & IORedis)
- **Storage**: Cloudinary API (for product image hosting)
- **Payments**: Stripe SDK
- **Security**: JSON Web Tokens (JWT) & BcryptJS

### Frontend

- **Core**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 & Framer Motion (micro-animations)
- **State Management**: Zustand
- **Charts**: Recharts
- **Utilities**: Axios, Lucide Icons, React Confetti, React Hot Toast

---

## 📦 Project Structure

```
├── backend/                  # Express Server logic
│   ├── controllers/          # Business logic handlers
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API endpoint routing
│   ├── lib/                  # Database connections & Stripe setup
│   └── server.js             # Express Entry Point
├── frontend/                 # Vite + React Client application
│   ├── src/
│   │   ├── components/       # Reusable layout and tab blocks
│   │   ├── pages/            # Core views (Cart, Admin, Login, HomePage)
│   │   ├── stores/           # Zustand global state modules
│   │   ├── lib/              # Client Axios configure
│   │   └── App.jsx           # Client Route Switch & Main background
│   └── package.json
└── package.json              # Backend entry and nodemon scripts
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the **root** of the project and populate it with the following keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_test_secret_key
CLIENT_URL=http://localhost:5173
```

---

## 🏁 Quick Start

Follow these steps to run the project locally.

### 1. Install Dependencies

**Root & Backend:**

```bash
npm install
```

**Frontend Client:**

```bash
cd frontend
npm install
cd ..
```

### 2. Run the Servers

To run the application, you need to run **both** the backend server and Vite's frontend dev server concurrently:

**Terminal 1 (Start Backend on Port 5000):**

```bash
npm run dev
```

**Terminal 2 (Start Frontend Client on Port 5173):**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser. The Vite server will automatically proxy all API requests to `http://localhost:5000/api`.
"# ECommercePlatform" 
