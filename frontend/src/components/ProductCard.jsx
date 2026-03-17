import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { ShoppingCart, ArrowRight, Heart, AlertCircle } from 'lucide-react'
import StarRating from './StarRating'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'




const ProductCard = ({ product, isPremium = false, className = '' }) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const cartItems = useCartStore((state) => state.items)
  const navigate = useNavigate()
const [showMaxError, setShowMaxError] = useState(false)
  const [showAddAnim, setShowAddAnim] = useState(false)


  const buyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${product.id}`)
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0

  return (
    <motion.div
      whileHover={{ y: isPremium ? -8 : -4, scale: isPremium ? 1.02 : 1 }}
      className={cn(
        "group bg-white rounded-2xl shadow-md hover:shadow-xl border overflow-hidden h-[450px] transition-all duration-500",
        isPremium && "ring-2 ring-amber-200/50 shadow-amber-200/25 hover:shadow-amber-400/40 hover:ring-amber-300/70 border-amber-100/50 relative",
        className
      )}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop&auto=format'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10"
        />
        {isPremium && (
          <div className="absolute top-3 left-3 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-500/50 animate-ping-slow" />
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% off
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-red-500/95 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Sold Out</span>
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-all bg-white/90 hover:bg-white rounded-full shadow-lg">
          <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 transition-colors" />
        </button>
      </div>
      
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`} className="hover:no-underline">
          <h3 className="font-bold text-lg line-clamp-2 text-slate-900 group-hover:text-emerald-700">
            {product.name}
          </h3>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mt-1" />
        </Link>
        
        <p className="text-sm text-slate-600 line-clamp-2 flex-1">
          {product.description}
        </p>
        
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">₹{product.price}</span>
              {discount > 0 && (
                <span className="text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
          
          {product.stock > 0 ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 relative">
              <motion.button
                onClick={buyNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-9 px-4 rounded-lg font-medium text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/50 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                Buy Now
                <ArrowRight className="w-4 h-4" />
              </motion.button>
                <Button 
className="h-9 px-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-xl hover:shadow-2xl hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gradient-to-r disabled:hover:from-gray-400 disabled:hover:to-gray-500 flex items-center justify-center gap-1.5 transition-all duration-300 w-28 sm:w-auto"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const cartItems = useCartStore.getState().items
                    const existingCartItem = cartItems.find(item => item.id === product.id)
                    const currentCartQty = existingCartItem ? existingCartItem.quantity : 0
                    const newTotalQty = currentCartQty + 1
                    const maxStock = product.stock ?? 999
                    if (newTotalQty > maxStock) {
                      setShowMaxError(true)
                      setTimeout(() => setShowMaxError(false), 3000)
                      toast.error(`Cannot add! Max stock ${maxStock.toLocaleString()} reached (cart has ${currentCartQty})`, { duration: 4000 })
                      return
                    }
                    addToCart(product)
                    setShowAddAnim(true)
                    setTimeout(() => setShowAddAnim(false), 1000)
                  }}
                
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add</span>
                </Button>
                <AnimatePresence>
                  {showAddAnim && (
                    <motion.div
                      className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20"
                      initial={{ scale: 0, y: 0 }}
                      animate={{ scale: 1.3, y: -10 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      +1
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showMaxError && (
                    <motion.div 
                      initial={{ opacity: 1, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Max stock reached! 
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          ) : (
            <Button disabled className="w-full bg-slate-200 text-slate-500 cursor-not-allowed h-10">
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard