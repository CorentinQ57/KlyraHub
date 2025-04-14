import { createClient } from '@supabase/supabase-js'

// Create a global ready flag to ensure Supabase is fully initialized
let isCoreSupabaseReady = false;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Enhanced logging of session debug info in localStorage, cookies and initial state
export const debugAuthState = (source = 'default') => {
  if (typeof window !== 'undefined') {
    try {
      // Check all possible localStorage token formats
      const tokenKeys = [
        'supabase.auth.token',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
        'sb-access-token',
      ];
      
      const refreshTokenKeys = [
        'supabase.auth.refreshToken',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`,
        'sb-refresh-token',
      ];
      
      const expiryKeys = [
        'supabase.auth.expires_at',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`,
        'sb-expires-at',
      ];
      
      // Check for tokens in all possible formats
      let foundToken = null;
      let foundRefreshToken = null;
      let foundExpiry = null;
      
      for (const key of tokenKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          foundToken = { key, value: value.substring(0, 12) + '...' };
          break;
        }
      }
      
      for (const key of refreshTokenKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          foundRefreshToken = { key, value: value.substring(0, 12) + '...' };
          break;
        }
      }
      
      for (const key of expiryKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          foundExpiry = { 
            key, 
            value, 
            date: new Date(parseInt(value) * 1000).toLocaleString() 
          };
          break;
        }
      }
      
      // Check cookies
      const cookieString = document.cookie;
      const sbCookieRegex = /sb-(access|refresh)-token/;
      const hasSbCookies = sbCookieRegex.test(cookieString);
      
      console.log(`🔑 Auth Debug [${source}]:`, {
        supabaseReady: isCoreSupabaseReady,
        localStorage: {
          token: foundToken ? `Found in ${foundToken.key}` : 'Missing',
          refreshToken: foundRefreshToken ? `Found in ${foundRefreshToken.key}` : 'Missing',
          expiry: foundExpiry ? `Found in ${foundExpiry.key} (${foundExpiry.date})` : 'Missing',
        },
        cookies: {
          hasSbCookies,
          preview: cookieString.substring(0, 50) + (cookieString.length > 50 ? '...' : '')
        }
      });

      // Return if we found authentication data
      return !!(foundToken || foundRefreshToken || hasSbCookies);
    } catch (error) {
      console.error('Error reading auth state:', error);
      return false;
    }
  }
  return false;
};

// Enhanced cookie-aware storage implementation
export const enhancedStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    
    // Try standard format first
    let value = localStorage.getItem(key);
    
    // If not found, try alternative formats
    if (!value) {
      // Token mappings
      const mappings: Record<string, string[]> = {
        // Main access token
        'supabase.auth.token': [
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
          'sb-access-token'
        ],
        [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`]: [
          'supabase.auth.token',
          'sb-access-token'
        ],
        'sb-access-token': [
          'supabase.auth.token',
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`
        ],
        
        // Refresh token
        'supabase.auth.refreshToken': [
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`,
          'sb-refresh-token'
        ],
        [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`]: [
          'supabase.auth.refreshToken',
          'sb-refresh-token'
        ],
        'sb-refresh-token': [
          'supabase.auth.refreshToken',
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`
        ],
        
        // Expiry
        'supabase.auth.expires_at': [
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`,
          'sb-expires-at'
        ],
        [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`]: [
          'supabase.auth.expires_at',
          'sb-expires-at'
        ],
        'sb-expires-at': [
          'supabase.auth.expires_at',
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`
        ]
      };
      
      // Try alternatives
      if (mappings[key]) {
        for (const altKey of mappings[key]) {
          const altValue = localStorage.getItem(altKey);
          if (altValue) {
            console.log(`Retrieved auth value using alternative key: ${key} → ${altKey}`);
            value = altValue;
            break;
          }
        }
      }
      
      // If still not found, check cookies (for access and refresh tokens)
      if (!value && typeof document !== 'undefined') {
        try {
          // Handle cookie extraction for specific keys
          if (key === 'supabase.auth.token' || key === `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token` || key === 'sb-access-token') {
            const match = document.cookie.match(new RegExp('(^| )sb-access-token=([^;]+)'));
            if (match) {
              console.log('Retrieved access token from cookie');
              value = match[2];
            }
          } else if (key === 'supabase.auth.refreshToken' || key === `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token` || key === 'sb-refresh-token') {
            const match = document.cookie.match(new RegExp('(^| )sb-refresh-token=([^;]+)'));
            if (match) {
              console.log('Retrieved refresh token from cookie');
              value = match[2];
            }
          }
        } catch (e) {
          console.error('Error accessing cookies:', e);
        }
      }
    }
    
    return value;
  },
  
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
    
    // Store in multiple formats for redundancy
    const mappings: Record<string, string[]> = {
      // Main access token
      'supabase.auth.token': [
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
        'sb-access-token'
      ],
      [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`]: [
        'supabase.auth.token',
        'sb-access-token'
      ],
      'sb-access-token': [
        'supabase.auth.token',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`
      ],
      
      // Refresh token
      'supabase.auth.refreshToken': [
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`,
        'sb-refresh-token'
      ],
      [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`]: [
        'supabase.auth.refreshToken',
        'sb-refresh-token'
      ],
      'sb-refresh-token': [
        'supabase.auth.refreshToken',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`
      ],
      
      // Expiry
      'supabase.auth.expires_at': [
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`,
        'sb-expires-at'
      ],
      [`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`]: [
        'supabase.auth.expires_at',
        'sb-expires-at'
      ],
      'sb-expires-at': [
        'supabase.auth.expires_at',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`
      ]
    };
    
    if (mappings[key]) {
      for (const altKey of mappings[key]) {
        localStorage.setItem(altKey, value);
      }
    }
    
    // Also store critical auth tokens as cookies for additional reliability
    if (typeof document !== 'undefined') {
      try {
        const maxAgeSec = 60 * 60 * 24 * 7; // 7 days
        
        if (key === 'supabase.auth.token' || key === `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token` || key === 'sb-access-token') {
          document.cookie = `sb-access-token=${value}; max-age=${maxAgeSec}; path=/; SameSite=Lax`;
        } else if (key === 'supabase.auth.refreshToken' || key === `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token` || key === 'sb-refresh-token') {
          document.cookie = `sb-refresh-token=${value}; max-age=${maxAgeSec}; path=/; SameSite=Lax`;
        }
      } catch (e) {
        console.error('Error setting cookies:', e);
      }
    }
  },
  
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    
    // Remove all possible formats
    const allKeys = [
      // Access token
      'supabase.auth.token',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
      'sb-access-token',
      
      // Refresh token
      'supabase.auth.refreshToken',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`,
      'sb-refresh-token',
      
      // Expiry
      'supabase.auth.expires_at',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-expires-at`,
      'sb-expires-at'
    ];
    
    for (const k of allKeys) {
      localStorage.removeItem(k);
    }
    
    // Also remove cookies
    if (typeof document !== 'undefined') {
      try {
        document.cookie = 'sb-access-token=; Max-Age=-99999999; path=/; SameSite=Lax';
        document.cookie = 'sb-refresh-token=; Max-Age=-99999999; path=/; SameSite=Lax';
      } catch (e) {
        console.error('Error removing cookies:', e);
      }
    }
  }
};

// Check for auth data before initializing Supabase
const hasAuthData = debugAuthState('pre-init');

// Create Supabase client with enhanced config
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: enhancedStorage,
      storageKey: 'supabase.auth.token',
      // Enable debugging for better error visibility
      debug: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js@2.39.7',
      },
    },
    // Reduced timeout for API calls to avoid long loading periods
    realtime: {
      timeout: 10000, // 10 seconds
    },
    db: {
      schema: 'public',
    }
  }
);

// Add interceptor for session expiry errors and auto-refresh
const addSessionRefreshInterceptor = () => {
  if (typeof window !== 'undefined') {
    // Add a generic fetch interceptor to handle auth errors
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        
        // Check if this could be an auth error
        if (response.status === 401) {
          const url = typeof input === 'string' 
            ? input 
            : input instanceof Request 
              ? input.url
              : input.toString();
          
          // Only try to refresh if this is a Supabase API call
          if (url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) {
            console.log('🔑 Detected 401 response, attempting refresh...');
            
            try {
              const { data, error: refreshError } = await supabase.auth.refreshSession();
              
              if (!refreshError && data?.session) {
                console.log('✅ Token refreshed due to 401 response');
                
                // For important API calls, we could retry the request here
                // This would require cloning the request and sending it again
                // We're keeping it simple for now and just refreshing the token
              }
            } catch (refreshError) {
              console.warn('⚠️ Background refresh failed:', refreshError);
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
      }
    };
    
    console.log('✅ Session refresh interceptor installed');
  }
};

// Wait for Supabase client to be fully initialized
const waitForSupabaseReady = () => {
  return new Promise<void>((resolve) => {
    // If we detected auth data, give Supabase more time to load it
    const waitTime = hasAuthData ? 300 : 100;
    
    setTimeout(() => {
      isCoreSupabaseReady = true;
      console.log(`✅ Supabase client ready after ${waitTime}ms wait`);
      
      // Add session refresh interceptor after initialization
      addSessionRefreshInterceptor();
      
      resolve();
    }, waitTime);
  });
};

// Add a manual initialization function for authentication
const initSupabaseAuth = async () => {
  // Wait for basic initialization
  await waitForSupabaseReady();
  
  // Check if we need to do a manual refresh
  if (typeof window !== 'undefined') {
    try {
      // Vérifier si nous avons un utilisateur en cache
      const cachedUserStr = localStorage.getItem('klyra_cached_user');
      if (cachedUserStr) {
        console.log("🧠 Found cached user data");
        
        try {
          // Parse cached user
          const cachedUser = JSON.parse(cachedUserStr);
          
          // Check if tokens exist in localStorage
          const refreshToken = localStorage.getItem('supabase.auth.refreshToken') || 
                            localStorage.getItem('sb-refresh-token') || 
                            localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`);
          
          // If we have a valid cached user but no refresh token, we might be in a half-logged-in state
          // Attempt a background session check to resolve this
          if (cachedUser && typeof cachedUser === 'object' && cachedUser.id) {
            console.log("🔄 Attempting early session validation for cached user...");
            
            // Try a low-impact call to verify session
            const { data, error } = await Promise.race([
              supabase.auth.getUser(),
              new Promise(resolve => setTimeout(() => resolve({ 
                data: null, 
                error: new Error("Early session check timeout")
              }), 2000))
            ]) as any;
            
            if (error) {
              console.warn("⚠️ Early session check failed:", error.message);
              
              if (refreshToken) {
                // Try to refresh the token if we have one
                console.log("🔄 Attempting early manual token refresh...");
                const { error: refreshError } = await supabase.auth.refreshSession({ 
                  refresh_token: refreshToken 
                });
                
                if (refreshError) {
                  console.warn("⚠️ Early manual refresh failed:", refreshError.message);
                  
                  // If refreshing fails and we have cached user data, warn about potential sync issues
                  console.warn("⚠️ Session restoration will rely on cached data due to token refresh failure");
                } else {
                  console.log("✅ Early manual refresh successful!");
                }
              } else {
                console.warn("⚠️ No refresh token available for cached user - session may be lost");
              }
            } else if (data?.user) {
              console.log("✅ Early session check confirmed valid user:", data.user.email);
              
              // Update cache with current data
              localStorage.setItem('klyra_cached_user', JSON.stringify(data.user));
              console.log("💾 Updated cached user data after validation");
            } else {
              console.warn("⚠️ Session check returned empty user data but no error");
            }
          }
        } catch (parseError) {
          console.error("❌ Error parsing cached user:", parseError);
          // If parsing fails, remove the invalid cache entry
          localStorage.removeItem('klyra_cached_user');
        }
      } else {
        // If no cached user but tokens exist, check if we can get user data
        const hasAuthTokens = localStorage.getItem('supabase.auth.token') || 
                            localStorage.getItem('sb-access-token') || 
                            localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
                            
        const refreshToken = localStorage.getItem('supabase.auth.refreshToken') || 
                          localStorage.getItem('sb-refresh-token') || 
                          localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-refresh-token`);
        
        if (hasAuthTokens || refreshToken) {
          console.log("🔍 Auth tokens found but no cached user - attempting to retrieve");
          
          // If we have tokens but no cached user, try to get the user data
          const { data, error } = await Promise.race([
            supabase.auth.getUser(),
            new Promise(resolve => setTimeout(() => resolve({ 
              data: null, 
              error: new Error("User retrieval timeout")
            }), 2000))
          ]) as any;
          
          if (error) {
            console.warn("⚠️ Failed to retrieve user with existing tokens:", error.message);
            
            if (refreshToken) {
              // Attempt refresh as last resort
              console.log("🔄 Attempting manual token refresh to restore session...");
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ 
                refresh_token: refreshToken 
              });
              
              if (refreshError) {
                console.warn("⚠️ Token refresh failed, session may be lost:", refreshError.message);
              } else if (refreshData?.session?.user) {
                console.log("✅ Session restored through refresh token!");
                
                // Cache the recovered user
                localStorage.setItem('klyra_cached_user', JSON.stringify(refreshData.session.user));
                console.log("💾 Cached user data from refresh");
              }
            }
          } else if (data?.user) {
            console.log("✅ Successfully retrieved user:", data.user.email);
            
            // Cache the user for future use
            localStorage.setItem('klyra_cached_user', JSON.stringify(data.user));
            console.log("💾 Cached retrieved user data");
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Error in initSupabaseAuth:", error);
    }
  }
  
  // Run debug after initialization
  debugAuthState('post-init');
  
  return true;
};

// Initialize Supabase
waitForSupabaseReady().then(() => {
  // Run debug after Supabase client is fully initialized
  debugAuthState('post-init');
  
  // Trigger immediate auth check as a background task
  initSupabaseAuth().catch(error => {
    console.warn("⚠️ Background auth initialization failed:", error);
  });
});

// Export a readiness check
export const isSupabaseReady = () => isCoreSupabaseReady;

// Export a function to check if Supabase is ready and wait if it's not
export const waitForSupabase = async () => {
  if (isCoreSupabaseReady) return;
  await waitForSupabaseReady();
};

// Periodically check auth state every 30 seconds while page is open
if (typeof window !== 'undefined') {
  setInterval(() => {
    debugAuthState('periodic');
    
    // Try to help keep session active by forcing a refresh
    if (isCoreSupabaseReady) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          console.log('📡 Refreshing session periodically');
        }
      }).catch(err => {
        console.error('Error in periodic session check:', err);
      });
    }
  }, 30000);
}

// Database types
export type User = {
  id: string
  email: string
  created_at: string
  full_name?: string
  avatar_url?: string
  role: 'client' | 'designer' | 'admin'
}

export type Service = {
  id: string
  name: string
  description: string
  long_description?: string
  price: number
  duration: number
  category_id: string
  created_at: string
  updated_at: string
  image_url?: string
  icon?: string
  features?: string[]
  phases?: string[]
  category?: string
  active: boolean
}

export type Project = {
  id: string
  title: string
  description?: string
  client_id: string
  designer_id?: string
  service_id: string
  status: 'pending' | 'validated' | 'in_progress' | 'delivered' | 'completed'
  current_phase?: string
  price: number
  category_image_url?: string
  created_at: string
  updated_at: string
}

export type Comment = {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
}

export type Deliverable = {
  id: string
  project_id: string
  title: string
  description?: string
  file_url: string
  created_at: string
  updated_at?: string
  name?: string
  url?: string
  type?: string
  created_by?: string
}

export type Category = {
  id: number
  name: string
  created_at: string
}

export type UploadRequest = {
  id: string
  project_id: string
  name: string
  description?: string
  status: 'pending' | 'completed' | 'rejected'
  created_by: string
  created_at: string
  updated_at?: string
  file_url?: string
  uploaded_by?: string
}

// Interface pour la réponse Supabase pour un service avec sa catégorie
interface ServiceWithCategory {
  id: string;
  category_id: string;
  category: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

// Helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfileData(userId: string) {
  try {
    // Vérifier que l'ID utilisateur est valide
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid user ID provided to getProfileData:', userId);
      return null;
    }
    
    // Assurons-nous que l'ID est correctement formaté
    const cleanUserId = userId.trim();
    
    // Ajouter plus de logging
    console.log(`Fetching profile for user ID: ${cleanUserId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', cleanUserId)
      .single();
    
    if (error) {
      // Vérifier si c'est une erreur de données manquantes
      if (error.code === 'PGRST116') {
        console.log(`Profile not found for user ID: ${cleanUserId}, will attempt to create one`);
        
        // Si le profil n'existe pas, tenter de le créer automatiquement
        try {
          // Récupérer les données utilisateur
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData && userData.user) {
            const newProfile = {
              id: cleanUserId,
              full_name: userData.user.user_metadata?.full_name || '',
              email: userData.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
              return null;
            }
            
            console.log('Profile created successfully');
            return insertedProfile;
          }
        } catch (createError) {
          console.error('Error in automatic profile creation:', createError);
        }
      } else {
        console.error('Error fetching profile data:', error);
      }
      return null;
    }
    
    console.log('Profile data retrieved successfully');
    return data;
  } catch (err) {
    console.error('Exception in getProfileData:', err);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating profile:', error)
    return null
  }
  
  return data
}

/**
 * Sauvegarde les données d'onboarding de l'utilisateur
 */
export async function saveOnboardingData(userId: string, onboardingData: any) {
  try {
    // Étape 1: Mettre à jour les données de profil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: onboardingData.fullName,
        company_name: onboardingData.companyName,
        phone: onboardingData.phone,
        business_goals: onboardingData.goals,
        sector: onboardingData.sector, 
        company_size: onboardingData.companySize,
        needs: JSON.stringify({
          branding: onboardingData.needsBranding || false,
          website: onboardingData.needsWebsite || false, 
          marketing: onboardingData.needsMarketing || false
        }),
        visual_preferences: onboardingData.visualPreferences || [],
        communication_style: onboardingData.communicationStyle,
        time_management: onboardingData.timeManagement,
        onboarded: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error updating profile with onboarding data:', profileError)
      throw profileError
    }
    
    // Étape 2: Mettre à jour les métadonnées utilisateur
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { 
        onboarded: true,
        onboardingCompletedAt: new Date().toISOString()
      }
    })
    
    if (metadataError) {
      console.error('Error updating user metadata:', metadataError)
      throw metadataError
    }
    
    return true
  } catch (error) {
    console.error('Error in saveOnboardingData:', error)
    throw error
  }
}

export async function fetchProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        services (
          id,
          name,
          description,
          category_id,
          price,
          duration,
          image_url,
          category:categories (
            id,
            name,
            image_url
          )
        ),
        client:client_id (
          id,
          full_name,
          email
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }
    
    // Normaliser les données des projets
    const normalizedData = data ? normalizeProjectsData(data) : [];
    
    return normalizedData
  } catch (error) {
    console.error('Exception in fetchProjects:', error)
    return []
  }
}

// Add caching variables for fetchAllProjects
let cachedProjects: any[] = [];
let lastProjectsFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export async function fetchAllProjects() {
  try {
    // Check if we have a recent cache that we can return
    const now = Date.now();
    if (cachedProjects.length > 0 && now - lastProjectsFetchTime < CACHE_DURATION) {
      console.log(`Using cached projects (${cachedProjects.length} items, cache age: ${(now - lastProjectsFetchTime)/1000}s)`);
      return cachedProjects;
    }
    
    console.log('Cache expired or empty, fetching fresh projects data...');
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        services (
          id,
          name,
          description,
          category_id,
          price,
          duration,
          image_url,
          category:categories (
            id,
            name,
            image_url
          )
        ),
        client:client_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching all projects:', error)
      return []
    }
    
    // Normaliser les données des projets
    const normalizedData = data ? normalizeProjectsData(data) : [];
    
    // Update cache
    cachedProjects = normalizedData;
    lastProjectsFetchTime = now;
    console.log(`Updated projects cache with ${normalizedData.length} items`);
    
    return normalizedData
  } catch (error) {
    console.error('Exception in fetchAllProjects:', error)
    return []
  }
}

// Manual cache invalidation function
export function invalidateProjectsCache() {
  console.log('Manually invalidating projects cache');
  cachedProjects = [];
  lastProjectsFetchTime = 0;
}

