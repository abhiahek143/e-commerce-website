import { ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const Navbar = () => {
  const { user, signOut } = useAuthStore()

  const { items = [] } = useCartStore()

  // Safe cart quantity calculation
  const totalItems = items.reduce(
    (sum, item) => sum + (item?.quantity || 0),
    0
  )

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
          >
            PremiumStore
          </Link>

          <div className="flex items-center space-x-4">

          <Link
            to="/products"
            className="hover:text-slate-600 transition-colors"
          >
            Products
          </Link>

            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Link to="/cart" className="relative p-2">

                    <ShoppingCart size={20} />

                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>

                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {user ? (
              <div className="flex items-center space-x-2">

                <User size={18} />

                <button
                  onClick={signOut}
                  className="text-sm hover:text-slate-600"
                >
                  Logout
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm hover:text-slate-600"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar