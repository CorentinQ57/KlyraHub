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

      // Check for active session with a timeout for better error handling
      const sessionPromise = supabase.auth.getSession();
      
      // Timeout après 5 secondes pour éviter un blocage indéfini
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Session request timeout'));
        }, 5000);
      });
      
      // Race entre la promesse de session et le timeout
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('Error getting session:', error)
        // En cas d'erreur, on considère qu'il n'y a pas de session
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      if (session) {
        console.log("Found existing session for user:", session.user.id)
        setSession(session)
        setUser(session.user)
        
        // Check if user is admin
        const role = await checkUserRole(session.user.id)
        setIsAdmin(role === 'admin')
      } else {
        console.log("No active session found")
        setSession(null)
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error)
      // En cas d'erreur, on considère qu'il n'y a pas de session
      setSession(null)
      setUser(null)
      setIsAdmin(false)
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
          
          // Désactiver temporairement la mise à jour du last_sign_in_at
          // car la colonne n'existe pas dans le schéma de la base de données
          /*
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
          */
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

      console.log('Sign up response:', { user: data?.user?.id })
      
      // Si l'inscription a réussi mais que la session n'est pas encore active (confirmation par email)
      if (data.user) {
        try {
          // Import dynamique pour éviter les problèmes de dépendance circulaire
          const { createProfile } = await import('./supabase')
          
          // Créer un profil dans la table profiles
          console.log('Creating profile for new user...')
          const profileResult = await createProfile(data.user.id, {
            full_name: fullName,
            email: email,
            role: 'client',
          })
          
          if (profileResult.error) {
            console.error('Error creating profile after signup:', profileResult.error)
          } else {
            console.log('Profile created successfully after signup')
          }
        } catch (profileError) {
          console.error('Exception when creating profile after signup:', profileError)
          // Non-critical error, continue
        }
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

      console.log('Sign in response:', { data, error })

      if (error) {
        console.error('Error signing in:', error)
        return { data: null, error }
      }

      // If successful, update local state immediately
      if (data.user) {
        console.log('Setting user and session data:', data.user.id)
        setSession(data.session)
        setUser(data.user)
        
        // Check user role
        console.log('Checking user role...')
        const role = await checkUserRole(data.user.id)
        console.log('User role:', role)
        setIsAdmin(role === 'admin')
        
        // Force refresh of session cookies - this is important to ensure cookies are written
        console.log('Refreshing session to ensure cookies are written...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('Error refreshing session:', refreshError)
        } else {
          console.log('Session refreshed successfully')
        }
      }

      console.log('Sign in completed successfully')
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