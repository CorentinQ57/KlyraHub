import { createClient } from '@supabase/supabase-js';
import { createProjectUpdateNotification } from './notifications-service';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Création du client Supabase avec une configuration améliorée
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // La propriété autoRefreshThreshold n'est pas supportée dans cette version
      // Nous allons gérer le rafraîchissement manuellement
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js@2.39.7',
      },
    },
  }
);

// Intercepteur pour les requêtes Supabase - ajouter après initialisation
if (typeof window !== 'undefined') {
  // Intercepter les erreurs d'authentification et tenter un rafraîchissement
  const originalFetch = window.fetch;
  window.fetch = async function (url: RequestInfo | URL, init?: RequestInit) {
    try {
      // Vérifier si c'est une requête Supabase
      const urlStr = url.toString();
      if (urlStr.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
        // Vérifier si le token est près d'expirer avant la requête
        const isTokenValid = verifyTokenExpiration();
        
        if (!isTokenValid) {
          console.log('🔄 Le token est expiré ou près d\'expirer, tentative de rafraîchissement...');
          try {
            // Tenter de rafraîchir la session
            await refreshSession();
            
            // Mettre à jour l'en-tête d'autorisation avec le nouveau token
            const accessToken = localStorage.getItem('sb-access-token');
            if (accessToken && init && init.headers) {
              const headers = new Headers(init.headers);
              headers.set('Authorization', `Bearer ${accessToken}`);
              init.headers = headers;
            }
          } catch (refreshError) {
            console.error('❌ Échec du rafraîchissement du token:', refreshError);
            // Continuer avec la requête originale même en cas d'échec
          }
        }
      }
      
      // Procéder avec la requête originale
      const response = await originalFetch(url, init);
      
      // Vérifier les erreurs d'authentification
      if (response.status === 401 || response.status === 403) {
        // En cas d'erreur d'authentification, tenter de rafraîchir et réessayer
        try {
          console.log(`🔄 Erreur d'authentification (${response.status}), tentative de rafraîchissement...`);
          const refreshed = await refreshSession();
          
          if (refreshed) {
            // Mettre à jour l'en-tête d'autorisation et réessayer
            const accessToken = localStorage.getItem('sb-access-token');
            if (accessToken && init && init.headers) {
              const headers = new Headers(init.headers);
              headers.set('Authorization', `Bearer ${accessToken}`);
              init.headers = headers;
              
              // Réessayer la requête avec le nouveau token
              return await originalFetch(url, init);
            }
          }
        } catch (refreshError) {
          console.error('❌ Échec du rafraîchissement après erreur d\'auth:', refreshError);
        }
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de l\'interception fetch:', error);
      return originalFetch(url, init);
    }
  };
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
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfileData(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
  
  return data;
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return data;
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
          marketing: onboardingData.needsMarketing || false,
        }),
        visual_preferences: onboardingData.visualPreferences || [],
        communication_style: onboardingData.communicationStyle,
        time_management: onboardingData.timeManagement,
        onboarded: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile with onboarding data:', profileError);
      throw profileError;
    }
    
    // Étape 2: Mettre à jour les métadonnées utilisateur
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { 
        onboarded: true,
        onboardingCompletedAt: new Date().toISOString(),
      },
    });
    
    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
      throw metadataError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveOnboardingData:', error);
    throw error;
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
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    // Normaliser les données des projets
    const normalizedData = data ? normalizeProjectsData(data) : [];
    
    return normalizedData;
  } catch (error) {
    console.error('Exception in fetchProjects:', error);
    return [];
  }
}

export async function fetchAllProjects() {
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
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
    
    // Normaliser les données des projets
    const normalizedData = data ? normalizeProjectsData(data) : [];
    
    return normalizedData;
  } catch (error) {
    console.error('Exception in fetchAllProjects:', error);
    return [];
  }
}

/**
 * Fonction utilitaire pour normaliser les données des projets et assurer
 * la cohérence de l'accès aux catégories
 */
function normalizeProjectsData(projects: any[]): any[] {
  return projects.map(project => {
    // Si le projet n'a pas de service, retourner tel quel
    if (!project.services) {
      return project;
    }
    
    const services = project.services;
    
    // Vérifier si la catégorie existe mais est sous un format différent
    if (!services.category && services.categories) {
      services.category = services.categories;
    }
    
    return {
      ...project,
      services,
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
        services:service_id (
          id,
          name,
          description,
          price,
          duration,
          category_id,
          phases,
          category:categories (
            id,
            name,
            image_url
          )
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
      .select('id, client_id, title')
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
      created_at: new Date().toISOString(),
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

    // Obtenir le nom de l'utilisateur qui commente
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (!userError && userData) {
      // Créer une notification pour le client du projet si ce n'est pas lui qui commente
      if (projectExists.client_id !== userId) {
        const userName = userData.full_name || userData.email || 'Un utilisateur';
        
        try {
          // Importer de manière dynamique pour éviter les dépendances circulaires
          const { createNotification } = await import('./notifications-service');
          
          await createNotification(
            projectExists.client_id,
            'Nouveau commentaire',
            `${userName} a commenté sur votre projet "${projectExists.title}"`,
            'comment',
            projectId
          );
        } catch (notifError) {
          console.error('Error creating notification for comment:', notifError);
          // On ne bloque pas l'ajout du commentaire si la notification échoue
        }
      }
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
      type: 'unknown',          // Valeur par défaut
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
      price,
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
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur détaillée lors de la création du projet:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
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
    // Ajouter la date de mise à jour si non spécifiée
    if (!updates.updated_at) {
      updates.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    
    // Créer une notification pour le client
    if (data) {
      // Déterminer le message de notification en fonction des changements
      let title = 'Mise à jour du projet';
      let message = 'Votre projet a été mis à jour.';
      
      if (updates.status) {
        title = 'Statut du projet modifié';
        message = `Le statut de votre projet est maintenant : ${updates.status}`;
      } else if (updates.current_phase) {
        title = 'Nouvelle phase du projet';
        message = `Le projet passe à la phase : ${updates.current_phase}`;
      }
      
      // Créer la notification
      await createProjectUpdateNotification(
        projectId,
        title,
        message
      );
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateProject:', error);
    return null;
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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
      phases = ['Briefing', 'Conception', 'Développement', 'Tests et validation', 'Livraison'];
    }
  } else if (Array.isArray(data.phases)) {
    phases = data.phases;
  } else {
    // Phases par défaut
    phases = ['Briefing', 'Conception', 'Développement', 'Tests et validation', 'Livraison'];
  }
  
  return {
    ...data,
    category: data.categories?.name || '',
    icon: data.icon || '📋',
    features: features,
    phases: phases,
    long_description: data.long_description || data.description,
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
    // Vérifier si le projet existe et récupérer les informations client
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, client_id, title')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectData) {
      console.error('Project does not exist:', projectError);
      return null;
    }
    
    // Création d'un objet conforme à la structure de la base de données
    const dbDeliverable = {
      project_id: projectId,
      title: name,             // name -> title
      description: '',         // valeur par défaut
      file_url: url,           // url -> file_url
      created_at: new Date().toISOString(),
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

    // Créer une notification pour le client
    try {
      // Obtenir le nom de l'utilisateur qui a créé le livrable
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', createdBy)
        .single();

      // Importer de manière dynamique pour éviter les dépendances circulaires
      const { createNotification } = await import('./notifications-service');
      
      const userName = userData && !userError 
        ? (userData.full_name || userData.email || 'Un membre de l\'équipe') 
        : 'Un membre de l\'équipe';
      
      await createNotification(
        projectData.client_id,
        'Nouveau livrable disponible',
        `Un nouveau livrable "${name}" est disponible pour votre projet "${projectData.title}"`,
        'deliverable',
        projectId
      );
    } catch (notifError) {
      console.error('Error creating notification for deliverable:', notifError);
      // On ne bloque pas l'ajout du livrable si la notification échoue
    }

    // Retourner l'objet avec les propriétés mappées pour compatibilité
    return {
      ...data,
      name: data.title,        // title -> name
      url: data.file_url,      // file_url -> url
      type,                    // conserver la valeur d'origine
      created_by: createdBy,    // conserver la valeur d'origine
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
        upsert: false,
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
      created_at: new Date().toISOString(),
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
      created_by_user: item.creator,
    }));
  } catch (error) {
    console.error('Exception in getUploadRequests:', error);
    return [];
  }
}

/**
 * Met à jour la phase actuelle d'un projet
 */
export async function updateProjectPhase(
  projectId: string,
  currentPhase: string
): Promise<boolean> {
  try {
    // Récupérer le projet avec son service pour vérifier les phases disponibles
    const { data, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        service_id,
        services:service_id (
          id,
          phases
        )
      `)
      .eq('id', projectId)
      .single();
    
    if (projectError || !data) {
      console.error('Erreur lors de la récupération du projet:', projectError);
      return false;
    }
    
    // Définition du type pour les données de projet
    interface ProjectWithServicePhases {
      id: string;
      service_id: string;
      services: {
        id: string;
        phases: string | string[] | null;
      };
    }
    
    // Cast sécurisé des données
    const project = data as unknown as ProjectWithServicePhases;
    
    // Formatage des phases du service
    let servicePhasesValid = false;
    
    if (project.services && project.services.phases) {
      let servicePhases: string[] = [];
      
      // Traiter les phases (peuvent être une chaîne JSON ou un tableau)
      if (typeof project.services.phases === 'string') {
        try {
          servicePhases = JSON.parse(project.services.phases);
        } catch (e) {
          console.warn('Échec de parsing des phases, format non JSON:', e);
          servicePhases = ['Briefing', 'Conception', 'Développement', 'Tests et validation', 'Livraison'];
        }
      } else if (Array.isArray(project.services.phases)) {
        servicePhases = project.services.phases;
      }
      
      // Vérifier si la phase fournie correspond à une des phases du service
      // Nous utilisons une correspondance flexible
      servicePhasesValid = servicePhases.some(phase => {
        const normalizedPhase = phase.toLowerCase().replace(/\s+/g, '_');
        const normalizedCurrentPhase = currentPhase.toLowerCase().replace(/\s+/g, '_');
        
        return normalizedPhase === normalizedCurrentPhase ||
               normalizedPhase.includes(normalizedCurrentPhase) ||
               normalizedCurrentPhase.includes(normalizedPhase);
      });
      
      console.log(`Validation de la phase "${currentPhase}" pour le projet ${projectId}:`, 
                 servicePhasesValid ? 'Phase valide' : 'Phase non reconnue');
    }
    
    // Mise à jour du projet, même si la phase n'est pas reconnue (pour la flexibilité)
    // mais on ajoute un log d'avertissement dans ce cas
    if (!servicePhasesValid) {
      console.warn(`Attention: La phase "${currentPhase}" ne correspond à aucune phase connue du service.`);
    }
    
    const updateResult = await updateProject(projectId, {
      current_phase: currentPhase,
      updated_at: new Date().toISOString()
    });
    
    return !!updateResult;
  } catch (error) {
    console.error('Error in updateProjectPhase:', error);
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
        services:service_id (
          id,
          name,
          description,
          price,
          duration,
          category_id,
          phases,
          category:categories (
            id,
            name,
            image_url
          )
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
    if (data && data.services) {
      data.services = formatServiceData(data.services);
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
        updated_at: new Date().toISOString(),
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

/**
 * Nouvelle fonction pour vérifier si le token JWT est expiré ou près d'expirer
 */
function verifyTokenExpiration(): boolean {
  try {
    const accessToken = localStorage.getItem('sb-access-token');
    if (!accessToken) {
      return false;
    }
    
    // Décoder le token JWT pour obtenir la date d'expiration
    // Format JWT: header.payload.signature
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return false;
    }
    
    // Vérifier si le token expire dans les 5 minutes
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    const isValid = timeUntilExpiry > 300; // 5 minutes
    
    if (!isValid) {
      console.log(`⚠️ Token expiré ou proche d'expiration (expire dans ${timeUntilExpiry}s)`);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'expiration du token:', error);
    return false;
  }
}

/**
 * Rafraîchit la session utilisateur et s'assure que les tokens sont correctement stockés
 */
async function refreshSession(): Promise<boolean> {
  try {
    console.log('🔄 Tentative de rafraîchissement de session...');
    
    // Récupérer les tokens actuels
    const accessToken = localStorage.getItem('sb-access-token');
    const refreshToken = localStorage.getItem('sb-refresh-token');
    
    // Si aucun token disponible, impossible de rafraîchir
    if (!accessToken && !refreshToken) {
      console.log('❌ Aucun token disponible pour le rafraîchissement');
      return false;
    }
    
    // Rafraîchir la session avec l'API Supabase
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ Erreur lors du rafraîchissement de la session:', error);
      return false;
    }
    
    if (!data.session) {
      console.log('❌ Session non récupérée après rafraîchissement');
      return false;
    }
    
    // Extraire les nouveaux tokens
    const newAccessToken = data.session.access_token;
    const newRefreshToken = data.session.refresh_token;
    
    if (!newAccessToken || !newRefreshToken) {
      console.log('❌ Tokens manquants dans la session rafraîchie');
      return false;
    }
    
    // Stocker manuellement les tokens dans localStorage pour s'assurer qu'ils sont disponibles
    localStorage.setItem('sb-access-token', newAccessToken);
    localStorage.setItem('sb-refresh-token', newRefreshToken);
    
    // Stocker également dans le format spécifique à Supabase
    const supabaseKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '')}-auth-token`;
    const tokenData = {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 heure par défaut
      expires_in: 3600,
      token_type: 'bearer',
      user: data.session.user
    };
    
    localStorage.setItem(supabaseKey, JSON.stringify(tokenData));
    
    // Vérifier que le token est bien stocké
    const storedToken = localStorage.getItem('sb-access-token');
    if (!storedToken) {
      console.log('⚠️ Le token n\'a pas été correctement stocké');
      return false;
    }
    
    console.log('✅ Session rafraîchie avec succès et tokens stockés');
    return true;
  } catch (error) {
    console.error('❌ Exception lors du rafraîchissement de la session:', error);
    return false;
  }
}

/**
 * Améliorer la fonction enforceTokenStorage pour utiliser les nouvelles fonctionnalités
 */
export function enforceTokenStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    console.log('Enforcing token storage...');
    
    // 1. Récupérer le token d'accès et de refresh depuis différentes sources
    const getTokens = () => {
      // Essayer d'abord localStorage avec plusieurs clés possibles
      const sources = [
        'sb-access-token',
        'supabase.auth.token',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
      ];
      
      let accessToken = null;
      let refreshToken = null;
      
      // Essayer toutes les sources de localStorage
      for (const source of sources) {
        const token = localStorage.getItem(source);
        if (token) {
          accessToken = token;
          break;
        }
      }
      
      // Si aucun token n'est trouvé dans localStorage, essayer les cookies
      if (!accessToken) {
        try {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('sb-access-token=')) {
              accessToken = trimmedCookie.substring('sb-access-token='.length);
            } else if (trimmedCookie.startsWith('sb-refresh-token=')) {
              refreshToken = trimmedCookie.substring('sb-refresh-token='.length);
            }
          }
        } catch (cookieError) {
          console.error('Error reading cookies:', cookieError);
        }
      }
      
      // Si aucun refresh token n'est trouvé, chercher dans localStorage
      if (!refreshToken) {
        refreshToken = localStorage.getItem('sb-refresh-token');
      }
      
      return { accessToken, refreshToken };
    };

    // 2. Récupérer les tokens depuis différentes sources
    const { accessToken, refreshToken } = getTokens();
    
    // Si aucun token n'est trouvé, retourner false
    if (!accessToken) {
      console.log('No tokens found to enforce');
      return false;
    }
    
    // Vérifier si le token est valide (non expiré)
    if (!verifyTokenExpiration()) {
      console.log('Token expiré, tentative de rafraîchissement...');
      // Tentative de rafraîchissement asynchrone mais ne pas attendre
      refreshSession().catch(err => console.error('Échec du rafraîchissement:', err));
    }
    
    console.log('Found tokens to enforce');
    
    // 3. Stocker les tokens dans localStorage avec plusieurs clés pour redondance
    const storageKeys = [
      'sb-access-token',
      'supabase.auth.token',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`,
    ];
    
    storageKeys.forEach(key => {
      try {
        localStorage.setItem(key, accessToken);
      } catch (e) {
        console.error(`Failed to set token for key ${key}:`, e);
      }
    });
    
    // Stocker aussi le refresh token si disponible
    if (refreshToken) {
      localStorage.setItem('sb-refresh-token', refreshToken);
    }
    
    // Stocker le timestamp de rafraîchissement
    localStorage.setItem('sb-token-last-refresh', Date.now().toString());
    
    // 4. Stocker les tokens dans des cookies pour redondance
    const secure = window.location.protocol === 'https:';
    const domain = window.location.hostname;
    const oneWeek = 7 * 24 * 60 * 60; // 7 jours en secondes
    
    // Cookie avec domaine spécifique
    document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}; Domain=${domain}`;
    
    // Cookie sans domaine spécifique (pour localhost)
    document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}`;
    
    // Si refresh token disponible, aussi le stocker dans des cookies
    if (refreshToken) {
      document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}; Domain=${domain}`;
      document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${oneWeek}; SameSite=Lax${secure ? '; Secure' : ''}`;
    }
    
    // 5. Vérification que les tokens ont bien été stockés
    setTimeout(() => {
      const testToken = localStorage.getItem('sb-access-token');
      if (!testToken) {
        console.error('⚠️ Token storage validation failed - token not found after storage');
      } else {
        console.log('✅ Token storage validation successful');
      }
      
      // Vérifier les cookies aussi
      const hasCookie = document.cookie.includes('sb-access-token=');
      if (!hasCookie) {
        console.error('⚠️ Cookie storage validation failed - cookie not found');
      } else {
        console.log('✅ Cookie storage validation successful');
      }
    }, 100);
    
    // 6. Tenter également de définir la session dans Supabase de manière synchrone
    // pour s'assurer que le client Supabase a les bonnes informations de session
    try {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error setting session in enforceTokenStorage:', error);
        } else if (data?.session) {
          console.log('Session successfully set in Supabase client');
        }
      });
    } catch (setSessionError) {
      console.error('Exception in setSession:', setSessionError);
      // Ne pas échouer pour cette erreur, les tokens sont déjà stockés
    }
    
    return true;
  } catch (error) {
    console.error('Error in enforceTokenStorage:', error);
    return false;
  }
}

/**
 * Vérifie et affiche l'état d'authentification actuel pour débogage
 */
export function debugAuthState(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    // Vérifier les jetons locaux
    const accessToken = localStorage.getItem('sb-access-token');
    const refreshToken = localStorage.getItem('sb-refresh-token');
    const otherToken = localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
    
    // Vérifier les cookies
    const hasCookie = document.cookie.includes('sb-access-token=');
    const cookieValue = hasCookie 
      ? document.cookie.split(';').find(c => c.trim().startsWith('sb-access-token='))?.split('=')[1]
      : null;
    
    // Compiler les résultats
    const results = {
      hasAccessToken: !!accessToken,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : null,
      hasRefreshToken: !!refreshToken,
      hasOtherToken: !!otherToken,
      hasCookie,
      cookieMatch: cookieValue && accessToken ? cookieValue === accessToken : 'N/A',
      lastRefresh: localStorage.getItem('sb-token-last-refresh'),
    };
    
    console.log('Auth state debug:', results);
    
    return results.hasAccessToken || results.hasCookie;
  } catch (error) {
    console.error('Error in debugAuthState:', error);
    return false;
  }
}

// Export des nouvelles fonctions utilitaires pour l'authentification
export { verifyTokenExpiration, refreshSession }; 