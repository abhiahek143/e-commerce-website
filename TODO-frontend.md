# Task: Fix frontend Vite API calls to run frontend properly

## Steps:
1. ✅ [Complete] Analyzed API calls - identified direct localhost fetches in cartStore.js and Checkout.jsx
2. ✅ [Complete] Edited frontend/src/store/cartStore.js: Changed to proxied '/api/coupons/validate'
3. ✅ [Complete] Edited frontend/src/pages/Checkout.jsx: Changed to proxied '/api/orders'
4. ✅ [Complete] Verified no other direct API calls remain (search found 0 results)
5. [Pending] Test: `cd frontend && npm run dev` (proxy now works for all APIs, requires backend at localhost:5001)
6. ✅ [Complete] Frontend API fixes complete
