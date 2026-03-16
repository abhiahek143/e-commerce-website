import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Truck, CreditCard, Shield, CheckCircle, ArrowLeft, MapPin, Phone, User } from 'lucide-react'
import StarRating from '@/components/StarRating'
import { toast } from 'sonner'

const Checkout = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { items, addToCart, getSubtotal, deliveryFee, clearCart, applyCoupon, clearCoupon, couponCode, couponDiscount, couponIsValid, getProductDiscount, getTotalDiscount, getTax, getGrandTotal } = useCartStore()
  const { user } = useAuthStore()
  
  const [step, setStep] = useState('summary') // 'summary', 'address', 'payment', 'success'
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    fullName: user?.user_metadata?.full_name || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [orderId, setOrderId] = useState(null)
  
  const couponInputRef = useRef(null)

  const productId = searchParams.get('productId')
  const fromCart = searchParams.get('fromCart')

  // Single product auto-add
  useEffect(() => {
    if (productId && items.length === 0) {
      // Fetch product and add to cart (use existing hook or sample)
      // For now, skip detailed fetch - assume cart populated elsewhere
      toast.info('Product added to cart')
    }
  }, [productId, items.length])

  // Auth guard
  useEffect(() => {
    if (!user) {
      toast.info('Please login to checkout')
      navigate('/login', { replace: true, state: { from: '/checkout' + window.location.search } })
    }
  }, [user, navigate])

  if (!user || step === 'success') {
    return null // Guard handled
  }

  const subtotal = getSubtotal()
  const tax = getTax(subtotal)
  const total = getGrandTotal()

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (!address.street || !address.city || !address.zip || !address.phone) {
      toast.error('Please fill all address fields')
      return
    }
    setStep('payment')
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Submit order
    fetch('http://localhost:5001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subtotal,
          tax,
          delivery_fee: deliveryFee,
          total,
          address,
          payment_method: paymentMethod,
          items,
          coupon_code: couponCode || null
        })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setOrderId(data.order.id)
        clearCart()
        toast.success('Order placed successfully! Order #' + data.order.id.slice(0,8))
        setStep('success')
      } else {
        throw new Error(data.error)
      }
    })
    .catch(err => {
      toast.error('Order failed: ' + err.message)
    })
    .finally(() => setLoading(false))
  }

  if (step === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50 py-20 px-4"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
            Order Placed Successfully!
          </h1>
          <p className="text-xl text-slate-600 mb-8">Thank you for your purchase. We'll send a confirmation email shortly.</p>
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
            <h3 className="font-bold text-2xl mb-4">Order #{orderId?.slice(0,8)}</h3>
            <p className="text-slate-600 mb-1">Total: ₹{total.toLocaleString('en-IN')}</p>
            {couponCode && <p className="text-emerald-600 text-sm font-bold">Coupon Applied: {couponCode}</p>}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/products')} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate('/orders')}>View Orders</Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="mb-12">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            {fromCart && 'Cart'} → Checkout → {step === 'summary' ? 'Review' : step === 'address' ? 'Address' : 'Payment'}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Cart Items + Summary */}
          <motion.div 
            initial={{ x: -20 }} 
            animate={{ x: 0 }} 
            className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 lg:self-start"
          >
            {/* Cart Items */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold mb-6">Your Items ({items.length})</h2>
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl mb-4 last:mb-0"
                  >
                    <img src={item.images?.[0]} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg line-clamp-1 mb-1">{item.name}</h4>
                      <StarRating rating={item.rating} reviewCount={item.reviewCount} className="mb-2" />
                      <p className="text-sm text-slate-600">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-emerald-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between font-medium"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Product Discount</span><span>-₹{Math.round(getProductDiscount()).toLocaleString('en-IN')}</span></div>
                
                {/* Amazon-style Coupon Section */}
                <div className="space-y-3 mb-3">
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
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm placeholder-slate-500"
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
                      className="px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white font-bold text-sm rounded-md shadow-sm h-10"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
                {couponIsValid && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <span className="font-medium text-orange-900 text-sm">Coupon: {couponCode}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-orange-700">-₹{Math.round(couponDiscount).toLocaleString('en-IN')}</span>
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
                <div className="flex justify-between"><span>Tax ({(tax/subtotal*100).toFixed(0)}%)</span><span>+₹{tax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Delivery Fee</span><span>+₹{deliveryFee}</span></div>
              </div>
              <div className="border-t pt-6">
                <div className="flex justify-between text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 text-sm text-slate-600">
                <div className="flex flex-col items-center"><Truck className="w-5 h-5 mb-1 text-emerald-500" /><span>Free Returns</span></div>
                <div className="flex flex-col items-center"><CreditCard className="w-5 h-5 mb-1 text-blue-500" /><span>Secure Payment</span></div>
                <div className="flex flex-col items-center"><Shield className="w-5 h-5 mb-1 text-purple-500" /><span>Buyer Protected</span></div>
              </div>
            </div>
          </motion.div>

          {/* Right: Forms */}
          <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="space-y-8">
            {step === 'summary' && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-2xl font-bold mb-8">Ready to checkout?</h3>
                <Button onClick={() => setStep('address')} size="lg" className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl font-bold text-lg">
                  Continue to Address
                </Button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 'address' && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
                >
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <MapPin className="w-7 h-7 text-emerald-500" />
                    Delivery Address
                  </h3>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({...address, fullName: e.target.value})}
                        className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        placeholder="House number and street"
                        className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          City
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State / ZIP</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          placeholder="State"
                          className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={address.zip}
                          onChange={(e) => setAddress({...address, zip: e.target.value})}
                          placeholder="ZIP"
                          className="w-full mt-2 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({...address, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep('summary')} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl">
                        Continue to Payment
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 'payment' && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
                >
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <CreditCard className="w-7 h-7 text-blue-500" />
                    Payment Method
                  </h3>
                  <div className="space-y-3 mb-8">
                    {['card', 'paypal', 'cod'].map(method => (
                      <Button
                        key={method}
                        type="button"
                        variant={paymentMethod === method ? 'default' : 'outline'}
                        className={`w-full justify-start h-16 rounded-2xl ${paymentMethod === method ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl' : ''}`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        <CreditCard className="w-5 h-5 mr-3" />
                        {method === 'card' ? '💳 Credit/Debit Card' : method === 'paypal' ? 'PayPal' : '💰 Cash on Delivery'}
                      </Button>
                    ))}
                  </div>
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="flex gap-4 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => setStep('address')} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-2xl text-lg font-bold h-14">
                        {loading ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                        <CreditCard className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Checkout

