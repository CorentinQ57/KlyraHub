import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js@2.39.7',
      },
    },
  }
);

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
  category?: {
    id: string
    name: string
    image_url?: string
  }
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

// Helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfileData(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile data:', error)
    return null
  }
  
  return data
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
    
    return data || []
  } catch (error) {
    console.error('Exception in fetchProjects:', error)
    return []
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
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching all projects:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Exception in fetchAllProjects:', error)
    return []
  }
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

    // Vérifier si le service existe
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      console.error('Le service spécifié n\'existe pas:', serviceId);
      throw new Error('Le service spécifié n\'existe pas');
    }

    // Créer le projet
    console.log('Création du projet dans Supabase...');
    const { data, error } = await supabase
      .from('projects')
      .insert({
        client_id: userId,
        service_id: serviceId,
        title,
        price,
        status: 'pending',
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

    console.log('Projet créé avec succès:', data);
    return data;
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