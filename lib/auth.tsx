"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { enforceTokenStorage } from '@/lib/supabase'

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
      }
      
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
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      return null;
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
    
    getInitialSession()

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
      
      // Nettoyer d'abord les jetons existants pour éviter les conflits
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
      
      // Cookies
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Réinitialiser l'état de Supabase au cas où
      await supabase.auth.signOut({ scope: 'local' });
      
      // Attendre 100ms pour s'assurer que tout est nettoyé
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
          
          // Forcer explicitement la persistance du token
          if (data.session?.access_token) {
            console.log("Persisting authentication tokens explicitly");
            
            // Stocker le nouveau jeton dans plusieurs emplacements
            localStorage.setItem('sb-access-token', data.session.access_token);
            localStorage.setItem('supabase.auth.token', data.session.access_token);
            localStorage.setItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`, data.session.access_token);
            
            // Stocker aussi le refresh token si disponible
            if (data.session.refresh_token) {
              localStorage.setItem('sb-refresh-token', data.session.refresh_token);
            }
            
            // Cookie avec diverses options pour maximiser la compatibilité
            const secure = window.location.protocol === 'https:';
            const domain = window.location.hostname;
            const oneWeek = 7 * 24 * 60 * 60; // 7 jours en secondes
            
            // Cookie avec domaine spécifique
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}; Domain=${domain}`;
            
            // Cookie sans domaine spécifique (pour localhost)
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}`;
            
            // Si refresh token disponible, aussi le stocker dans un cookie
            if (data.session.refresh_token) {
              document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}; Domain=${domain}`;
              document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}`;
            }
            
            localStorage.setItem('sb-token-last-refresh', Date.now().toString());
            
            // Attendre un délai plus long pour s'assurer que tout est correctement enregistré
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Vérifier que le token est bien persisté
            const storedToken = localStorage.getItem('sb-access-token');
            if (!storedToken) {
              console.error("⚠️ Token not persisted in localStorage after explicit attempt");
              
              // Dernier essai avec localStorage direct
              try {
                window.localStorage.setItem('sb-access-token', data.session.access_token);
                console.log("Direct localStorage access successful");
              } catch (storageError) {
                console.error("⚠️ Direct localStorage access failed:", storageError);
              }
            } else {
              console.log("✅ Token successfully persisted in localStorage");
            }
            
            // Vérifier que la session est bien active
            try {
              const { data: sessionCheck } = await supabase.auth.getSession();
              if (sessionCheck?.session) {
                console.log("✅ Session check successful after login");
              } else {
                console.error("⚠️ Session check failed after login - attempting recovery");
                // Essayer de récupérer la session en la définissant manuellement
                await supabase.auth.setSession({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token || ''
                });
              }
            } catch (sessionCheckError) {
              console.error("⚠️ Error checking session after login:", sessionCheckError);
            }
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
      
      // Timeout de sécurité plus long avec annulation propre
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          console.log("reloadAuthState safety timeout triggered")
          reject(new Error('Auth state reload timeout'));
        }, 10000); // 10 secondes
        
        // Stocker l'ID du timeout pour pouvoir l'annuler
        return () => clearTimeout(id);
      });
      
      // Vérifier si nous avons des tokens valides
      const accessToken = localStorage.getItem('sb-access-token');
      const refreshToken = localStorage.getItem('sb-refresh-token');
      
      if (!accessToken && !refreshToken) {
        console.log("No valid tokens found, clearing auth state");
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Utiliser la nouvelle fonction refreshSession pour rafraîchir le token
      try {
        // Importer la fonction depuis lib/supabase
        const { refreshSession } = await import('@/lib/supabase');
        const refreshed = await refreshSession();
        
        if (!refreshed) {
          console.log("Token refresh failed, falling back to enforceTokenStorage");
          // Fallback à l'ancienne méthode
          const tokenUpdated = enforceTokenStorage();
          if (!tokenUpdated) {
            console.log("No valid token found, clearing auth state");
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            setIsLoading(false);
            return;
          }
        }
      } catch (refreshError) {
        console.error("Error refreshing session:", refreshError);
      }
      
      // Rafraîchir la session avec timeout
      try {
        await Promise.race([
          supabase.auth.refreshSession(),
          timeoutPromise
        ]);
      } catch (error: any) {
        if (error?.message === 'Auth state reload timeout') {
          console.error("Session refresh timed out");
          throw error;
        }
      }
      
      // Récupérer l'état actuel
      const [
        { data: { user: currentUser }, error: userError },
        { data: { session: currentSession }, error: sessionError }
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession()
      ]);
      
      if (userError || sessionError) {
        console.error("Error reloading auth state:", userError || sessionError);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        return;
      }
      
      if (currentUser && currentSession) {
        console.log("Auth reloaded successfully:", currentUser.email);
        safeSetUser(currentUser);
        setSession(currentSession);
        
        // Vérifier le rôle avec timeout
        try {
          const rolePromise = checkUserRole(currentUser.id);
          const role = await Promise.race([rolePromise, timeoutPromise]);
          setIsAdmin(role === 'admin');
        } catch (error) {
          console.error("Role check timed out or failed:", error);
          // Ne pas modifier le statut admin en cas d'erreur
        }
      } else {
        console.log("No active user session found during reload");
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Exception in reloadAuthState:", error);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
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