import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'

const Home = () => {
  const { products: apiProducts, loading, error, refetch } = useProducts()
  const featuredProducts = apiProducts.slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Hero Section */}
        <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-900/50 to-amber-800 text-white p-12 lg:p-20 text-center shadow-2xl ring-1 ring-amber-400/30"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-grid-white/10"
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-amber-300 via-white to-orange-200 bg-clip-text text-transparent drop-shadow-2xl mb-6 leading-tight"
          >
            Premium Products
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 opacity-90"
          >
            Discover luxury items with smooth shopping experience
          </motion.p>
          <Link to="/products">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-slate-900 px-12 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              Shop Now
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Featured Products */}
      <section>
        <motion.h2 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Featured Products
        </motion.h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 h-80 rounded-2xl" />
                <div className="h-6 bg-slate-200 rounded mt-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">Failed to load featured products</p>
            <Button onClick={refetch} size="sm">Retry</Button>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <p className="text-slate-500">No featured products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
{featuredProducts.slice(0,8).map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isPremium={index < 4}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}

export default Home

