import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Minus, Plus, CreditCard } from 'lucide-react'
import { Button } from './ui/button'
import { useCartStore } from '@/store/cartStore'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={64} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-lg text-slate-600">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 p-4 border-b border-slate-100 last:border-b-0"
                    >
                      <img 
                        src={item.images?.[0]} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                        <p className="text-lg font-bold">${item.price}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-9 w-9"
                        >
                          <Minus size={16} />
                        </Button>
                        
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-9 w-9"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50/50">
              <div className="space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Link 
                    to="/checkout"
                    className="flex-1"
                    onClick={onClose}
                  >
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <CreditCard size={18} className="mr-2" />
                      Checkout
                    </Button>
                  </Link>
                  
                  {items.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full px-4"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer

