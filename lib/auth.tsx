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

  // Get initial session and set up auth state listener - Optimisé
  const getInitialSession = async () => {
    try {
      console.log("🚀 Getting initial session...")
      setIsLoading(true)

      // Vérifier s'il y a déjà un utilisateur en mémoire (cas refresh page)
      if (user && typeof user === 'object' && user.id) {
        console.log("🧠 User already in memory, skipping session check:", user.email);
        // On a déjà un utilisateur valide, on peut raccourcir le processus
        const role = await Promise.race([
          checkUserRole(user.id),
          new Promise<string>((resolve) => setTimeout(() => resolve('client'), 800))
        ]);
        console.log("🛡️ Role check for cached user:", role);
        setIsAdmin(role === 'admin');
        // Marquer comme chargé
        setIsLoading(false);
        return;
      }
      
      // Check for active session with timeout
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeout = new Promise((resolve) => 
        setTimeout(() => resolve({ data: { session: null }, error: new Error("Session check timeout") }), 1500)
      );

      const { data: { session }, error } = await Promise.race([sessionPromise, sessionTimeout]) as any;
      
      if (error) {
        console.error('⚠️ Error getting session:', error)
        setIsLoading(false)
        return
      }

      console.log("🔐 Initial session result:", session ? `Session found (${session.user?.email})` : "No session")

      if (session) {
        console.log("👤 Session user:", session.user?.email, "Type:", typeof session.user)
        
        // Si session.user existe mais n'est pas un objet valide, essayer de récupérer directement l'utilisateur
        if (!session.user || typeof session.user !== 'object' || !session.user.id) {
          console.log("⚠️ Session user invalid, forcing getUser call")
          try {
            // Utiliser Promise.race pour limiter le temps d'attente
            const getUserPromise = supabase.auth.getUser();
            const getUserTimeout = new Promise((resolve) => 
              setTimeout(() => resolve({ data: { user: null }, error: new Error("getUser timeout") }), 1000)
            );
            
            // Forcer la récupération directe de l'utilisateur
            const { data: { user: directUser }, error: userError } = await Promise.race([getUserPromise, getUserTimeout]) as any;
            
            if (userError) {
              console.error("⚠️ Error forcing getUser:", userError)
              setSession(null)
              setUser(null)
              setIsAdmin(false)
              setIsLoading(false)
              return
            }
            
            console.log("🔍 Direct getUser result:", directUser?.email || "No user")
            
            if (directUser && typeof directUser === 'object' && directUser.id) {
              setSession(session)
              safeSetUser(directUser)
              
              // Vérifier le rôle en parallèle et débloquer l'UI rapidement
              Promise.race([
                checkUserRole(directUser.id),
                new Promise<string>((resolve) => setTimeout(() => resolve('client'), 800))
              ]).then(role => {
                console.log("🛡️ Role check result for direct user:", role);
                setIsAdmin(role === 'admin');
              }).catch(roleError => {
                console.error("Error checking role for direct user:", roleError);
              });
              
              // Considérer comme chargé même si la vérification du rôle est encore en cours
              setIsLoading(false)
            } else {
              console.error("⚠️ Direct getUser also failed, user is invalid:", directUser)
              setSession(null)
              setUser(null)
              setIsAdmin(false)
              setIsLoading(false)
            }
          } catch (userError) {
            console.error("⚠️ Exception in direct getUser:", userError)
            setSession(null)
            setUser(null)
            setIsAdmin(false)
            setIsLoading(false)
          }
        } else {
          // Session user is valid
          console.log("✅ Session user is valid:", session.user.email);
          setSession(session)
          safeSetUser(session.user)
          
          // Check if user is admin - Mais ne pas bloquer l'interface
          Promise.race([
            checkUserRole(session.user.id),
            new Promise<string>((resolve) => setTimeout(() => resolve('client'), 800))
          ]).then(role => {
            console.log("🛡️ Role check result for session user:", role);
            setIsAdmin(role === 'admin');
          }).catch(roleError => {
            console.error("Error checking role for session user:", roleError);
          });
          
          // Considérer comme chargé même si la vérification du rôle est encore en cours
          setIsLoading(false)
        }
      } else {
        console.log("❌ No session found, clearing auth state");
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('⚠️ Error in getInitialSession:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("🔧 Setting up auth state listener...")
    
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
              
              // Liste des emails admin connus (hardcoded pour DEV) - Copie de checkUserRole pour éviter les dépendances circulaires
              const knownAdminEmails = [
                'corentin@klyra.design',
                'dev@klyra.design',
                'admin@klyra.design',
                'test.admin@example.com'
              ];
              
              // Vérifier directement si l'email correspond à un admin connu
              if (emergencyUser.email && knownAdminEmails.includes(emergencyUser.email.toLowerCase())) {
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
    }, 2500) // 2.5 secondes maximum de loading
    
    // Exécuter getInitialSession avec une protection timeout
    const initSession = async () => {
      try {
        await Promise.race([
          getInitialSession(),
          new Promise((_, reject) => 
            setTimeout(() => {
              console.log("⏱️ getInitialSession timeout reached")
              // Plutôt que de rejeter, on force juste isLoading à false
              setIsLoading(false)
              // On résout pour éviter une erreur non gérée
              return null
            }, 2000)
          )
        ])
      } catch (error) {
        console.error("⚠️ Error in initSession:", error)
        // Garantir que isLoading est mis à false même en cas d'erreur
        setIsLoading(false)
      }
    }
    
    initSession()

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔔 Auth event: ${event}`, session ? `User: ${session.user?.email}` : "No session")
        
        try {
          if (session) {
            // Vérification supplémentaire pour s'assurer que user est un objet valide
            if (typeof session.user === 'object' && session.user?.id) {
              setSession(session)
              safeSetUser(session.user)
              
              // Vérifier en mémoire si c'est un admin connu pour une réponse immédiate
              const knownAdminEmails = [
                'corentin@klyra.design',
                'dev@klyra.design',
                'admin@klyra.design',
                'test.admin@example.com'
              ];
              
              if (session.user.email && knownAdminEmails.includes(session.user.email.toLowerCase())) {
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
                  
                  // Vérifier en mémoire si c'est un admin connu
                  const knownAdminEmails = [
                    'corentin@klyra.design',
                    'dev@klyra.design',
                    'admin@klyra.design',
                    'test.admin@example.com'
                  ];
                  
                  if (recoveredUser.email && knownAdminEmails.includes(recoveredUser.email.toLowerCase())) {
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
    )

    // Cleanup subscription and timeout on unmount
    return () => {
      console.log("🧹 Cleanup: unsubscribing from auth changes")
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

  // Reload auth state function - Optimisée
  const reloadAuthState = async (): Promise<void> => {
    try {
      console.log("🔄 Manually reloading auth state")
      setIsLoading(true)
      
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
      
      // Protection contre les promesses qui ne se résolvent jamais
      const reloadPromise = async () => {
        try {
          // Forcer la déconnexion/reconnexion du client Supabase
          await Promise.race([
            supabase.auth.refreshSession(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Refresh session timeout")), 1500)) // Réduit à 1.5s
          ])
          
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
      
      // Exécuter avec un timeout global raccourci
      await Promise.race([
        reloadPromise(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Global reloadAuthState timeout")), 2000))
      ]).catch(err => {
        console.error("Caught in reloadAuthState race:", err);
        // Ne pas propager l'erreur
      }).finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Exception in reloadAuthState:", error);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      // Garantir que isLoading est toujours mis à false, quoi qu'il arrive
      console.log("✅ Setting isLoading to false from reloadAuthState finally block");
      setIsLoading(false);
    }
  };

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