# Railway Deployment Fix - TODO

## ✅ 1. Create configuration files
- ✅ railway.toml (multi-service: backend + frontend)
- ✅ backend/.env.example (SUPABASE_URL, SUPABASE_SERVICE_KEY)
- ✅ frontend/.env.example (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## ✅ 2. Local verification
- ✅ cd backend && npm install && npm start (✅ http://localhost:5001/health works)
- ✅ cd frontend && npm install && npm run build (✅ dist/ generated)
- ✅ cd frontend && npm run dev (test app + API calls)

## [ ] 3. Git commit & Railway deploy
- [ ] Fill .env.example with YOUR Supabase values (get from dashboard)
- [ ] git add . && git commit -m \"Fix: Add Railway multi-service deployment\" && git push
- [ ] railway login (if not) && railway link (select project)
- [ ] Railway dashboard: 
  | Backend service | SUPABASE_URL, SUPABASE_SERVICE_KEY |
  | Frontend | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY |
- [ ] Deploy triggered automatically on push

## [ ] 4. Post-deploy verification
- [ ] Backend: {BACKEND_URL}/health → {productsCount}
- [ ] Frontend: {FRONTEND_URL} → app loads, products from API
- [ ] Test cart/add to cart → hits backend DB

**Ready to deploy! 🚀 Stop running terminals (Ctrl+C), fill Supabase vars, git push.**

Run Supabase setup if not done: psql with SUPABASE_SETUP.sql

