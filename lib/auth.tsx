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
  reloadAuthState: () => Promise<void>
  ensureUserProfile: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
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
      isAdmin 
    })
  }, [isLoading, user, isAdmin])

  // Check user role function
  const checkUserRole = async (userId: string): Promise<string | null> => {
    if (!userId) {
      console.error("checkUserRole appelé avec un userId invalide:", userId);
      return null;
    }

    try {
      console.log("Checking user role for:", userId);
      
      // Vérifier si le rôle est déjà en cache dans localStorage
      if (typeof window !== 'undefined') {
        const cachedRole = localStorage.getItem(`user_role_${userId}`);
        if (cachedRole) {
          console.log("Using cached role from localStorage:", cachedRole);
          return cachedRole;
        }
        
        // Vérifier dans la session si disponible
        if (session?.user?.user_metadata?.role) {
          const metadataRole = session.user.user_metadata.role;
          console.log("Using role from session metadata:", metadataRole);
          // Mettre en cache
          localStorage.setItem(`user_role_${userId}`, metadataRole);
          return metadataRole;
        }
      }
      
      // Si on arrive ici, il faut faire un appel API
      // Ajouter une protection timeout
      const fetchRolePromise = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          return null;
        }

        const role = data?.role || null;
        console.log("User role data:", data);
        
        // Sauvegarder le rôle dans localStorage pour les futures vérifications
        if (typeof window !== 'undefined' && role) {
          localStorage.setItem(`user_role_${userId}`, role);
        }
        
        return role;
      };
      
      // Exécuter avec un timeout
      const role = await Promise.race([
        fetchRolePromise(),
        new Promise<string | null>((resolve) => {
          setTimeout(() => {
            console.log("Role check timeout, using default 'client' role");
            // En cas de timeout, présumer un rôle client par défaut
            if (typeof window !== 'undefined') {
              // Mettre en cache temporaire (1 heure)
              localStorage.setItem(`user_role_${userId}`, 'client');
              localStorage.setItem(`user_role_${userId}_temp`, 'true');
              setTimeout(() => localStorage.removeItem(`user_role_${userId}_temp`), 3600000);
            }
            resolve('client');
          }, 1500);
        })
      ]);
      
      return role;
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      // Par défaut, retourner 'client' plutôt que null pour éviter les blocages
      return 'client';
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
              return
            }
            
            console.log("Direct getUser result:", directUser)
            
            if (directUser && typeof directUser === 'object' && directUser.id) {
              setSession(session)
              safeSetUser(directUser)
              
              // Check if user is admin
              const role = await checkUserRole(directUser.id)
              setIsAdmin(role === 'admin')
            } else {
              console.error("Direct getUser also failed, user is invalid:", directUser)
              setSession(null)
              setUser(null)
              setIsAdmin(false)
            }
          } catch (userError) {
            console.error("Exception in direct getUser:", userError)
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
        } else {
          // Session user is valid
          setSession(session)
          safeSetUser(session.user)
          
          // Check if user is admin
          const role = await checkUserRole(session.user.id)
          setIsAdmin(role === 'admin')
        }
      } else {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
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
    
    // Mettre un timeout de sécurité pour empêcher un loading infini
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ Safety timeout triggered - forcing isLoading to false")
        
        // Forcer une dernière tentative de récupération de l'utilisateur et vérification du rôle
        const emergencyCheck = async () => {
          try {
            const { data: { user: emergencyUser } } = await supabase.auth.getUser()
            
            if (emergencyUser && typeof emergencyUser === 'object' && emergencyUser.id) {
              console.log("Emergency user check successful:", emergencyUser.email)
              safeSetUser(emergencyUser)
              
              // Tenter une dernière vérification du rôle avec un timout court
              const role = await Promise.race([
                checkUserRole(emergencyUser.id),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
              ])
              
              console.log("Emergency role check result:", role)
              setIsAdmin(role === 'admin')
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
    }, 3000) // 3 secondes maximum de loading (réduit de 5 à 3 secondes)
    
    // Exécuter getInitialSession avec une protection timeout
    const initSession = async () => {
      try {
        await Promise.race([
          getInitialSession(),
          new Promise((_, reject) => 
            setTimeout(() => {
              console.log("getInitialSession timeout reached")
              // Plutôt que de rejeter, on force juste isLoading à false
              setIsLoading(false)
              // On résout pour éviter une erreur non gérée
              return null
            }, 2500)
          )
        ])
      } catch (error) {
        console.error("Error in initSession:", error)
        // Garantir que isLoading est mis à false même en cas d'erreur
        setIsLoading(false)
      }
    }
    
    initSession()

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`, session ? `User: ${session.user?.email}` : "No session")
        
        try {
          if (session) {
            // Vérification supplémentaire pour s'assurer que user est un objet valide
            if (typeof session.user === 'object' && session.user?.id) {
              setSession(session)
              safeSetUser(session.user)
              
              // Check if user is admin on auth state change
              const role = await checkUserRole(session.user.id)
              setIsAdmin(role === 'admin')
              
              // Update last_sign_in_at in profiles table
              if (event === 'SIGNED_IN') {
                console.log("Updating last sign in timestamp")
                try {
                  // Assurer qu'un profil existe avant de tenter de le mettre à jour
                  await ensureUserProfile(session.user.id);
                  
                  // Mise à jour du timestamp de dernière connexion
                  await supabase
                    .from('profiles')
                    .update({ last_sign_in_at: new Date().toISOString() })
                    .eq('id', session.user.id)
                } catch (updateError) {
                  console.error('Error updating last sign in time:', updateError)
                  // Non-critical error, continue execution
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
                  
                  // Check if the recovered user is admin
                  const role = await checkUserRole(recoveredUser.id)
                  setIsAdmin(role === 'admin')
                } else {
                  console.error("Recovery failed, invalid user:", recoveredUser)
                  setSession(null)
                  setUser(null)
                  setIsAdmin(false)
                }
              } catch (recoveryError) {
                console.error("Error in recovery attempt:", recoveryError)
                setSession(null)
                setUser(null)
                setIsAdmin(false)
              }
            }
          } else {
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error)
          setSession(null)
          setUser(null)
          setIsAdmin(false)
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
          
          // Check user role
          const role = await checkUserRole(data.user.id)
          setIsAdmin(role === 'admin')
          
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
      }, 3000) // 3 secondes maximum
      
      // Protection contre les promesses qui ne se résolvent jamais
      const reloadPromise = async () => {
        try {
          // Forcer la déconnexion/reconnexion du client Supabase
          await Promise.race([
            supabase.auth.refreshSession(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Refresh session timeout")), 2000))
          ])
          
          // Get current user and session avec timeout
          const getUserPromise = supabase.auth.getUser();
          const getSessionPromise = supabase.auth.getSession();
          
          const [userResult, sessionResult] = await Promise.all([
            Promise.race([getUserPromise, new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: new Error("Timeout") }), 2000))]),
            Promise.race([getSessionPromise, new Promise(resolve => setTimeout(() => resolve({ data: { session: null }, error: new Error("Timeout") }), 2000))])
          ]);
          
          const { data: { user: currentUser }, error: userError } = userResult as any;
          const { data: { session: currentSession }, error: sessionError } = sessionResult as any;
          
          if (userError || sessionError) {
            console.error("Error reloading auth state:", userError || sessionError)
            throw new Error("Failed to get user or session")
          }
          
          if (currentUser && currentSession) {
            console.log("Auth reloaded successfully:", currentUser.email)
            // Utiliser la fonction sécurisée pour définir l'utilisateur
            safeSetUser(currentUser)
            setSession(currentSession)
            
            // Check if user is admin avec un timeout plus strict
            try {
              const roleCheckPromise = checkUserRole(currentUser.id)
              const roleTimeout = new Promise<null>((resolve) => 
                setTimeout(() => resolve(null), 1500) // Réduit à 1.5 secondes
              )
              
              const role = await Promise.race([roleCheckPromise, roleTimeout])
              console.log("Role check in reloadAuthState:", role)
              setIsAdmin(role === 'admin')
            } catch (roleError) {
              console.error("Error checking role in reloadAuthState:", roleError)
              // Par défaut, ne pas modifier le statut admin en cas d'erreur
            }
          } else {
            console.log("No active user session found during reload")
            setUser(null)
            setSession(null)
            setIsAdmin(false)
          }
        } catch (innerError) {
          console.error("Inner error in reloadAuthState:", innerError)
          throw innerError
        }
      }
      
      // Exécuter avec un timeout global
      await Promise.race([
        reloadPromise(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Global reloadAuthState timeout")), 2500))
      ]).catch(err => {
        console.error("Caught in reloadAuthState race:", err)
        // Ne pas propager l'erreur
      })
      
      clearTimeout(timeoutId)
    } catch (error) {
      console.error("Exception in reloadAuthState:", error)
      setUser(null)
      setSession(null)
      setIsAdmin(false)
    } finally {
      // Garantir que isLoading est toujours mis à false, quoi qu'il arrive
      console.log("Setting isLoading to false from reloadAuthState finally block")
      setIsLoading(false)
    }
  }

  // Fonction pour s'assurer qu'un profil existe pour l'utilisateur
  const ensureUserProfile = async (userId: string) => {
    try {
      if (!userId) {
        console.error("Invalid user ID provided to ensureUserProfile");
        return;
      }
      
      console.log(`Ensuring profile exists for user: ${userId}`);
      
      // Vérifier si le profil existe
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      // Si le profil n'existe pas ou il y a une erreur, tenter de le créer
      if (error || !data) {
        console.log('Profile not found or error, attempting to create one for user:', userId);
        
        // Récupérer les informations utilisateur
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData && userData.user) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: userData.user.user_metadata?.full_name || '',
              email: userData.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Successfully created profile for user:', userId);
          }
        } else {
          console.error('No user data available to create profile');
        }
      } else {
        console.log('Profile already exists for user:', userId);
      }
    } catch (err) {
      console.error('Exception in ensureUserProfile:', err);
    }
  };

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
    reloadAuthState,
    ensureUserProfile,
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