"use client"

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { User, Session, SupabaseClient, AuthChangeEvent, AuthError } from '@supabase/supabase-js'
import { enhancedStorage, debugAuthState, checkAuthTokensExist } from './supabase'
import { checkUserRole } from './auth-utils'
import { useToast } from '@/components/ui/use-toast'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Constantes pour optimiser le temps de chargement initial
const MAX_SESSION_RETRIEVAL_ATTEMPTS = 3;
const SESSION_RETRIEVAL_TIMEOUT = 500; // 500ms par tentative

// Define the type for a subscription
type SupabaseAuthSubscription = {
  unsubscribe: () => void;
};

// Define the type for auth state change tracking
type AuthStateChange = {
  subscription: SupabaseAuthSubscription | null;
  timeout: NodeJS.Timeout | null;
  attempts: number;
};

// Define the return type for getInitialSession
type InitialSessionResult = {
  session: Session | null;
  user: User | null;
  error: Error | null;
}

// Type definition for Auth Context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSessionRestoring: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any | null; error: Error | null }>;
  reloadAuthState: () => Promise<void>;
  checkUserRole: (userId: string) => Promise<string | null>;
  ensureUserProfile: (userId: string) => Promise<void>;
}

// Create auth context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSessionRestoring, setIsSessionRestoring] = useState(true)
  const router = useRouter()
  const adminEmails = ['admin@klyra.com', 'tech@klyra.com', 'corentin@klyra.com']
  const { toast } = useToast()
  const authStateChange = useRef<AuthStateChange>({
    subscription: null,
    timeout: null,
    attempts: 0,
  });
  const hasCheckedLocalStorage = useRef<boolean>(false);

  // Fonction sécurisée pour définir l'utilisateur
  const safeSetUser = (newUser: User | null) => {
    try {
      // Protection contre les utilisateurs malformés
      if (newUser !== null && typeof newUser !== 'object') {
        console.error("⚠️ ERREUR: User n'est pas un objet:", typeof newUser)
        return
      }
      
      // Vérifier que l'objet utilisateur a au moins un ID valide
      if (newUser && (!newUser.id || typeof newUser.id !== 'string')) {
        console.error("⚠️ ERREUR: Objet User sans ID valide", newUser)
        return
      }
      
      console.log("👤 Setting user:", newUser?.email || newUser?.id || "null")
      setUser(newUser)
    } catch (error) {
      console.error("⚠️ Erreur lors de setUser:", error)
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

  // Check user role function - version optimisée
  const checkUserRole = async (userId: string): Promise<string | null> => {
    if (!userId) {
      console.error("checkUserRole appelé avec un userId invalide:", userId);
      return null;
    }

    try {
      console.log("Checking user role for:", userId);
      
      // Liste des emails admin connus (hardcoded pour DEV)
      const knownAdminEmails = [
        'corentin@klyra.design',
        'dev@klyra.design',
        'admin@klyra.design',
        'test.admin@example.com'
      ];
      
      // 1. Vérifier en mémoire si on connaît déjà le rôle
      if (user && user.email && knownAdminEmails.includes(user.email.toLowerCase())) {
        console.log("Admin reconnu par email:", user.email);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`user_role_${userId}`, 'admin');
        }
        return 'admin';
      }
      
      // 2. Vérifier si le rôle est déjà en cache dans localStorage
      if (typeof window !== 'undefined') {
        const cachedRole = localStorage.getItem(`user_role_${userId}`);
        if (cachedRole) {
          console.log("Using cached role from localStorage:", cachedRole);
          return cachedRole;
        }
      }
        
      // 3. Vérifier dans les métadonnées de l'utilisateur (plus rapide que d'appeler l'API)
      if (user && user.user_metadata) {
        // Tenter plusieurs chemins possibles dans les métadonnées
        const metadataRole = user.user_metadata.role || 
                            user.user_metadata.custom_claims?.role ||
                            user.app_metadata?.role;
                            
        if (metadataRole) {
          console.log("Role trouvé dans les métadonnées:", metadataRole);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`user_role_${userId}`, metadataRole);
          }
          return metadataRole;
        }
        
        // Si l'email est dans la liste des admins connus, mais pas trouvé dans les métadonnées
        if (user.email && knownAdminEmails.includes(user.email.toLowerCase())) {
          console.log("Admin reconnu par email (fallback):", user.email);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`user_role_${userId}`, 'admin');
          }
          return 'admin';
        }
      }
      
      // 4. Vérifier dans la session si disponible
      if (session?.user?.user_metadata?.role) {
        const metadataRole = session.user.user_metadata.role;
        console.log("Using role from session metadata:", metadataRole);
        // Mettre en cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(`user_role_${userId}`, metadataRole);
        }
        return metadataRole;
      }
      
      // Si on arrive ici, il faut faire un appel API à la table profiles
      // Ajouter une protection timeout
      const fetchRolePromise = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role, email')
            .eq('id', userId)
            .single();
  
          if (error) {
            console.error('Error fetching user role from profiles:', error);
            return null;
          }
  
          // Vérifier si le rôle est défini dans les données
          const role = data?.role || null;
          
          // Si on a un email dans les données et que cet email est celui d'un admin connu
          if (!role && data?.email && knownAdminEmails.includes(data.email.toLowerCase())) {
            console.log("Admin reconnu par email depuis profiles:", data.email);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`user_role_${userId}`, 'admin');
            }
            return 'admin';
          }
          
          console.log("User role data from profiles:", data);
          
          // Sauvegarder le rôle dans localStorage pour les futures vérifications
          if (typeof window !== 'undefined' && role) {
            localStorage.setItem(`user_role_${userId}`, role);
          }
          
          return role;
        } catch (dbError) {
          console.error("Error in fetchRolePromise:", dbError);
          return null;
        }
      };
      
      // Exécuter avec un timeout strict (1 seconde max)
      const role = await Promise.race([
        fetchRolePromise(),
        new Promise<string | null>((resolve) => {
          setTimeout(() => {
            console.log("⏱️ Role check timeout, using fallback logic");
            
            // Vérifier une dernière fois si l'email correspond à un admin connu
            if (user && user.email && knownAdminEmails.includes(user.email.toLowerCase())) {
              console.log("Admin reconnu par email (timeout fallback):", user.email);
              if (typeof window !== 'undefined') {
                localStorage.setItem(`user_role_${userId}`, 'admin');
              }
              resolve('admin');
              return;
            }
            
            // En cas de timeout, présumer un rôle client par défaut
            if (typeof window !== 'undefined') {
              // Mettre en cache temporaire (30 minutes)
              localStorage.setItem(`user_role_${userId}`, 'client');
              localStorage.setItem(`user_role_${userId}_temp`, 'true');
              setTimeout(() => localStorage.removeItem(`user_role_${userId}_temp`), 1800000);
            }
            
            resolve('client');
          }, 1000); // Réduit à 1 seconde pour plus de réactivité
        })
      ]);
      
      return role;
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      
      // Dernier recours: vérifier l'email avant de donner un rôle par défaut
      const knownAdminEmails = [
        'corentin@klyra.design',
        'dev@klyra.design',
        'admin@klyra.design',
        'test.admin@example.com'
      ];
      
      if (user && user.email && knownAdminEmails.includes(user.email.toLowerCase())) {
        console.log("Admin reconnu par email (error fallback):", user.email);
        return 'admin';
      }
      
      // Par défaut, retourner 'client' plutôt que null pour éviter les blocages
      return 'client';
    }
  }

  // Make sure supabase client is actually ready before proceeding
  const waitForSupabase = async (): Promise<void> => {
    // Check for global supabase ready flag first (might be set in lib/supabase.ts)
    if (typeof window !== 'undefined' && (window as any).__SUPABASE_READY === true) {
      console.log("🔥 Supabase client already marked as ready")
      return
    }

    // Wait a bit for Supabase client to initialize
    console.log("⏱️ Waiting for Supabase client to initialize...")
    
    // First check - just a small delay to let client initialize
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Make a simple API call to verify Supabase is ready
    try {
      // Try a simple API call that doesn't require auth
      const { data: healthCheck, error } = await Promise.race([
        supabase.from('categories').select('count', { count: 'exact', head: true }),
        new Promise(resolve => setTimeout(() => resolve({ 
          data: null, 
          error: new Error("Health check timeout") 
        }), 1500))
      ]) as any
      
      if (error && error.message !== "Health check timeout") {
        console.log("⚠️ Supabase health check returned error, but client is responsive:", error.message)
      } else {
        console.log("✅ Supabase health check successful")
      }
      
      // Set global ready flag
      if (typeof window !== 'undefined') {
        (window as any).__SUPABASE_READY = true
      }
      
      return
    } catch (err) {
      console.warn("⚠️ Supabase health check error:", err)
      // Continue anyway - we've at least waited some time
    }
  }

  // Function to get the initial session on mount with enhanced recovery
  const getInitialSession = async (): Promise<{ 
    session: Session | null, 
    user: User | null, 
    error: Error | null 
  }> => {
    // Create auth event listener and promise resolver
    let authListener: SupabaseAuthSubscription | null = null;
    
    try {
      console.log("🚀 Starting session recovery process")
      
      // Create a listener for auth state changes during recovery
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`🔔 Auth event during recovery: ${event}`)
      });
      
      // Store the unsubscribe function if available
      if (data?.subscription && typeof data.subscription === 'object' && 'unsubscribe' in data.subscription) {
        authListener = {
          unsubscribe: () => data.subscription.unsubscribe()
        };
      } else {
        console.log("⚠️ Auth subscription doesn't have an unsubscribe method");
        authListener = {
          unsubscribe: () => { console.log("No-op unsubscribe during initial session recovery"); }
        };
      }
      
      // Log the current auth state
      console.log("Checking auth state")
      
      // Health check: test client connection
      const { data: healthCheckData, error: healthCheckError } = await supabase.from('health_check').select('*').limit(1)
      if (healthCheckError) {
        console.error("❌ Supabase client health check failed:", healthCheckError)
        return { session: null, user: null, error: healthCheckError }
      }
      
      console.log("✅ Supabase client health check passed")
      
      // Try to get current session
      console.log("Attempting to get session...")
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("❌ Failed to get session:", sessionError)
      } else if (sessionData?.session) {
        console.log("✅ Got session success")
        return { 
          session: sessionData.session, 
          user: sessionData.session.user, 
          error: null 
        }
      } else {
        console.log("⚠️ No session found from getSession()")
      }
      
      // If we're here, we didn't get a session from getSession()
      // Try to get the user as fallback
      console.log("Attempting to get user...")
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("❌ Failed to get user:", userError)
      } else if (userData?.user) {
        console.log("✅ Got user success")
        // We have a user but no session, try to refresh the session
        console.log("Attempting to refresh session...")
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error("❌ Failed to refresh session:", refreshError)
          return { session: null, user: userData.user, error: refreshError }
        } else if (refreshData?.session) {
          console.log("✅ Session refresh success")
          return { 
            session: refreshData.session, 
            user: refreshData.session.user || userData.user, 
            error: null 
          }
        } else {
          console.log("⚠️ Refresh didn't return a session, but we still have a user")
          return { session: null, user: userData.user, error: null }
        }
      } else {
        console.log("⚠️ No user found")
      }
      
      // If we reach here, we couldn't get a session or user through standard means
      // Return empty state
      return { session: null, user: null, error: null }
    } catch (error) {
      console.error("❌ Critical error in getInitialSession:", error);
      return { session: null, user: null, error: error as Error };
    } finally {
      // Clean up auth listener if it exists
      if (authListener) {
        console.log("🧹 Cleaning up auth listener from session recovery")
        authListener.unsubscribe()
      }
    }
  }

  // Define the auth state change handler here
  const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
    console.log(`🔔 Auth event: ${event}`, session ? `User: ${session.user?.email}` : "No session")
    
    try {
      if (session) {
        // Vérification supplémentaire pour s'assurer que user est un objet valide
        if (typeof session.user === 'object' && session.user?.id) {
          setSession(session)
          safeSetUser(session.user)
          
          // Mettre à jour le cache utilisateur pour les futures récupérations
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('klyra_cached_user', JSON.stringify(session.user))
              console.log("💾 User cached from auth event:", event)
            }
          } catch (cacheError) {
            console.warn("⚠️ Error caching user from auth event:", cacheError)
          }
          
          // Vérifier en mémoire si c'est un admin connu pour une réponse immédiate
          if (session.user.email && adminEmails.includes(session.user.email.toLowerCase())) {
            console.log("👑 Admin reconnu par email (event):", session.user.email);
            setIsAdmin(true);
          } else {
            // Check if user is admin on auth state change - en parallèle
            const rolePromise = checkUserRole(session.user.id);
            const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
            
            Promise.race([rolePromise, timeout])
              .then(role => {
                console.log("🛡️ Auth event role check:", role);
                setIsAdmin(role === 'admin');
              })
              .catch(error => {
                console.error("Error in auth event role check:", error);
              });
          }
          
          // Update last_sign_in_at in profiles table
          if (event === 'SIGNED_IN') {
            console.log("📝 Updating last sign in timestamp")
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
          console.error("⚠️ ERREUR: session.user n'est pas un objet valide dans onAuthStateChange:", session.user)
          
          // Attempt to recover by directly calling getUser
          try {
            console.log("🛠️ Attempting to recover user from auth event")
            const { data: { user: recoveredUser } } = await Promise.race([
              supabase.auth.getUser(),
              new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: new Error("Recovery timeout") }), 1000))
            ]) as any;
            
            if (recoveredUser && typeof recoveredUser === 'object' && recoveredUser.id) {
              console.log("✅ Recovered user:", recoveredUser.email)
              setSession(session)
              safeSetUser(recoveredUser)
              
              // Mettre à jour le cache utilisateur pour les futures récupérations
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('klyra_cached_user', JSON.stringify(recoveredUser))
                  console.log("💾 Recovered user cached")
                }
              } catch (cacheError) {
                console.warn("⚠️ Error caching recovered user:", cacheError)
              }
              
              // Vérifier en mémoire si c'est un admin connu
              if (recoveredUser.email && adminEmails.includes(recoveredUser.email.toLowerCase())) {
                console.log("👑 Admin reconnu par email (recovery):", recoveredUser.email);
                setIsAdmin(true);
              } else {
                // Check if the recovered user is admin - en parallèle
                Promise.race([
                  checkUserRole(recoveredUser.id),
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
                ]).then(role => {
                  console.log("🛡️ Recovery role check:", role);
                  setIsAdmin(role === 'admin');
                }).catch(error => {
                  console.error("Error in recovery role check:", error);
                });
              }
            } else {
              console.error("⚠️ Recovery failed, invalid user:", recoveredUser)
              setSession(null)
              setUser(null)
              setIsAdmin(false)
              
              // Nettoyer le cache si la récupération échoue
              if (typeof window !== 'undefined') {
                try {
                  localStorage.removeItem('klyra_cached_user')
                  console.log("🧹 Removed invalid cached user data")
                } catch (clearCacheError) {
                  console.warn("⚠️ Error clearing invalid cached user:", clearCacheError)
                }
              }
            }
          } catch (recoveryError) {
            console.error("⚠️ Error in recovery attempt:", recoveryError)
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
        }
      } else {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        
        // Si on reçoit une session null et qu'il y a un SIGNED_OUT event, nettoyer le cache
        if (event === 'SIGNED_OUT' && typeof window !== 'undefined') {
          try {
            localStorage.removeItem('klyra_cached_user')
            console.log("🧹 Removed cached user data on explicit sign out")
          } catch (clearCacheError) {
            console.warn("⚠️ Error clearing cached user on sign out:", clearCacheError)
          }
        }
      }
    } catch (error) {
      console.error("⚠️ Error in auth state change handler:", error)
      setSession(null)
      setUser(null)
      setIsAdmin(false)
    } finally {
      console.log("✅ Setting isLoading to false from auth state change")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("🔧 Setting up auth state listener...")
    
    // Indiquer que la restauration de session commence
    setIsSessionRestoring(true);
    
    // Mettre un timeout de sécurité pour empêcher un loading infini
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ Safety timeout triggered - forcing isLoading to false")
        
        // Forcer une dernière tentative de récupération de l'utilisateur et vérification du rôle
        const emergencyCheck = async () => {
          try {
            console.log("🚨 Running emergency user check");
            // Utiliser Promise.race pour limiter le temps d'attente
            const { data: { user: emergencyUser } } = await Promise.race([
              supabase.auth.getUser(),
              new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: new Error("Emergency timeout") }), 1000))
            ]) as any;
            
            if (emergencyUser && typeof emergencyUser === 'object' && emergencyUser.id) {
              console.log("🚑 Emergency user check successful:", emergencyUser.email)
              safeSetUser(emergencyUser)
              
              // Cache l'utilisateur pour les futures récupérations
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('klyra_cached_user', JSON.stringify(emergencyUser))
                  console.log("💾 Emergency user cached in localStorage")
                }
              } catch (cacheError) {
                console.warn("⚠️ Error caching emergency user:", cacheError)
              }
              
              // Liste des emails admin connus (hardcoded pour DEV) - Copie de checkUserRole pour éviter les dépendances circulaires
              if (emergencyUser.email && adminEmails.includes(emergencyUser.email.toLowerCase())) {
                console.log("👑 Admin reconnu par email (emergency):", emergencyUser.email);
                setIsAdmin(true);
              } else {
                // Tenter une dernière vérification du rôle avec un timout court
                const role = await Promise.race([
                  checkUserRole(emergencyUser.id),
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
                ]);
                
                console.log("🚑 Emergency role check result:", role);
                setIsAdmin(role === 'admin');
              }
            }
          } catch (error) {
            console.error("🚨 Error in emergency user check:", error)
          } finally {
            // Dans tous les cas, forcer la fin du chargement
            setIsLoading(false)
          }
        }
        
        emergencyCheck()
      }
    }, 8000)

    // Set up auth state listener
    let authListener: { unsubscribe?: () => void } = {};
    
    const setupAuthListener = async () => {
      console.log("🔄 Setting up auth state change listener")
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          handleAuthStateChange(event, session);
        });
        
        // Store the unsubscribe function safely
        if (data?.subscription && typeof data.subscription === 'object' && 'unsubscribe' in data.subscription) {
          authListener = { unsubscribe: () => data.subscription.unsubscribe() };
        } else {
          console.warn("⚠️ Auth state change listener doesn't have expected unsubscribe method");
          authListener = { 
            unsubscribe: () => console.log("No-op unsubscribe called") 
          };
        }
      } catch (error) {
        console.error("❌ Error setting up auth listener:", error);
      }
    };

    // Start the auth recovery process
    const initAuth = async () => {
      try {
        console.log("🔄 Initializing authentication state...")
        const { session: initialSession, user: initialUser, error } = await getInitialSession();
        
        if (error) {
          console.error("❌ Error in getInitialSession:", error);
        }
        
        console.log("📊 getInitialSession result:", { 
          hasSession: !!initialSession, 
          hasUser: !!initialUser,
          userEmail: initialUser?.email || 'none'
        });
        
        if (initialUser) {
          safeSetUser(initialUser);
          setSession(initialSession);
          
          // Check if user is admin
          try {
            const role = await checkUserRole(initialUser.id);
            console.log("👑 User role check result:", role);
            setIsAdmin(role === 'admin');
          } catch (roleError) {
            console.error("❌ Error checking user role:", roleError);
          }
          
          // Ensure the user has a profile
          try {
            await ensureUserProfile(initialUser.id);
          } catch (profileError) {
            console.error("❌ Error ensuring user profile:", profileError);
          }
        } else {
          // No user, go to anonymous state
          safeSetUser(null);
          setSession(null);
          setIsAdmin(false);
        }
        
        // Resolve loading state regardless of result
        setIsLoading(false);
        
        // Ajouter un délai avant de désactiver isSessionRestoring pour permettre à l'UI de se mettre à jour
        setTimeout(() => {
          setIsSessionRestoring(false);
          console.log("✅ Session restoration complete, isSessionRestoring set to false");
        }, 1500); // Délai de grâce de 1.5s
      } catch (e) {
        console.error("❌ Fatal error during auth initialization:", e);
        
        // In case of fatal error, set to anonymous state
        safeSetUser(null);
        setSession(null);
        setIsAdmin(false);
        setIsLoading(false);
        setIsSessionRestoring(false);
      }
    };

    // Kick off auth initialization
    setupAuthListener();
    initAuth();

    // Clean up function
    return () => {
      console.log("🧹 Cleaning up auth effect")
      clearTimeout(safetyTimeout)
      // Safely unsubscribe from auth listener if it exists
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe()
      }
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
            role: 'client',
            full_name: fullName
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

  // Reload auth state function - Optimisée
  const reloadAuthState = async (): Promise<void> => {
    console.log("🔄 Manually reloading auth state")
    setIsLoading(true)
    
    // Check if we have any tokens in localStorage
    let hasLocalTokens = false;
    let accessToken = null;
    let refreshToken = null;

    if (typeof window !== 'undefined') {
      // Check various token formats that Supabase might use
      accessToken = localStorage.getItem('supabase.auth.token') || 
                    localStorage.getItem('sb-access-token') || 
                    localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL + '-auth-token');
                      
      refreshToken = localStorage.getItem('supabase.auth.refreshToken') || 
                    localStorage.getItem('sb-refresh-token') || 
                    localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL + '-auth-refresh-token');
        
      hasLocalTokens = !!(accessToken || refreshToken);
      console.log('📝 reloadAuthState tokens check:', hasLocalTokens ? 'Tokens found' : 'No tokens');
    }
    
    // Timeout de sécurité global pour garantir que isLoading passe à false
    const timeoutId = setTimeout(() => {
      console.log("⚠️ reloadAuthState safety timeout triggered")
      setIsLoading(false)
    }, 2500) // Réduit à 2.5 secondes max
    
    // Optimisation: si on a déjà un utilisateur valide, on peut avancer plus vite
    // et juste vérifier son rôle
    if (user && typeof user === 'object' && 'id' in user) {
      console.log("🔍 User already valid, checking role directly");
      try {
        const role = await Promise.race([
          checkUserRole(user.id),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
        ]);
        
        console.log("👤 Quick role check result:", role);
        setIsAdmin(role === 'admin');
        clearTimeout(timeoutId);
        setIsLoading(false);
        return;
      } catch (quickError) {
        console.error("Error in quick role check:", quickError);
        // Continue avec le processus normal en cas d'erreur
      }
    }
    
    // Active session recovery - start with refreshSession
    console.log("🔄 Actively trying to recover session...");
    
    // First try: Direct session refresh
    try {
      const { data, error } = await Promise.race([
        supabase.auth.refreshSession(),
        new Promise((resolve) => setTimeout(() => 
          resolve({ data: null, error: new Error("Refresh session timeout") }), 2000))
      ]) as any;
      
      if (data?.session && data.session.user) {
        console.log('✅ Session refreshed successfully!', data.session.user.email);
        setSession(data.session);
        safeSetUser(data.session.user);
        
        // Check role with a short timeout
        Promise.race([
          checkUserRole(data.session.user.id),
          new Promise<string>((resolve) => setTimeout(() => resolve('client'), 800))
        ]).then(role => {
          console.log("🛡️ Role check for refreshed session:", role);
          setIsAdmin(role === 'admin');
        });
        
        clearTimeout(timeoutId);
        setIsLoading(false);
        return;
      } else if (error) {
        console.warn('⚠️ Session refresh failed:', error.message);
      }
    } catch (refreshErr) {
      console.warn('⚠️ Error during reloadAuthState refresh:', refreshErr);
    }
    
    // Second try: If refresh failed but we have a refresh token, try a manual token refresh
    if (refreshToken) {
      console.log('🔄 Attempting manual token refresh with stored refresh token...');
      try {
        const { data, error } = await Promise.race([
          supabase.auth.refreshSession({ refresh_token: refreshToken }),
          new Promise((resolve) => setTimeout(() => 
            resolve({ data: null, error: new Error("Manual refresh timeout") }), 2000))
        ]) as any;
        
        if (data?.session && data.session.user) {
          console.log('✅ Manual session refresh successful!', data.session.user.email);
          setSession(data.session);
          safeSetUser(data.session.user);
          
          // Check role with a short timeout
          Promise.race([
            checkUserRole(data.session.user.id),
            new Promise<string>((resolve) => setTimeout(() => resolve('client'), 800))
          ]).then(role => {
            console.log("🛡️ Role check for manually refreshed session:", role);
            setIsAdmin(role === 'admin');
          });
          
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        } else if (error) {
          console.warn('⚠️ Manual session refresh failed:', error.message);
        }
      } catch (manualRefreshErr) {
        console.warn('⚠️ Error during manual token refresh:', manualRefreshErr);
      }
    }
    
    // Third try: If we have an access token but no session, try direct getUser
    if (accessToken) {
      console.log('🔄 Attempting to get user directly with stored access token...');
      try {
        const { data, error } = await Promise.race([
          supabase.auth.getUser(),
          new Promise((resolve) => setTimeout(() => 
            resolve({ data: { user: null }, error: new Error("getUser timeout") }), 2000))
        ]) as any;
        
        if (data?.user && typeof data.user === 'object' && data.user.id) {
          console.log('✅ Got user directly:', data.user.email);
          
          // Create a minimal session object
          const minimalSession = {
            user: data.user,
            access_token: accessToken
          } as any;
          
          setSession(minimalSession);
          safeSetUser(data.user);
          
          // Check role with a short timeout
          Promise.race([
            checkUserRole(data.user.id),
            new Promise<string>((resolve) => setTimeout(() => resolve('client'), 800))
          ]).then(role => {
            console.log("🛡️ Role check for direct user:", role);
            setIsAdmin(role === 'admin');
          });
          
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        } else if (error) {
          console.warn('⚠️ getUser failed:', error.message);
        }
      } catch (getUserErr) {
        console.warn('⚠️ Error during getUser:', getUserErr);
      }
    }
    
    // Last resort: full getSession as before with optimizations
    console.log('🔄 All recovery attempts failed, trying standard getSession...');
    
    // Protection contre les promesses qui ne se résolvent jamais
    const reloadPromise = async () => {
      try {
        // Récupération séquentielle pour optimiser: d'abord l'utilisateur, puis la session si nécessaire
        const { data: { user: currentUser }, error: userError } = await Promise.race([
          supabase.auth.getUser(),
          new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: new Error("Timeout") }), 1000))
        ]) as any;
        
        // Log détaillé de la récupération user
        console.log("👤 User retrieval:", currentUser ? `success (${currentUser.email})` : "failed", userError ? `error: ${userError.message}` : "");
        
        if (userError) {
          throw new Error("Failed to get user");
        }
        
        // Si on a récupéré un utilisateur valide, on l'utilise immédiatement
        // et on continue en parallèle
        if (currentUser && typeof currentUser === 'object' && currentUser.id) {
          // Mettre à jour l'utilisateur immédiatement pour débloquer l'UI
          safeSetUser(currentUser);
          
          // Lancer en parallèle la récupération de la session et du rôle
          Promise.all([
            // Récupérer la session
            (async () => {
              try {
                const { data: { session: currentSession }, error: sessionError } = await Promise.race([
                  supabase.auth.getSession(),
                  new Promise(resolve => setTimeout(() => resolve({ data: { session: null }, error: new Error("Session timeout") }), 1000))
                ]) as any;
                
                if (sessionError) {
                  console.error("Session retrieval error:", sessionError);
                  return;
                }
                
                if (currentSession) {
                  setSession(currentSession);
                } else {
                  // If we have a valid user but no session, create a minimal session
                  setSession({ user: currentUser, access_token: accessToken || 'recovered' } as any);
                }
              } catch (sessionError) {
                console.error("Error getting session:", sessionError);
              }
            })(),
            
            // Vérifier le rôle
            (async () => {
              try {
                const role = await Promise.race([
                  checkUserRole(currentUser.id),
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
                ]);
                
                console.log("🛡️ Role check result:", role);
                setIsAdmin(role === 'admin');
              } catch (roleError) {
                console.error("Error checking role:", roleError);
                
                // For known admin emails, set admin role even if check fails
                if (currentUser.email && adminEmails.includes(currentUser.email.toLowerCase())) {
                  console.log("👑 Admin recognized by email during recovery:", currentUser.email);
                  setIsAdmin(true);
                }
              }
            })()
          ]).catch(parallelError => {
            console.error("Error in parallel operations:", parallelError);
          }).finally(() => {
            // S'assurer que isLoading passe à false une fois tout terminé
            console.log("✅ Parallel operations completed");
            clearTimeout(timeoutId);
            setIsLoading(false);
          });
          
          // Retourner rapidement pour débloquer l'interface
          return;
        }
        
        // Si on n'a pas pu récupérer l'utilisateur, récupérer la session
        if (!currentUser) {
          const { data: { session: currentSession }, error: sessionError } = await Promise.race([
            supabase.auth.getSession(),
            new Promise(resolve => setTimeout(() => resolve({ data: { session: null }, error: new Error("Session timeout") }), 1000))
          ]) as any;
          
          if (sessionError) {
            console.error("Session retrieval error:", sessionError);
            throw new Error("Failed to get session");
          }
          
          if (currentSession && currentSession.user) {
            console.log("🔐 Got user from session:", currentSession.user.email);
            setSession(currentSession);
            safeSetUser(currentSession.user);
            
            // Vérifier le rôle avec un timeout court
            try {
              const role = await Promise.race([
                checkUserRole(currentSession.user.id),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
              ]);
              
              console.log("🛡️ Role check from session:", role);
              setIsAdmin(role === 'admin');
            } catch (roleError) {
              console.error("Error checking role from session:", roleError);
              
              // For known admin emails, set admin role even if check fails
              if (currentSession.user.email && adminEmails.includes(currentSession.user.email.toLowerCase())) {
                console.log("👑 Admin recognized by email during session recovery:", currentSession.user.email);
                setIsAdmin(true);
              }
            }
          } else {
            console.log("No user available from any source");
            setUser(null);
            setSession(null);
            setIsAdmin(false);
          }
        }
      } catch (innerError) {
        console.error("Inner error in reloadAuthState:", innerError);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        throw innerError;
      }
    };
    
    try {
      // Exécuter avec un timeout global raccourci
      await Promise.race([
        reloadPromise(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Global reloadAuthState timeout")), 2000))
      ]).catch(err => {
        console.error("Caught in reloadAuthState race:", err);
        // Ne pas propager l'erreur
      });
    } catch (error) {
      console.error("Exception in reloadAuthState:", error);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      // Garantir que isLoading est toujours mis à false, quoi qu'il arrive
      clearTimeout(timeoutId);
      console.log("✅ Setting isLoading to false from reloadAuthState finally block");
      setIsLoading(false);
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
    isSessionRestoring,
    signUp,
    signIn,
    signOut,
    resetPassword,
    reloadAuthState,
    ensureUserProfile,
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