import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner' // Placeholder

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: async (product) => {
        const existing = get().items.find(item => item.id === product.id)
        if (existing) {
          toast.info('Already in wishlist')
          return
        }
        set({ items: [...get().items, product] })
        toast.success(`${product.name} added to wishlist!`)
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
        toast.success('Removed from wishlist')
      },

      toggleWishlist: (product) => {
        const existing = get().items.find(item => item.id === product.id)
        if (existing) {
          get().removeFromWishlist(product.id)
        } else {
          get().addToWishlist(product)
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId)
      },

      clearWishlist: () => set({ items: [] })
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

