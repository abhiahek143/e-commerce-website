import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import { getSupabase } from '@/store/authStore'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      isAnimating: false,

      addToCart: async (product) => {
        set({ isAnimating: true })

        setTimeout(() => {
          const existingItem = get().items.find(item => item.id === product.id)
          const addQty = product.quantity || 1

          if (existingItem) {
            const updatedItems = get().items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + addQty }
                : item
            )

            set({ items: updatedItems })
            get().syncToSupabase(updatedItems)

          } else {
            const newItems = [...get().items, { ...product, quantity: addQty }]

            set({ items: newItems })
            get().syncToSupabase(newItems)
          }

          toast.success(`${product.name} x${addQty} added to cart!`)
          set({ isAnimating: false })
        }, 600)
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        const updatedItems = get().items.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )

        set({ items: updatedItems })
        get().syncToSupabase(updatedItems)
      },

      removeFromCart: (productId) => {
        const updatedItems = get().items.filter(item => item.id !== productId)

        set({ items: updatedItems })
        get().syncToSupabase(updatedItems)
      },

      clearCart: () => {
        set({ items: [] })
        get().syncToSupabase([])
      },

      syncToSupabase: async (items) => {
        if (get().isSyncing) return

        set({ isSyncing: true })

        try {
          const supabase = getSupabase()
          const { data: { user } } = await supabase.auth.getUser()

          console.log('User ID for cart sync:', user?.id)

          if (!user) {
            console.log('No user - using localStorage only')
            return
          }

          const { data: existingCart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (existingCart) {
            const { error } = await supabase
              .from('carts')
              .update({
                items: items,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)

            if (error) throw error

          } else {
            const { error } = await supabase
              .from('carts')
              .insert({
                user_id: user.id,
                items: items,
                updated_at: new Date().toISOString()
              })

            if (error) throw error
          }

          console.log('✅ Cart synced to Supabase')

        } catch (error) {
          console.error('Cart sync error:', error)
          toast.error('Cart sync failed - changes saved locally')
        } finally {
          set({ isSyncing: false })
        }
      },

      deliveryFee: 50,

      getMRP: () => {
        return get().items.reduce((total, item) => {
          const origPrice = item.origPrice || item.price * 1.2
          return total + (origPrice * item.quantity)
        }, 0)
      },

      getSavings: () => {
        return get().getMRP() - get().getSubtotal() + (get().couponIsValid ? get().couponDiscount : 0)
      },

      couponCode: '',
      couponDiscount: 0,
      couponIsValid: false,
      couponType: '',

      applyCoupon: async (code) => {
        try {
          const response = await fetch('http://localhost:5001/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code.trim().toUpperCase() })
          })

          const result = await response.json()

          if (!result.valid) {
            set({ couponCode: '', couponDiscount: 0, couponIsValid: false, couponType: '' })
            toast.error(result.message || 'Invalid coupon')
            throw new Error(result.message || 'Invalid coupon')
          }

          const subtotal = get().getSubtotal()

          let discount = 0
          let type = result.type || 'percent'

          if (type === 'percent') {
            discount = subtotal * Number(result.discount)
          } else if (type === 'fixed') {
            discount = Number(result.discount)
          }

          set({
            couponCode: result.code,
            couponDiscount: discount,
            couponIsValid: true,
            couponType: type
          })

          const savings =
            type === 'percent'
              ? `-${(Number(result.discount) * 100).toFixed(0)}%`
              : `-₹${discount.toLocaleString()}`

          toast.success(`Coupon ${result.code} applied! ${savings}`)

        } catch (error) {
          console.error('Coupon apply error:', error)
          toast.error(error.message || 'Failed to validate coupon')
          set({ couponCode: '', couponDiscount: 0, couponIsValid: false, couponType: '' })
        }
      },

      clearCoupon: () => {
        set({ couponCode: '', couponDiscount: 0, couponIsValid: false, couponType: '' })
        toast.info('Coupon cleared')
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.price * item.quantity)
        }, 0)
      },

      getProductDiscount: () => {
        return get().items.reduce((total, item) => {
          const origPrice = item.origPrice || item.price * 1.2
          return total + ((origPrice - item.price) * item.quantity)
        }, 0)
      },

      getTotalDiscount: () => {
        return get().getProductDiscount() + get().couponDiscount
      },

      getTax: (subtotal) => {
        return subtotal * 0.1
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal()
        return subtotal + get().deliveryFee + get().getTax(subtotal) - get().getTotalDiscount()
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)