/**
 * Fonction utilitaire pour normaliser les données des projets et assurer
 * la cohérence de l'accès aux catégories
 */
function normalizeProjectsData(projects: any[]): any[] {
  return projects.map(project => {
    // Si le projet n'a pas de service, retourner tel quel
    if (!project.services) return project;
    
    const services = project.services;
    
    // Vérifier si la catégorie existe mais est sous un format différent
    if (!services.category && services.categories) {
      services.category = services.categories;
    }
    
    return {
      ...project,
      services
    };
  });
}

/**
 * Récupère un projet spécifique par son ID et l'ID de l'utilisateur
 */
export async function fetchProjectById(projectId: string, userId: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        service:services (
          id,
          name,
          description,
          price,
          duration,
          category_id
        ),
        client:profiles!client_id (
          id,
          full_name,
          email
        ),
        designer:profiles!designer_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', projectId)
      .eq('client_id', userId)
      .single();

    if (error) {
      console.error('Error fetching project by id:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching project by id:', error);
    return null;
  }
}

/**
 * Récupère les commentaires d'un projet
 */
export async function fetchComments(projectId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * Ajoute un commentaire à un projet
 */
export async function addComment(projectId: string, userId: string, content: string): Promise<Comment | null> {
  try {
    console.log(`Adding comment to project ${projectId} by user ${userId}`);
    
    // Vérifier si le projet existe
    const { data: projectExists, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectExists) {
      console.error('Project does not exist:', projectError);
      return null;
    }
    
    // Créer le commentaire
    const newComment = {
      project_id: projectId,
      user_id: userId,
      content,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('comments')
      .insert(newComment)
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    console.log('Comment added successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in addComment:', error);
    return null;
  }
}

/**
 * Récupère les livrables d'un projet
 */
export async function fetchDeliverables(projectId: string): Promise<Deliverable[]> {
  try {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deliverables:', error);
      return [];
    }

    // Transformation des données pour compatibilité avec le code existant
    return (data || []).map(item => ({
      ...item,
      name: item.title,        // Mapper title -> name pour compatibilité
      url: item.file_url,      // Mapper file_url -> url pour compatibilité
      type: 'unknown'          // Valeur par défaut
    }));
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    return [];
  }
}

/**
 * Crée un nouveau projet après un achat réussi
 */
export async function createProject(
  userId: string,
  serviceId: string,
  title: string,
  price: number
): Promise<Project | null> {
  try {
    console.log(`Tentative de création d'un projet pour l'utilisateur ${userId}`, {
      serviceId,
      title,
      price
    });

    // Vérifier si le projet existe déjà
    const { data: existingProjects, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', userId)
      .eq('service_id', serviceId)
      .eq('title', title)
      .eq('price', price);
    
    if (checkError) {
      console.error('Erreur lors de la vérification du projet existant:', checkError);
      throw new Error(`Erreur lors de la vérification: ${checkError.message}`);
    }

    if (existingProjects && existingProjects.length > 0) {
      console.log('Le projet existe déjà:', existingProjects[0]);
      return existingProjects[0] as Project;
    }

    // Récupérer le service et la catégorie associée pour l'image
    const { data, error: serviceError } = await supabase
      .from('services')
      .select(`
        id,
        category_id,
        category:categories!category_id (
          id,
          name,
          image_url
        )
      `)
      .eq('id', serviceId)
      .single();

    if (serviceError || !data) {
      console.error('Le service spécifié n\'existe pas:', serviceId);
      throw new Error('Le service spécifié n\'existe pas');
    }
    
    // Récupérer l'image de la catégorie de manière sécurisée
    let categoryImageUrl = null;
    if (data && 
        data.category && 
        Array.isArray(data.category) && 
        data.category.length > 0 && 
        data.category[0] && 
        typeof data.category[0] === 'object' && 
        'image_url' in data.category[0]) {
      categoryImageUrl = data.category[0].image_url;
    }

    // Créer le projet
    console.log('Création du projet dans Supabase...');
    const { data: projectData, error } = await supabase
      .from('projects')
      .insert({
        client_id: userId,
        service_id: serviceId,
        title,
        price,
        status: 'pending',
        category_image_url: categoryImageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur détaillée lors de la création du projet:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }

    console.log('Projet créé avec succès:', projectData);
    return projectData;
  } catch (error) {
    console.error('Exception lors de la création du projet:', error);
    throw error;
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    console.log('Recherche du service par slug:', slug);
    
    // Récupérer tous les services actifs
    const { data: allServices, error } = await supabase
      .from('services')
      .select(`
        *,
        categories:category_id (
          name
        )
      `)
      .eq('active', true);
    
    if (error) {
      console.error('Error fetching services:', error);
      return null;
    }
    
    if (!allServices || allServices.length === 0) {
      console.log('Aucun service trouvé dans la base de données');
      return null;
    }
    
    // Chercher le service dont le slug correspond
    const matchedService = allServices.find(service => {
      const serviceSlug = service.name.toLowerCase().replace(/\s+/g, '-');
      console.log(`Comparaison: "${serviceSlug}" avec "${slug}"`);
      return serviceSlug === slug;
    });
    
    if (!matchedService) {
      console.log('Aucun service trouvé pour le slug:', slug);
      return null;
    }
    
    console.log('Service trouvé par slug:', matchedService.name);
    return formatServiceData(matchedService);

  } catch (error) {
    console.error('Exception in getServiceBySlug:', error);
    return null;
  }
}

export async function getAllServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        categories:category_id (
          name
        )
      `)
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data.map(service => formatServiceData(service));

  } catch (error) {
    console.error('Exception in getAllServices:', error);
    return [];
  }
}

/**
 * Met à jour un projet avec les nouvelles données
 */
export async function updateProject(projectId: string, updates: Partial<Project>) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Exception in updateProject:', error)
    return null
  }
}

/**
 * Récupère toutes les catégories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getAllCategories:', error);
    return [];
  }
}

/**
 * Crée un nouveau service
 */
export async function createService(serviceData: Partial<Service>): Promise<Service | null> {
  try {
    // Créer une copie et transformer les données pour qu'elles soient compatibles avec la base
    const dataToInsert: any = { ...serviceData };
    
    // Convertir les tableaux en JSON si nécessaire
    if (Array.isArray(dataToInsert.features)) {
      dataToInsert.features = JSON.stringify(dataToInsert.features);
    }
    
    if (Array.isArray(dataToInsert.phases)) {
      dataToInsert.phases = JSON.stringify(dataToInsert.phases);
    }
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...dataToInsert,
        active: dataToInsert.active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return null;
    }

    // Traiter les données reçues pour les convertir au format attendu
    return formatServiceData(data);
  } catch (error) {
    console.error('Exception in createService:', error);
    return null;
  }
}

/**
 * Met à jour un service existant
 */
export async function updateService(serviceId: string, updates: Partial<Service>): Promise<Service | null> {
  try {
    // Créer une copie et transformer les données pour qu'elles soient compatibles avec la base
    const dataToUpdate: any = { ...updates };
    
    // Convertir les tableaux en JSON si nécessaire
    if (Array.isArray(dataToUpdate.features)) {
      dataToUpdate.features = JSON.stringify(dataToUpdate.features);
    }
    
    if (Array.isArray(dataToUpdate.phases)) {
      dataToUpdate.phases = JSON.stringify(dataToUpdate.phases);
    }
    
    console.log('Envoi de la mise à jour avec les données:', JSON.stringify(dataToUpdate, null, 2));
    
    const { data, error } = await supabase
      .from('services')
      .update({
        ...dataToUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return null;
    }

    // Traiter les données reçues pour les convertir au format attendu
    return formatServiceData(data);
  } catch (error) {
    console.error('Exception in updateService:', error);
    return null;
  }
}

/**
 * Supprime un service (soft delete en mettant active à false)
 */
export async function deleteService(serviceId: string): Promise<boolean> {
  try {
    // Vérifier si le service est utilisé dans des projets
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('service_id', serviceId)
      .limit(1);
    
    if (projectsError) {
      console.error('Error checking service usage:', projectsError);
      return false;
    }
    
    // Si le service est utilisé, effectuer un soft delete
    if (projects && projects.length > 0) {
      const { error } = await supabase
        .from('services')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', serviceId);
        
      if (error) {
        console.error('Error soft deleting service:', error);
        return false;
      }
      
      return true;
    }
    
    // Si le service n'est pas utilisé, on peut le supprimer complètement
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
      
    if (error) {
      console.error('Error deleting service:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deleteService:', error);
    return false;
  }
}

/**
 * Récupère un service par son ID
 */
export async function getServiceById(serviceId: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        categories:category_id (
          name
        )
      `)
      .eq('id', serviceId)
      .single();

    if (error) {
      console.error('Error fetching service by id:', error);
      return null;
    }

    return formatServiceData(data);
  } catch (error) {
    console.error('Exception in getServiceById:', error);
    return null;
  }
}

/**
 * Formatage des données de service depuis la BD vers le format attendu par le frontend
 */
function formatServiceData(data: any): Service {
  let features: string[] = [];
  let phases: string[] = [];
  
  // Traiter les features (peuvent être une chaîne JSON ou un tableau)
  if (typeof data.features === 'string') {
    try {
      features = JSON.parse(data.features);
    } catch (e) {
      console.warn('Échec de parsing des features, format non JSON:', e);
      features = [];
    }
  } else if (Array.isArray(data.features)) {
    features = data.features;
  }
  
  // Traiter les phases (peuvent être une chaîne JSON ou un tableau)
  if (typeof data.phases === 'string') {
    try {
      phases = JSON.parse(data.phases);
    } catch (e) {
      console.warn('Échec de parsing des phases, format non JSON:', e);
      phases = ["Briefing", "Conception", "Développement", "Tests et validation", "Livraison"];
    }
  } else if (Array.isArray(data.phases)) {
    phases = data.phases;
  } else {
    // Phases par défaut
    phases = ["Briefing", "Conception", "Développement", "Tests et validation", "Livraison"];
  }
  
  return {
    ...data,
    category: data.categories?.name || '',
    icon: data.icon || '📋',
    features: features,
    phases: phases,
    long_description: data.long_description || data.description
  };
}

