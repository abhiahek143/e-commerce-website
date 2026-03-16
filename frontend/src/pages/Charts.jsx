import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { ShoppingCart, DollarSign, Users, Star } from 'lucide-react'

// Mock data
const salesData = [
  { month: 'Jan', sales: 12000, orders: 45 },
  { month: 'Feb', sales: 15000, orders: 58 },
  { month: 'Mar', sales: 18000, orders: 72 },
  { month: 'Apr', sales: 14000, orders: 52 },
  { month: 'May', sales: 22000, orders: 89 },
]

const revenueData = [
  { week: 'W1', revenue: 5000 },
  { week: 'W2', revenue: 6200 },
  { week: 'W3', revenue: 5800 },
  { week: 'W4', revenue: 7500 },
]

const Charts = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 py-12"
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-slate-600">Loading insights...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100/50 backdrop-blur-sm animate-pulse rounded-3xl border" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 py-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-4">
          Analytics Dashboard
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Real-time insights into sales, revenue, and business performance
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          className="group bg-gradient-to-br from-emerald-500/10 to-emerald-400/10 backdrop-blur-xl rounded-3xl p-8 border border-emerald-200/50 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-emerald-100/80 rounded-2xl backdrop-blur-sm">
              <ShoppingCart className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-3xl lg:text-4xl font-black text-slate-900">$89.2K</span>
          </div>
          <p className="text-slate-700 font-semibold mb-1 text-lg">Total Revenue</p>
          <p className="text-emerald-600 font-bold text-sm flex items-center gap-1">
            +25.4% <span className="text-xs">vs last month</span>
          </p>
        </motion.div>

        <motion.div
          className="group bg-gradient-to-br from-blue-500/10 to-blue-400/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/50 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-blue-100/80 rounded-2xl backdrop-blur-sm">
              <DollarSign className="w-7 h-7 text-blue-600" />
            </div>
            <span className="text-3xl lg:text-4xl font-black text-slate-900">1.2K</span>
          </div>
          <p className="text-slate-700 font-semibold mb-1 text-lg">Total Orders</p>
          <p className="text-blue-600 font-bold text-sm flex items-center gap-1">
            +12% <span className="text-xs">this month</span>
          </p>
        </motion.div>

        <motion.div
          className="group bg-gradient-to-br from-purple-500/10 to-purple-400/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-purple-100/80 rounded-2xl backdrop-blur-sm">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <span className="text-3xl lg:text-4xl font-black text-slate-900">4.8⭐</span>
          </div>
          <p className="text-slate-700 font-semibold mb-1 text-lg">Avg Rating</p>
          <p className="text-purple-600 font-bold text-sm">2.3K Reviews</p>
        </motion.div>

        <motion.div
          className="group bg-gradient-to-br from-orange-500/10 to-orange-400/10 backdrop-blur-xl rounded-3xl p-8 border border-orange-200/50 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-orange-100/80 rounded-2xl backdrop-blur-sm">
              <Star className="w-7 h-7 text-orange-600" />
            </div>
            <span className="text-3xl lg:text-4xl font-black text-slate-900">32%</span>
          </div>
          <p className="text-slate-700 font-semibold mb-1 text-lg">Conversion Rate</p>
          <p className="text-orange-600 font-bold text-sm">Target: 35%</p>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-8"
      >
        {/* Sales Bar Chart */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            Monthly Sales & Orders
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
              +18% MoM
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0,0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#10b981" name="Sales ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" fill="#84cc16" name="Orders" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Line Chart */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            Weekly Revenue Trend
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              +22% WoW
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0,0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={4}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                activeDot={{ r: 8, strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Charts

