import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowLeft, Image as ImageIcon, Truck, Shield, Star, ChevronLeft, ChevronRight, Minus, Plus, AlertCircle } from 'lucide-react'

import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import StarRating from '@/components/StarRating'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import ProductCard from '@/components/ProductCard'

// Sample specs for 4K Monitor (extendable)
const monitorSpecs = {
  'Screen Size': '27 inches',
  'Resolution': '3840 x 2160 (4K UHD)',
  'Panel Type': 'IPS',
  'Refresh Rate': '60Hz',
  'Response Time': '5ms',
  'Brightness': '350 cd/m²',
  'Contrast Ratio': '1000:1',
  'Color Gamut': '99% sRGB',
  'HDR': 'HDR10',
  'Connectivity': 'HDMI 2.0 x2, DisplayPort 1.4, USB-C',
  'Speakers': '2x 3W',
  'VESA Mount': '100x100mm',
  'Weight': '5.4 kg'
}

// Sample reviews
const sampleReviews = [
  {
    id: 1,
    user: 'Rahul S.',
    rating: 5,
    date: '2026-03-10',
    comment: "Outstanding 4K monitor! Colors are vibrant and text is super sharp. Perfect for coding and gaming."
  },
  {
    id: 2,
    user: 'Priya M.',
    rating: 4,
    date: '2026-03-08',
    comment: "Great value for money. IPS panel gives excellent viewing angles. Speakers are decent."
  },
  {
    id: 3,
    user: 'Amit K.',
    rating: 5,
    date: '2026-03-05',
    comment: "Best monitor I've owned. HDR makes movies look cinematic. Highly recommend!"
  }
]

const ProductDetail = () => {
  const { id } = useParams()
  const { products, loading: productsLoading } = useProducts()
  const product = products.find(p => p.id === id)
  const addToCart = useCartStore((state) => state.addToCart)
  const [activeTab, setActiveTab] = useState('description')
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMaxError, setShowMaxError] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [loading, setLoading] = useState(true)

  const validateQuantity = () => {
    const cartItems = useCartStore.getState().items
    const existingCartItem = cartItems.find(item => item.id === product.id)
    const currentCartQty = existingCartItem ? existingCartItem.quantity : 0
    const newTotalQty = currentCartQty + qty
    const maxStock = product.stock ?? 999
    return newTotalQty <= maxStock
  }

  const validateBuyQuantity = () => {
    const maxStock = product.stock ?? 999
    return qty <= maxStock
  }

  const discount = product?.origiPrice ? Math.round(((product.origiPrice - product.price) / product.origiPrice) * 100) : 0
  const images = product?.images || ['https://images.unsplash.com/photo-1527444154887-e8bd9f18a998?w=800&fit=crop&auto=format']

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false)
    }
  }, [products])

  if (loading || productsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/3] rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-10 w-3/5" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 max-w-md mx-auto"
        >
          <ImageIcon className="w-24 h-24 text-slate-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Product Not Found</h1>
          <p className="text-slate-600 mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-600">
            <a href="/products">Browse Products</a>
          </Button>
        </motion.div>
      </div>
    )
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-slate-600">
            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-1">
              <ArrowLeft className="w-4 h-4 mr-1" />
              All Products
            </Button>
            <span className="px-2">/</span>
            <span>{product.category}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24 space-y-6">
              {/* Main Image */}
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl group relative cursor-zoom-in">
                <img 
                  src={images[currentImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
                  {images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={cn(
                        "flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 bg-slate-100 p-1 hover:scale-105 transition-all",
                        idx === currentImage && "ring-4 ring-emerald-400/50 border-emerald-400 shadow-md"
                      )}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:pt-4 space-y-8">
            <div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <StarRating rating={product.rating || 4.7} reviewCount={product.review_count || 654} className="mt-4" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl lg:text-5xl font-bold text-emerald-600">
                  ₹{product.price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <span className="text-2xl text-slate-500 line-through">₹{product.origiPrice?.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {discount}% off
                  </span>
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>{product.stock > 0 ? `In Stock: ${product.stock.toLocaleString()}` : 'Out of Stock'}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>1 Year Warranty</span>
              </div>
            </div>

            {/* Quantity & Buy */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg">Quantity:</span>
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 h-12 px-4 font-mono font-bold text-lg text-center border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-lg shadow-xl h-14 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (!validateQuantity()) {
                      setShowMaxError(true)
                      setTimeout(() => setShowMaxError(false), 3000)
                      toast.error(`Cannot add! Max stock ${product.stock?.toLocaleString() ?? '999'} reached`, { duration: 4000 })
                      return
                    }
                    await addToCart({ ...product, quantity: qty })
                    setShowSuccess(true)
                    setTimeout(() => setShowSuccess(false), 3000)
                  }}
                  disabled={qty <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"
                    >
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                      Added to cart! 
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showMaxError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Max stock reached! 
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button 
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg shadow-xl h-14 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (!validateBuyQuantity()) {
                      setShowMaxError(true)
                      setTimeout(() => setShowMaxError(false), 3000)
                      toast.error(`Cannot buy! Max stock ${product.stock?.toLocaleString() ?? '999'} reached`, { duration: 4000 })
                      return
                    }
                    await addToCart({ ...product, quantity: qty })
                    navigate('/checkout')
                  }}
                  disabled={qty <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="mt-24"
        >
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm",
                    activeTab === tab
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-8 pb-24"
              >
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-slate-700 leading-relaxed mb-8">
                    {product.description || "Experience stunning 4K visuals with this premium IPS monitor. Perfect for professionals, gamers, and creators."}
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Ultra-thin bezels for immersive viewing</li>
                    <li>• Factory calibrated for accurate colors</li>
                    <li>• Eye care technology reduces blue light</li>
                    <li>• Multiple connectivity options</li>
                    <li>• VESA mount compatible</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                key="specifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-8 pb-24"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <dl className="space-y-4">
                    {Object.entries(monitorSpecs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-sm font-medium text-slate-700">{key}</span>
                        <span className="text-sm font-mono text-slate-900">{value}</span>
                      </div>
                    ))}
                  </dl>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-8 pb-24"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <StarRating rating={product.rating || 4.7} reviewCount={product.review_count || 654} />
                      <p className="text-sm text-slate-500">Based on {product.review_count || 654} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {sampleReviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex gap-0.5 mb-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                            ))}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{review.user}</p>
                            <p className="text-sm text-slate-500">{review.date}</p>
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section 
            initial={{ y: 30, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }}
            className="mt-32"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}

export default ProductDetail

