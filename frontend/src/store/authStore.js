import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Frontend env check
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase env vars in frontend!')
      console.error('💡 Add to frontend/.env.local:')
      console.error('VITE_SUPABASE_URL=https://your-project.supabase.co')
      console.error('VITE_SUPABASE_ANON_KEY=your-anon-key')
      console.error('Restart dev server: npm run dev')
      throw new Error('Supabase env vars missing')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

export { getSupabase }

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,

      initializeSession: async () => {
        // Get initial session
        const {
          data: { session }
        } = await getSupabase().auth.getSession()

        set({
          session,
          user: session?.user ?? null,
          isLoading: false
        })

        // Add real-time auth listener
        const {
          data: { subscription }
        } = getSupabase().auth.onAuthStateChange((event, session) => {
          console.log('🔐 Auth event:', event)

          set({
            session,
            user: session?.user ?? null,
            isLoading: false
          })

          // Sync/update profile on signin/signup
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            get().syncUserProfile(session?.user)
          }
        })
      },

      syncUserProfile: async (user) => {
        if (!user) return

        try {
          const { error } = await getSupabase()
            .from('profiles')
            .upsert(
              {
                id: user.id,
                full_name:
                  user.user_metadata?.full_name ||
                  user.email.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url || '',
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' } // prevents insert conflicts
            )

          if (error) {
            console.warn('Profile sync skipped:', error.message)
          } else {
            console.log('✅ Profile synced:', user.email)
          }
        } catch (err) {
          console.error('Profile sync failed:', err)
        }
      },

      signUp: async (email, password) => {
        const { data, error } = await getSupabase().auth.signUp({
          email,
          password
        })

        if (error) throw error
        return data
      },

      signIn: async (email, password) => {
        const { data, error } =
          await getSupabase().auth.signInWithPassword({
            email,
            password
          })

        if (error) throw error

        // Listener handles state update + profile sync
        console.log('✅ Login success:', data.user?.email)

        return data
      },

      signOut: async () => {
        await getSupabase().auth.signOut()
        set({ user: null, session: null })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)