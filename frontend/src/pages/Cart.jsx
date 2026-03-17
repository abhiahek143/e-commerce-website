import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Truck, CreditCard, ShoppingCart, ArrowLeft, Minus, Plus, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import StarRating from '@/components/StarRating'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'



const Cart = () => {
    const { items, removeFromCart, clearCart, updateQuantity, getTotal, getMRP, getGrandTotal, getSavings, deliveryFee, couponCode, couponIsValid, couponDiscount, applyCoupon, clearCoupon, getSubtotal, getProductDiscount, getTotalDiscount } = useCartStore()
    const { toggleWishlist, isInWishlist } = useWishlistStore()
    const [couponError, setCouponError] = useState('')
    const couponInputRef = useRef(null)

    // Clear coupon on every Cart page visit
    useEffect(() => {
      clearCoupon()
    }, [])


  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const moveToWishlist = (product) => {
    toggleWishlist(product)
    toast.success('Moved to wishlist')
  }

  const navigate = useNavigate()

  const quantityOptions = Array.from({ length: 20 }, (_, i) => i + 1)

  const handleCheckout = () => {
    navigate('/checkout?fromCart=true')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <ShoppingCart size={80} className="mx-auto text-slate-400 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <Link to="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-xl">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 font-medium">
              <span>{itemCount} items</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-3 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-slate-200"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={item.images?.[0] || 'https://via.placeholder.com/120x120/64748B/ECEDEE?text=?'} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl shadow-md"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Size: M | Color: Blue | Category: {item.category}</p>
                    <StarRating rating={item.rating || 4.3} reviewCount={item.reviews || 156} className="mb-4" />
                    
                    {/* Prices */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-600">₹{(item.price * item.quantity).toFixed(0)}</span>
                        <span className="text-lg line-through text-slate-500">₹{((item.price * 1.2) * item.quantity).toLocaleString()}</span>
                      </div>
                      <span className="inline-flex bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        {Math.round((1 - item.price / (item.price * 1.2)) * 100)}% off
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mb-6">
                      <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Qty:</label>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-10 w-10 hover:bg-slate-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={18} />
                        </Button>
                        <span className="w-12 text-center text-lg font-bold text-slate-900 mx-2">
                          {item.quantity}
                          {item.stock && item.quantity >= item.stock && (
                            <span className="ml-1 text-xs text-red-500 font-bold animate-pulse">Max!</span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newQty = item.quantity + 1
                            const maxQty = item.stock ?? 999
                            if (newQty > maxQty) {
                              toast.warning(`Max stock reached: ${maxQty.toLocaleString()} items`, { duration: 3000 })
                              return
                            }
                            updateQuantity(item.id, newQty)
                          }}
                          className="h-10 w-10 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity >= (item.stock ?? 999)}
                        >
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* Delivery */}
                    <p className="flex items-center gap-2 text-sm text-green-600 font-medium mb-6">
                      <Truck size={16} />
                      {(() => {
                        const days = ['tomorrow', 'in 2 days', 'by Friday', 'next Monday', 'in 3 days'];
                        const randomDay = days[Math.floor(Math.random() * days.length)];
                        return `Delivery ${randomDay}`;
                      })()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveToWishlist(item)}
                        className="h-12 w-12 hover:bg-red-50 text-red-500 hover:text-red-600 hover:scale-105"
                      >
<Heart fill={isInWishlist(item.id) ? "currentColor" : "none"} strokeWidth={isInWishlist(item.id) ? 0 : 2} className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-12 flex-1 hover:bg-red-50 text-red-500 hover:text-red-600 hover:scale-105"
                      >
                        <Trash2 size={18} className="mr-2" />
                        Remove
                      </Button>
                      <Link to={`/checkout?productId=${item.id}`}>
                        <Button className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-sm font-bold">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column - Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 lg:h-fit lg:self-start"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
              
              {/* Amazon-style Coupon Section */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    ref={couponInputRef}
                    placeholder="Apply a coupon code"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const code = e.target.value.trim();
                        if (code) {
                          try {
                            await applyCoupon(code);
                            e.target.value = '';
                          } catch (err) {
                            toast.error(err.message || 'Invalid coupon. Try WELCOME10');
                          }
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm placeholder-slate-500"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (couponInputRef.current?.value.trim()) {
                        const code = couponInputRef.current.value.trim();
                        try {
                          await applyCoupon(code);
                          couponInputRef.current.value = '';
                        } catch (err) {
                          toast.error(err.message || 'Invalid coupon. Try WELCOME10');
                        }
                      }
                    }}
                    className="px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold text-sm rounded-md shadow-sm whitespace-nowrap"
                  >
                    Apply
                  </Button>
                </div>
                
                

                {couponIsValid && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <span className="font-medium text-orange-900 text-sm">Coupon: {couponCode}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-orange-700">-₹{Math.round(couponDiscount).toLocaleString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCoupon}
                        className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-200 rounded"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span>MRP:</span>
                  <span className="font-semibold">₹{getMRP().toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Delivery Fee:</span>
                  <span>+ ₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Product Discount:</span>
                  <span>- ₹{Math.round(getProductDiscount()).toLocaleString('en-IN')}</span>
                </div>
                {couponIsValid && (
                  <div className="flex justify-between text-sm font-medium text-orange-900 bg-orange-50 p-2 rounded-lg border border-orange-200">
                    <span>Coupon ({couponCode})</span>
                    <span className="font-bold">-₹{Math.round(couponDiscount).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-6 mb-6">
                <div className="flex justify-between items-center text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent py-3 px-4 rounded-xl">
                  <span>Total:</span>
                  <span>₹{getGrandTotal().toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                </div>
              </div>

              <div className="text-center py-4 bg-emerald-50 rounded-xl mb-6">
                <p className="text-sm text-emerald-700 font-bold">You will save</p>
                <p className="text-xl font-black text-emerald-600">₹{getSavings().toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-2xl rounded-2xl"
              >
                <CreditCard size={24} className="mr-3" />
                Place Order
              </Button>

              <Button 
                variant="outline" 
                className="w-full mt-4 h-12 text-sm"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <AnimatePresence mode="wait">
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-slate-200 p-4 z-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total ({itemCount} items)</p>
                <p className="text-xl font-bold text-emerald-600">₹{getGrandTotal().toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
              </div>
              <Link to="/checkout?fromCart=true">
                <Button className="h-14 px-8 ml-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-xl rounded-xl font-bold text-base">
                  Place Order
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Cart

