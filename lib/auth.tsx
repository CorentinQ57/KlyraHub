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
  userRole: string | null
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ data: any | null; error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ data: any | null; error: Error | null }>
  checkUserRole: (userId: string) => Promise<string | null>
  reloadAuthState: () => Promise<void>
  resetUserRole: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  // Fonction sécurisée pour définir l'utilisateur
  const safeSetUser = (userData: any) => {
    // Vérifie si userData est un objet valide avec un ID
    if (userData && typeof userData === 'object' && userData.id) {
      console.log("Setting user object:", userData.email);
      setUser(userData);
    } else if (typeof userData === 'string') {
      // Si c'est une chaîne, c'est probablement une erreur
      console.error("ERREUR: Tentative de définir user comme une chaîne:", userData);
      // Ne pas définir l'utilisateur
    } else if (userData === null) {
      // Réinitialisation normale
      setUser(null);
    } else {
      // Autre cas invalide
      console.error("ERREUR: Tentative de définir user avec une valeur invalide:", userData);
      // Ne pas définir l'utilisateur
    }
  }

  // Log d'état pour debugging
  useEffect(() => {
    console.log("Auth state:", { 
      isLoading, 
      user: user?.email, 
      userType: user ? typeof user : 'null',
      userHasId: user && typeof user === 'object' ? Boolean(user.id) : false,
      isAdmin,
      userRole
    })
  }, [isLoading, user, isAdmin, userRole])

  // Check user role function - version améliorée et sans cache
  const checkUserRole = async (userId: string): Promise<string | null> => {
    if (!userId) {
      console.error("checkUserRole appelé avec un userId invalide:", userId);
      return "client"; // Valeur par défaut en cas d'identifiant invalide
    }

    try {
      console.log("Checking user role for:", userId)
      
      // Désactivation temporaire du cache pour diagnostiquer le problème
      // if (user && user.id === userId && userRole) {
      //   console.log("Using cached role:", userRole)
      //   return userRole
      // }
      
      // Timeout plus court (1.5 secondes au lieu de 2)
      const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          console.log("Role check timed out - using default client role")
          resolve("client") // Toujours retourner un rôle par défaut en cas de timeout
        }, 1500)
      })
      
      // Requête à Supabase simplifiée
      const rolePromise = new Promise<string>(async (resolve) => {
        try {
          console.log("Début de la requête à Supabase pour vérifier le rôle")
          
          // Requête détaillée avec plus de logs
          console.log("Exécution de la requête profiles.select().eq('id', userId)")
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')  // Sélectionner toutes les colonnes pour déboguer
            .eq('id', userId)
            .single()

          console.log("Réponse complète de Supabase:", { data, error })

          if (error) {
            console.error('Error fetching user role:', error)
            resolve("client") // Valeur par défaut en cas d'erreur
            return
          }

          if (!data) {
            console.warn("Aucune donnée retournée pour l'utilisateur:", userId)
            resolve("client")
            return
          }

          console.log("Profil complet trouvé dans la base de données:", data)
          console.log("Rôle trouvé:", data.role)
          
          // Forcer le rôle "admin" pour déboguer si le profil existe
          // et si nous sommes sur l'utilisateur corentin@klyra.design
          if (data.email === "corentin@klyra.design") {
            console.log("Utilisateur administrateur détecté, forçage du rôle admin")
            resolve("admin")
            return
          }
          
          resolve(data?.role || "client") // Toujours retourner un rôle, même si null
        } catch (error) {
          console.error('Exception complète dans rolePromise:', error)
          resolve("client") // Valeur par défaut en cas d'exception
        }
      })
      
      // Utilisation de Promise.race pour implémenter un timeout
      const role = await Promise.race([rolePromise, timeoutPromise])
      
      // Log plus détaillé
      console.log(`Role check result for ${userId}: ${role || 'default: client'}`)
      
      return role
    } catch (error) {
      console.error('Error in checkUserRole:', error)
      return "client" // Valeur par défaut en cas d'erreur générale
    }
  }

  // Get initial session and set up auth state listener
  const getInitialSession = async () => {
    try {
      console.log("Getting initial session...")
      setIsLoading(true)

      // Check for active session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        setIsLoading(false)
        return
      }

      console.log("Initial session result:", session ? "Session found" : "No session")

      if (session) {
        console.log("Session user:", session.user?.email, "Type:", typeof session.user)
        
        // Si session.user existe mais n'est pas un objet valide, essayer de récupérer directement l'utilisateur
        if (!session.user || typeof session.user !== 'object' || !session.user.id) {
          console.log("Session user invalid, forcing getUser call")
          try {
            // Forcer la récupération directe de l'utilisateur
            const { data: { user: directUser }, error: userError } = await supabase.auth.getUser()
            
            if (userError) {
              console.error("Error forcing getUser:", userError)
              setSession(null)
              setUser(null)
              setIsAdmin(false)
              setUserRole(null)
              return
            }
            
            console.log("Direct getUser result:", directUser)
            
            if (directUser && typeof directUser === 'object' && directUser.id) {
              setSession(session)
              safeSetUser(directUser)
              
              // Solution temporaire: hardcode le rôle admin pour l'email corentin@klyra.design
              if (directUser.email === "corentin@klyra.design") {
                console.log("Utilisateur administrateur reconnu, attribution directe du rôle admin")
                setUserRole("admin")
                setIsAdmin(true)
              } else {
                // Check user role avec gestion de la valeur de retour
                const role = await checkUserRole(directUser.id)
                setUserRole(role)
                setIsAdmin(role === 'admin')
              }
            } else {
              console.error("Direct getUser also failed, user is invalid:", directUser)
              setSession(null)
              setUser(null)
              setIsAdmin(false)
              setUserRole(null)
            }
          } catch (userError) {
            console.error("Exception in direct getUser:", userError)
            setSession(null)
            setUser(null)
            setIsAdmin(false)
            setUserRole(null)
          }
        } else {
          // Session user is valid
          setSession(session)
          safeSetUser(session.user)
          
          // Solution temporaire: hardcode le rôle admin pour l'email corentin@klyra.design
          if (session.user.email === "corentin@klyra.design") {
            console.log("Utilisateur administrateur reconnu, attribution directe du rôle admin")
            setUserRole("admin")
            setIsAdmin(true)
          } else {
            // Check user role et définir les deux états (isAdmin et userRole)
            const role = await checkUserRole(session.user.id)
            setUserRole(role)
            setIsAdmin(role === 'admin')
          }
        }
      } else {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setUserRole(null)
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error)
    } finally {
      console.log("Setting isLoading to false from getInitialSession")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("Setting up auth state listener...")
    
    // Initialiser la session une seule fois avec une période plus courte
    const initPromise = getInitialSession()
    
    // Mettre un timeout de sécurité pour empêcher un loading infini
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ Safety timeout triggered - forcing isLoading to false")
        
        // Si l'utilisateur est déjà défini, on peut utiliser ces informations
        if (user && typeof user === 'object' && user.id) {
          console.log("User already defined, using existing data:", user.email)
          // On garde l'utilisateur mais on force la fin du chargement
          setIsLoading(false)
          return
        }
        
        // Forcer une dernière tentative de récupération de l'utilisateur et vérification du rôle
        const emergencyCheck = async () => {
          try {
            const { data: { user: emergencyUser } } = await supabase.auth.getUser()
            
            if (emergencyUser && typeof emergencyUser === 'object' && emergencyUser.id) {
              console.log("Emergency user check successful:", emergencyUser.email)
              safeSetUser(emergencyUser)
              
              // Définir un rôle par défaut en cas d'urgence pour éviter le blocage
              // En utilisant une variable string au lieu d'une chaîne littérale pour éviter l'erreur de type
              const defaultRole = "client"
              console.log("Emergency role check - using default:", defaultRole)
              setUserRole(defaultRole)
              setIsAdmin(false) // Dans ce cas d'urgence, on sait que le rôle est 'client', donc isAdmin est false
            }
          } catch (error) {
            console.error("Error in emergency user check:", error)
          } finally {
            // Dans tous les cas, forcer la fin du chargement
            setIsLoading(false)
          }
        }
        
        emergencyCheck()
      }
    }, 1500) // 1.5 secondes maximum de loading (réduit de 2 à 1.5 secondes)

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`, session ? `User: ${session.user?.email}` : "No session")
        
        // Si c'est juste un TOKEN_REFRESHED, ne pas refaire la vérification complète
        if (event === 'TOKEN_REFRESHED' && user && session && session.user.id === user.id) {
          console.log("Token refreshed, keeping existing user state")
          setSession(session)
          return
        }
        
        try {
          if (session) {
            // Vérification supplémentaire pour s'assurer que user est un objet valide
            if (typeof session.user === 'object' && session.user?.id) {
              setSession(session)
              safeSetUser(session.user)
              
              // Solution temporaire: hardcode le rôle admin pour l'email corentin@klyra.design
              if (session.user.email === "corentin@klyra.design") {
                console.log("Auth event: Utilisateur administrateur reconnu, attribution directe du rôle admin")
                setUserRole("admin")
                setIsAdmin(true)
              } else {
                // Check user role et définir les deux états (isAdmin et userRole)
                const role = await checkUserRole(session.user.id)
                setUserRole(role)
                setIsAdmin(role === 'admin')
              }
              
              // Update last_sign_in_at in profiles table
              if (event === 'SIGNED_IN') {
                console.log("Updating last sign in timestamp")
                try {
                  await supabase
                    .from('profiles')
                    .update({ last_sign_in_at: new Date().toISOString() })
                    .eq('id', session.user.id)
                } catch (updateError) {
                  console.error('Error updating last sign in time:', updateError)
                  // Non-critical error, continue execution
                }
                
                // Forcer la récupération de l'utilisateur après SIGNED_IN pour s'assurer d'avoir les dernières données
                console.log("Forcing getUser after SIGNED_IN")
                try {
                  const { data: { user: updatedUser }, error: userError } = await supabase.auth.getUser()
                  if (!userError && updatedUser) {
                    console.log("Updated user after SIGNED_IN:", updatedUser.email)
                    safeSetUser(updatedUser)
                  }
                } catch (userError) {
                  console.error("Error getting updated user after SIGNED_IN:", userError)
                }
              }
            } else {
              console.error("ERREUR: session.user n'est pas un objet valide dans onAuthStateChange:", session.user)
              
              // Attempt to recover by directly calling getUser
              try {
                console.log("Attempting to recover user from auth event")
                const { data: { user: recoveredUser } } = await supabase.auth.getUser()
                
                if (recoveredUser && typeof recoveredUser === 'object' && recoveredUser.id) {
                  console.log("Recovered user:", recoveredUser.email)
                  setSession(session)
                  safeSetUser(recoveredUser)
                  
                  // Solution temporaire: hardcode le rôle admin pour l'email corentin@klyra.design
                  if (recoveredUser.email === "corentin@klyra.design") {
                    console.log("Recovery: Utilisateur administrateur reconnu, attribution directe du rôle admin")
                    setUserRole("admin")
                    setIsAdmin(true)
                  } else {
                    // Check user role et définir les deux états (isAdmin et userRole)
                    const role = await checkUserRole(recoveredUser.id)
                    setUserRole(role)
                    setIsAdmin(role === 'admin')
                  }
                } else {
                  console.error("Recovery failed, invalid user:", recoveredUser)
                  setSession(null)
                  setUser(null)
                  setIsAdmin(false)
                  setUserRole(null)
                }
              } catch (recoveryError) {
                console.error("Error in recovery attempt:", recoveryError)
                setSession(null)
                setUser(null)
                setIsAdmin(false)
                setUserRole(null)
              }
            }
          } else {
            setSession(null)
            setUser(null)
            setIsAdmin(false)
            setUserRole(null)
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error)
          setSession(null)
          setUser(null)
          setIsAdmin(false)
          setUserRole(null)
        } finally {
          console.log("Setting isLoading to false from auth state change")
          setIsLoading(false)
        }
      }
    )

    // Cleanup subscription and timeout on unmount
    return () => {
      console.log("Cleanup: unsubscribing from auth changes")
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
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
      if (data?.user) {
        // Vérification supplémentaire pour s'assurer que user est un objet valide
        if (typeof data.user === 'object' && data.user.id) {
          console.log("SignIn success, setting user:", data.user.email)
          setSession(data.session)
          safeSetUser(data.user)
          
          // Solution temporaire: hardcode le rôle admin pour l'email corentin@klyra.design
          if (data.user.email === "corentin@klyra.design") {
            console.log("SignIn: Utilisateur administrateur reconnu, attribution directe du rôle admin")
            setUserRole("admin")
            setIsAdmin(true)
          } else {
            // Check user role et définir les deux états (isAdmin et userRole)
            const role = await checkUserRole(data.user.id)
            setUserRole(role)
            setIsAdmin(role === 'admin')
          }
          
          // Update last_sign_in_at in profiles table
          try {
            await supabase
              .from('profiles')
              .update({ last_sign_in_at: new Date().toISOString() })
              .eq('id', data.user.id)
          } catch (updateError) {
            console.error('Error updating last sign in time:', updateError)
            // Non-critical error, don't return it
          }
        } else {
          console.error("ERREUR: data.user n'est pas un objet valide dans signIn:", data.user)
        }
      } else {
        console.error("No user data returned from signInWithPassword")
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
      console.log("Signing out user")
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setUserRole(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      console.log("Requesting password reset for:", email)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      return { data, error }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { data: null, error: error as Error }
    }
  }

  // Reload auth state function
  const reloadAuthState = async (): Promise<void> => {
    try {
      console.log("Manually reloading auth state")
      setIsLoading(true)
      
      // Timeout de sécurité pour éviter que reloadAuthState ne reste bloqué
      const timeoutId = setTimeout(() => {
        console.log("reloadAuthState safety timeout triggered")
        setIsLoading(false)
      }, 2000) // Réduit à 2 secondes maximum
      
      // Forcer la déconnexion/reconnexion du client Supabase
      await supabase.auth.refreshSession()
      
      // Get current user and session
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (userError || sessionError) {
        console.error("Error reloading auth state:", userError || sessionError)
        setUser(null)
        setSession(null)
        setIsAdmin(false)
        setUserRole(null)
        clearTimeout(timeoutId)
        setIsLoading(false)
        return
      }
      
      if (currentUser && currentSession) {
        console.log("Auth reloaded successfully:", currentUser.email)
        // Utiliser la fonction sécurisée pour définir l'utilisateur
        safeSetUser(currentUser)
        setSession(currentSession)
        
        // Définir directement un rôle par défaut
        const defaultRole = "client"
        
        // Check user role avec un timeout très court
        try {
          const role = await Promise.race([
            checkUserRole(currentUser.id),
            new Promise<string>((resolve) => setTimeout(() => resolve(defaultRole), 1000))
          ])
          
          console.log("Role check in reloadAuthState:", role)
          setUserRole(role)
          setIsAdmin(role === 'admin')
        } catch (roleError) {
          console.error("Error checking role in reloadAuthState:", roleError)
          // En cas d'erreur, définir des valeurs par défaut
          setUserRole(defaultRole)
          setIsAdmin(false)
        }
      } else {
        console.log("No active user session found during reload")
        setUser(null)
        setSession(null)
        setIsAdmin(false)
        setUserRole(null)
      }
      
      clearTimeout(timeoutId)
    } catch (error) {
      console.error("Exception in reloadAuthState:", error)
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setUserRole(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset user role function
  const resetUserRole = async (userId: string): Promise<void> => {
    try {
      console.log("Resetting user role for:", userId)
      const role = await checkUserRole(userId)
      setUserRole(role)
      setIsAdmin(role === 'admin')
    } catch (error) {
      console.error("Error resetting user role:", error)
    }
  }

  // Create context value
  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    userRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
    checkUserRole,
    reloadAuthState,
    resetUserRole,
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