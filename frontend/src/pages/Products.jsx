import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Search, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sampleProducts } from './sampleProducts.js'

const categories = ['all', 'electronics', 'clothing', 'books', 'furniture']

const ProductsPage = () => {
  const { products: apiProducts, loading, error, refetch } = useProducts()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  
  const filteredProducts = useMemo(() => {
    let result = [...apiProducts]

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter)
    }

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim()
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.category.toLowerCase().includes(lowerSearch)
      )
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [apiProducts, categoryFilter, searchTerm, sortBy])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            All Products ({filteredProducts.length})
          </h1>
          <p className="text-xl text-slate-600 mt-2">Premium quality selection</p>
        </div>
        
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-slate-200 focus:border-transparent h-12"
            />
          </div>
          <div className="flex items-center gap-1 text-sm bg-slate-100 p-2 rounded-xl border">
            <ArrowUpDown size={16} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
{categories.map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? 'default' : 'outline'}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "capitalize transition-all duration-300",
              cat === 'premium' && "bg-gradient-to-r from-amber-400/20 to-orange-400/20 border-amber-300/50 text-amber-800 hover:from-amber-500/30 hover:shadow-md hover:shadow-amber-300/25 font-semibold"
            )}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Skeleton className="h-[380px] rounded-3xl" />
              <Skeleton className="h-5 w-3/4 mt-4 rounded-lg" />
              <Skeleton className="h-6 w-20 mt-2 rounded-lg" />
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Failed to load products</h3>
          <Button onClick={refetch} className="mr-4">Retry</Button>
          <p className="text-slate-500 mt-2">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">No products found</h3>
          <p className="text-xl text-slate-500 mb-8">Try adjusting your search or filters</p>
          <Button onClick={refetch}>Refresh Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 [3xl]:grid-cols-6 gap-8">
{filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ProductsPage

