import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import ProductsPage from '@/pages/Products.jsx'
import ProductDetail from '@/pages/ProductDetail.jsx'
import Cart from '@/pages/Cart.jsx'
import Checkout from '@/pages/Checkout.jsx'
import Login from '@/pages/Login.jsx'
import Signup from '@/pages/Signup.jsx'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'


function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* TODO: Cart, Checkout, Auth pages */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const initializeSession = useAuthStore((state) => state.initializeSession)

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
