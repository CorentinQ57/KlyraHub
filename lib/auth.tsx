"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ data: any | null; error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ data: any | null; error: Error | null }>
  checkUserRole: (userId: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Check user role function
  const checkUserRole = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }

      return data?.role || null
    } catch (error) {
      console.error('Error in checkUserRole:', error)
      return null
    }
  }

  // Get initial session and set up auth state listener
  const getInitialSession = async () => {
    try {
      setIsLoading(true)

      // Check for active session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      }

      if (session) {
        setSession(session)
        setUser(session.user)
        
        // Check if user is admin
        const role = await checkUserRole(session.user.id)
        setIsAdmin(role === 'admin')
      } else {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getInitialSession()

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`)
        
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Check if user is admin on auth state change
          const role = await checkUserRole(session.user.id)
          setIsAdmin(role === 'admin')
          
          // Update last_sign_in_at in profiles table
          if (event === 'SIGNED_IN') {
            try {
              // Ne pas inclure l'ID dans l'objet mis à jour pour éviter l'erreur 400
              await supabase
                .from('profiles')
                .update({ last_sign_in_at: new Date().toISOString() })
                .eq('id', session.user.id)
            } catch (updateError) {
              console.error('Error updating last sign in time:', updateError)
            }
          }
        } else {
          setSession(null)
          setUser(null)
          setIsAdmin(false)
        }

        setIsLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Signing up user:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'client'
          }
        }
      })

      if (error) {
        console.error('Error signing up:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception in signUp:', error)
      return { data: null, error: error as Error }
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Error signing in:', error)
        return { data: null, error }
      }

      // If successful, update local state immediately
      if (data.user) {
        setSession(data.session)
        setUser(data.user)
        
        // Check user role
        const role = await checkUserRole(data.user.id)
        setIsAdmin(role === 'admin')
        
        // Update last_sign_in_at in profiles table
        try {
          // Ne pas inclure l'ID dans l'objet mis à jour pour éviter l'erreur 400
          await supabase
            .from('profiles')
            .update({ last_sign_in_at: new Date().toISOString() })
            .eq('id', data.user.id)
        } catch (updateError) {
          console.error('Error updating last sign in time:', updateError)
          // Non-critical error, don't return it
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception in signIn:', error)
      return { data: null, error: error as Error }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      return { data, error }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { data: null, error: error as Error }
    }
  }

  // Create context value
  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    checkUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export the provider
export default AuthProvider 