# Premium E-Commerce Website 🚀

## Features
- Modern React/Vite frontend with TailwindCSS, Framer Motion
- Node.js/Express backend proxying Supabase
- Product catalog, cart, checkout, orders
- Responsive design, smooth animations
- LocalStorage + Supabase sync for cart/orders
- Vite proxy (no CORS issues)

## Tech Stack
```
Frontend: React 18, Vite, TailwindCSS, Zustand, Framer Motion, shadcn/ui
Backend: Node.js, Express, Supabase (PostgreSQL + Auth)
Database: Supabase (products, carts, orders, coupons)
Deployment: Vercel/Netlify (frontend), Render/Railway (backend)
```

## Quick Start 🏃‍♂️

### 1. Supabase Setup (Required)
1. Create free Supabase project: [supabase.com](https://supabase.com)
2. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (Settings > API)
3. Run SQL: Copy [SUPABASE_SETUP.sql](./SUPABASE_SETUP.sql) to Dashboard > SQL Editor > Run
4. (Optional) Add sample coupons/products via SQL

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase creds
npm install
npm run dev  # http://localhost:5001
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env  # Optional, no required vars
npm install
npm run dev  # http://localhost:5173
```

### 4. Test
- Visit [localhost:5173](http://localhost:5173)
- Products load via `/api/products` -> backend -> Supabase
- Add to cart, checkout (login required for persistence)

## Scripts
```bash
# Backend
npm run dev    # nodemon server.js
npm start      # production

# Frontend
npm run dev    # vite dev server
npm run build  # vite build
npm run preview # vite preview build
```

## Environment Files
- `backend/.env.example` → Template for Supabase service key
- `frontend/.env.example` → No required vars (Vite proxy handles APIs)

## Production Deployment
1. **Frontend**: Vercel/Netlify (set root=frontend)
2. **Backend**: Render/Vercel Functions (set env vars)
3. **Supabase**: Production project (same DB)

## Troubleshooting
- **Port 5001 in use**: `lsof -ti:5001 | xargs kill -9`
- **No products**: Check Supabase 'products' table populated
- **CORS errors**: Ensure Vite proxy (vite.config.js) points to backend URL
- **Cart not syncing**: User auth required (Supabase Auth)

## File Structure
```
├── backend/          # Express API proxy
│   ├── server.js
│   └── .env.example
├── frontend/         # React/Vite app
│   ├── src/
│   └── vite.config.js (proxy)
├── SUPABASE_SETUP.sql
├── README.md
└── TODO*.md         # Task progress
```

Built with ❤️ using modern best practices.