export async function addDeliverable(
  projectId: string, 
  name: string, 
  url: string, 
  type: string,
  createdBy: string
): Promise<Deliverable | null> {
  try {
    // Création d'un objet conforme à la structure de la base de données
    const dbDeliverable = {
      project_id: projectId,
      title: name,             // name -> title
      description: "",         // valeur par défaut
      file_url: url,           // url -> file_url
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('deliverables')
      .insert(dbDeliverable)
      .select()
      .single();

    if (error) {
      console.error('Error adding deliverable:', error);
      return null;
    }

    // Retourner l'objet avec les propriétés mappées pour compatibilité
    return {
      ...data,
      name: data.title,        // title -> name
      url: data.file_url,      // file_url -> url
      type,                    // conserver la valeur d'origine
      created_by: createdBy    // conserver la valeur d'origine
    };
  } catch (error) {
    console.error('Exception in addDeliverable:', error);
    return null;
  }
}

export async function deleteDeliverable(deliverableId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('deliverables')
      .delete()
      .eq('id', deliverableId);

    if (error) {
      console.error('Error deleting deliverable:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in deleteDeliverable:', error);
    return false;
  }
}

export async function uploadFile(file: File, projectId: string): Promise<string | null> {
  try {
    if (!file) {
      console.error('No file provided to uploadFile function');
      return null;
    }

    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop() || '';
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const fileName = `${uniqueId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `deliverables/${projectId}/${fileName}`;
    
    console.log(`Uploading file to storage: ${filePath}`);
    
    // Try to use existing bucket without checking first (avoid race conditions)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      
      // If the error is because the bucket doesn't exist, log a clear message
      if (uploadError.message && uploadError.message.includes('bucket not found')) {
        console.error('The "files" bucket does not exist in Supabase storage.');
        console.error('Please create it in the Supabase dashboard under Storage.');
        
        // Return a more specific error to help users troubleshoot
        return null;
      }
      
      return null;
    }

    // Récupérer l'URL publique
    const { data } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      console.error('Failed to get public URL for uploaded file');
      return null;
    }

    console.log(`File uploaded successfully: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error('Exception in uploadFile:', error);
    return null;
  }
}

export async function createUploadRequest(
  projectId: string, 
  name: string, 
  description: string, 
  createdById: string
): Promise<{ id: string } | null> {
  try {
    console.log(`Creating upload request "${name}" for project ${projectId} by user ${createdById}`);
    
    // Vérifier si le projet existe
    const { data: projectExists, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectExists) {
      console.error('Project does not exist:', projectError);
      return null;
    }
    
    // Créer la demande
    const newRequest = {
      project_id: projectId,
      name,
      description,
      created_by: createdById,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('upload_requests')
      .insert(newRequest)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating upload request:', error);
      
      // Vérifier si la table existe, sinon afficher un message plus clair
      if (error.code === '42P01') { // undefined_table
        console.error('The upload_requests table does not exist. Make sure you have run the migrations.');
      }
      
      return null;
    }

    console.log('Upload request created successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in createUploadRequest:', error);
    return null;
  }
}

export async function getUploadRequests(projectId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('upload_requests')
      .select(`
        *,
        creator:profiles!created_by(
          id,
          full_name,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching upload requests:', error);
      return [];
    }

    // Pour maintenir la compatibilité avec le code existant
    return (data || []).map(item => ({
      ...item,
      created_by_user: item.creator
    }));
  } catch (error) {
    console.error('Exception in getUploadRequests:', error);
    return [];
  }
}

export async function updateProjectPhase(
  projectId: string,
  currentPhase: string
): Promise<boolean> {
  try {
    console.log(`Updating project ${projectId} phase to "${currentPhase}"`);
    
    // Vérifier si le projet existe
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, current_phase')
      .eq('id', projectId)
      .single();
    
    if (projectError) {
      console.error('Error checking project:', projectError);
      return false;
    }
    
    if (!project) {
      console.error(`Project with ID ${projectId} not found`);
      return false;
    }
    
    // Si la phase est déjà définie et identique, pas besoin de mettre à jour
    if (project.current_phase === currentPhase) {
      console.log('Project phase is already set to the requested value');
      return true;
    }
    
    // Mettre à jour la phase
    const { error } = await supabase
      .from('projects')
      .update({
        current_phase: currentPhase,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project phase:', error);
      return false;
    }

    console.log('Project phase updated successfully');
    return true;
  } catch (error) {
    console.error('Exception in updateProjectPhase:', error);
    return false;
  }
}

/**
 * Récupère les détails complets d'un projet par son ID (pour l'admin)
 */
export async function fetchProjectDetailsForAdmin(projectId: string): Promise<any | null> {
  try {
    console.log(`Fetching admin details for project ${projectId}`);
    
    // Récupérer le projet avec ses relations
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        service:services (
          id,
          name,
          description,
          price,
          duration,
          category_id,
          phases
        ),
        client:profiles!client_id (
          id,
          full_name,
          email,
          avatar_url
        ),
        designer:profiles!designer_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project details for admin:', error);
      return null;
    }

    // Ensure we have parsed phases from the service
    if (data && data.service) {
      data.service = formatServiceData(data.service);
    }
    
    // Récupérer les designers disponibles
    const { data: designers, error: designersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('role', 'designer');
    
    if (designersError) {
      console.error('Error fetching available designers:', designersError);
    } else {
      // Ajouter les designers disponibles aux données du projet
      data.availableDesigners = designers || [];
    }
    
    // Récupérer les livrables du projet
    const { data: deliverables, error: deliverablesError } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (deliverablesError) {
      console.error('Error fetching deliverables:', deliverablesError);
    } else {
      data.deliverables = deliverables || [];
    }
    
    // Récupérer les commentaires du projet
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    } else {
      data.comments = comments || [];
    }
    
    console.log('Project details fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching project details for admin:', error);
    return null;
  }
}

export async function submitUploadRequest(
  requestId: string,
  file: File,
  userId: string
): Promise<boolean> {
  try {
    // Vérifier si la demande existe
    const { data: request, error: requestError } = await supabase
      .from('upload_requests')
      .select('id, project_id, status')
      .eq('id', requestId)
      .single();
    
    if (requestError || !request) {
      console.error('Upload request does not exist:', requestError);
      return false;
    }
    
    // Vérifier que la demande est en attente
    if (request.status !== 'pending') {
      console.error('Upload request is not in pending status');
      return false;
    }
    
    // Télécharger le fichier
    const fileUrl = await uploadFile(file, request.project_id);
    
    if (!fileUrl) {
      console.error('Failed to upload file');
      return false;
    }
    
    // Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('upload_requests')
      .update({
        file_url: fileUrl,
        uploaded_by: userId,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    if (updateError) {
      console.error('Error updating upload request:', updateError);
      return false;
    }
    
    console.log('Upload request submitted successfully');
    return true;
  } catch (error) {
    console.error('Exception in submitUploadRequest:', error);
    return false;
  }
}

/**
 * Crée une session de paiement Stripe pour un service
 */
export async function createStripeSession(
  userId: string,
  serviceId: string,
  serviceTitle: string,
  price: number
): Promise<{ url: string; sessionId: string } | null> {
  try {
    const response = await fetch('/api/stripe/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        serviceId,
        serviceTitle,
        price,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur lors de la création de la session Stripe:', error);
      throw new Error(error.message || 'Erreur lors de la création de la session de paiement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Exception dans createStripeSession:', error);
    throw error;
  }
}

// Helper function to refresh session token
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('⚠️ Error refreshing session:', error);
      return null;
    }
    
    console.log('✅ Session refreshed successfully:', data.session ? 'Valid session' : 'No session');
    return data.session;
  } catch (error) {
    console.error('Exception in refreshSession:', error);
    return null;
  }
}

// Helper function to check session status with enhanced debugging
export async function checkSessionStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log detailed session state
    console.log('🔐 Session check:', {
      hasSession: !!session,
      user: session?.user?.email || 'None',
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
      newAccessToken: session?.access_token?.substring(0, 10) + '...' || 'None',
    });
    
    return !!session;
  } catch (error) {
    console.error('Error checking session status:', error);
    return false;
  }
}

// Function to check if auth tokens exist in any format
export const checkAuthTokensExist = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for tokens in localStorage
    const tokenKeys = [
      'supabase.auth.token',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
      'sb-access-token',
    ];
    
    for (const key of tokenKeys) {
      if (localStorage.getItem(key)) {
        return true;
      }
    }
    
    // Check for tokens in cookies
    if (typeof document !== 'undefined') {
      const cookieString = document.cookie;
      const sbCookieRegex = /sb-(access|refresh)-token/;
      if (sbCookieRegex.test(cookieString)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking auth tokens:', error);
    return false;
  }
};

// Renforcer la sauvegarde des jetons d'authentification
export function enforceTokenStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    // Vérifier si nous avons une session valide
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error getting session in enforceTokenStorage:', error);
        return;
      }
      
      if (data?.session) {
        console.log('✅ Enforcing token storage for valid session');
        
        // Explicitement stocker les tokens dans localStorage et cookies
        const accessToken = data.session.access_token;
        const refreshToken = data.session.refresh_token;
        
        // Stockage dans localStorage avec redondance
        localStorage.setItem('supabase.auth.token', JSON.stringify({ 
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        }));
        
        localStorage.setItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`, JSON.stringify({ 
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        }));
        
        // Stockage direct des tokens
        localStorage.setItem('sb-access-token', accessToken);
        localStorage.setItem('sb-refresh-token', refreshToken);
        
        // Set secure cookies
        const maxAgeSec = 60 * 60 * 24 * 7; // 7 days
        document.cookie = `sb-access-token=${accessToken}; max-age=${maxAgeSec}; path=/; SameSite=Lax`;
        document.cookie = `sb-refresh-token=${refreshToken}; max-age=${maxAgeSec}; path=/; SameSite=Lax`;
        
        console.log('✅ Token storage enforced in multiple locations');
      }
    });
  } catch (error) {
    console.error('Error in enforceTokenStorage:', error);
  }
}

// Exécuter après initialisation dans le navigateur
if (typeof window !== 'undefined') {
  // Wait 500ms to ensure Supabase client is ready
  setTimeout(() => {
    enforceTokenStorage();
  }, 500);
  
  // Aussi exécuter périodiquement pour maintenir la session
  setInterval(() => {
    enforceTokenStorage();
  }, 10 * 60 * 1000); // Toutes les 10 minutes
} 