import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { getSupabase } from '@/store/authStore'
import { User, Mail, Phone, MapPin, ShoppingBag, CreditCard, ChevronRight, ChevronLeft, LogOut, Edit, Check, X, Save } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const Profile = () => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const supabase = getSupabase()
  
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchOrders()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setProfile(data)
      setTempName(data?.full_name || '')
    } catch (error) {
      console.error('Profile fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from('carts')
        .select('*, items(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      setOrders(data || [])
    } catch (error) {
      console.error('Orders fetch error:', error)
    }
  }

  const handleEditName = async () => {
    if (!tempName.trim()) return

    setSaving(true)
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: tempName.trim() }
      })

      if (authError) throw authError

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: tempName.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (profileError) throw profileError

      setEditingName(false)
      setProfile({ ...profile, full_name: tempName.trim() })

    } catch (error) {
      console.error('Name update error:', error)
      alert('Failed to update name: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-32 w-full rounded-2xl bg-slate-200 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="md:col-span-2 space-y-4">
              <div className="h-10 w-3/4 bg-slate-200 rounded-2xl" />
              <div className="h-6 w-1/2 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mx-auto mb-6 shadow-2xl border-4 border-white">
            <User className="w-16 h-16 text-white m-auto mt-8" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-xl text-slate-600">Manage your account & orders</p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex">
              {['info', 'orders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 px-8 border-b-2 font-semibold text-lg flex-1",
                    activeTab === tab
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {tab === 'info' ? 'Personal Info' : 'Orders'}
                </button>
              ))}
            </nav>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-12"
              >
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-3xl border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                      <User className="w-8 h-8 text-emerald-600" />
                      Account Details
                    </h2>
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <label className="flex items-start gap-3 text-sm font-semibold text-slate-700 mb-3">
                          <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0">
                            <Edit className="w-4 h-4 text-slate-500" />
                          </div>
                          Full Name
                          <span className="text-xs text-slate-500">(updates everywhere)</span>
                        </label>
                        {editingName ? (
                          <div className="flex gap-3 items-end">
                            <input
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="flex-1 h-14 px-5 text-xl font-bold rounded-2xl border-2 border-emerald-200 bg-white focus:border-emerald-400 focus:ring-4 ring-emerald-100/50 shadow-sm transition-all"
                              autoFocus
                              placeholder="Enter your name"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleEditName}
                                disabled={!tempName.trim() || saving}
                                className="h-14 px-6 bg-emerald-500 hover:bg-emerald-600 shadow-lg flex items-center gap-2"
                              >
                                {saving ? (
                                  <>
                                    <Save className="w-4 h-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingName(false)
                                  setTempName(profile?.full_name || '')
                                }}
                                className="h-14 px-6 border-slate-200 hover:bg-slate-50 flex items-center"
                                disabled={saving}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <p className="text-2xl font-bold text-slate-900">{profile?.full_name || user.user_metadata?.full_name || 'Not set'}</p>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingName(true)
                                setTempName(profile?.full_name || user.user_metadata?.full_name || '')
                              }}
                              className="h-12 px-4 hover:bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white rounded-2xl shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            Email
                          </label>
                          <p className="text-lg font-medium text-slate-900 break-all">{user.email}</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl shadow-sm">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            Phone
                          </label>
                          <p className="text-lg text-slate-500">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={signOut}
                    className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-lg font-semibold rounded-2xl shadow-xl flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-12"
              >
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-emerald-600" />
                    Order History
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">No orders yet</h3>
                      <p className="text-slate-500 mb-8">Your orders will appear here once you make a purchase.</p>
                      <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-emerald-500/50">
                        <a href="/products">Shop Now →</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, idx) => (
                        <motion.div 
                          key={order.id || idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all hover:-translate-y-1"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-slate-900 text-lg">Order #{order.id.slice(-6)}</p>
                              <p className="text-sm text-slate-500">{new Date(order.updated_at).toLocaleDateString()}</p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wide">
                              {order.items?.length || 0} items
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-slate-600 mb-4">
                            {order.items?.slice(0, 3).map((item) => (
                              <div key={item.id} className="bg-slate-100 px-3 py-1 rounded-xl truncate max-w-24 font-medium">
                                {item.name}
                              </div>
                            ))}
                            {order.items?.length > 3 && (
                              <div className="bg-slate-100 px-3 py-1 rounded-xl text-xs">+{order.items.length - 3} more</div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button variant="outline" size="sm" className="flex items-center gap-1 hover:bg-emerald-50 text-emerald-600">
                              <CreditCard className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Profile

