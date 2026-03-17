import { ShoppingCart, User, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { getSupabase } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { useEffect as useCartEffect } from 'react'

const Navbar = () => {
  const { user, session } = useAuthStore()
  const [profileName, setProfileName] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [pulseQty, setPulseQty] = useState(0)
  const [showMaxStock, setShowMaxStock] = useState(false)

  const totalItems = useCartStore(state => state.getTotalItems())



  useEffect(() => {
    const fetchProfileName = async () => {
      if (user) {
        const name = user.user_metadata?.full_name || session?.user_metadata?.full_name
        if (name) {
          setProfileName(name)
          return
        }
        
        // Fallback to Supabase profile
        try {
          const { data } = await getSupabase()
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
          
          if (data?.full_name) setProfileName(data.full_name)
        } catch (error) {
          console.error('Profile name fetch error:', error)
        }
      }
    }

    fetchProfileName()
  }, [user, session])

    // Listen for cart changes to trigger pulse & max stock
  useEffect(() => {
    const handleCartChange = () => {
      const cart = useCartStore.getState()
      if (cart.isAnimating) {
        setPulseQty(1)
        setTimeout(() => setPulseQty(0), 800)
      }
    }
    const unsub = useCartStore.subscribe(handleCartChange)
    return unsub
  }, [])

  // Max stock indicator
  useEffect(() => {
    const cart = useCartStore.getState().items
    const hasMaxStockItem = cart.some(item => item.quantity >= (item.stock ?? 999))
    setShowMaxStock(hasMaxStockItem)
  }, [useCartStore(state => state.items)])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-lg"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">

          <Link
            to="/"
            className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600 bg-clip-text text-transparent hover:scale-105 transition-all"
          >
            PremiumStore
          </Link>

          <div className="flex items-center space-x-6">

            <Link
              to="/products"
              className="text-lg font-medium hover:text-emerald-600 transition-colors px-3 py-2 rounded-xl hover:bg-emerald-50"
            >
              Products
            </Link>

            {/* Enhanced Cart Badge with dynamic qty pulse */}
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link to="/cart" className="relative p-3 rounded-2xl hover:bg-slate-100 transition-all group">
                    <ShoppingCart size={22} className="text-slate-700 group-hover:text-emerald-600" />
                    <motion.span 
                      className={`absolute -top-0.3 -right-0.5 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white drop-shadow-xl animate-pulse ${
                        showMaxStock 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      key={totalItems}
                      initial={{ scale: 1.2, y: -5 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      {totalItems}
                      {showMaxStock && <span className="text-xs ml-0.5">!</span>}
                    </motion.span>
                    {pulseQty > 0 && (
                      <motion.div 
                        className="absolute -top-2 -right-2 text-xs font-bold text-emerald-500 shadow-sm"
                        initial={{ scale: 0.5, opacity: 0, y: -10 }}
                        animate={{ scale: 1.3, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        +{pulseQty}
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile/Auth Section */}
            <div className="relative">
              {user ? (
                <>
                  <motion.button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-emerald-50 hover:to-emerald-100 border border-slate-200 hover:border-emerald-300 text-sm font-semibold transition-all shadow-sm hover:shadow-md group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserIcon size={20} className="text-slate-700 group-hover:text-emerald-600" />
                    <span>{profileName || user.email.split('@')[0]}</span>
                    <ChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 origin-top-right z-50"
                      >
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all w-full"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <UserIcon size={18} />
                          Profile
                        </Link>
                        <motion.button
                          onClick={async () => {
                            await signOut()
                            setShowProfileMenu(false)
                          }}
                          className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all w-full"
                          whileHover={{ backgroundColor: '#fef2f2' }}
                        >
                          <LogOut size={18} />
                          Logout
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-green-700 transition-all text-sm whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

