import { supabase } from '@/lib/supabase';

export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  category?: string; // Pour joindre le nom de la catégorie
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  lessons: number;
  image_url: string;
  is_popular: boolean;
  is_new: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  title: string;
  description: string | null;
  type: 'eBook' | 'Vidéo' | 'Template' | 'Checklist';
  category_id: string;
  category?: string; // Pour joindre le nom de la catégorie
  image_url: string;
  download_link: string | null;
  is_popular: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Récupère toutes les catégories
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère tous les cours avec les noms de catégories associés
 */
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    return [];
  }

  // Formater les données pour inclure le nom de la catégorie
  return (data || []).map(item => ({
    ...item,
    category: item.categories ? item.categories.name : null,
  }));
}

/**
 * Récupère les cours filtrés par catégorie
 */
export async function getCoursesByCategory(categoryName: string): Promise<Course[]> {
  // D'abord, récupérer l'ID de la catégorie
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (categoryError || !categoryData) {
    console.error('Erreur lors de la récupération de la catégorie:', categoryError);
    return [];
  }

  const categoryId = categoryData.id;

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des cours par catégorie:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    category: item.categories ? item.categories.name : null,
  }));
}

/**
 * Récupère un cours par son ID
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `)
    .eq('id', courseId)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération du cours ${courseId}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    category: data.categories ? data.categories.name : null,
  };
}

/**
 * Récupère toutes les ressources avec les noms de catégories associés
 */
export async function getResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      categories(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des ressources:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    category: item.categories ? item.categories.name : null,
  }));
}

/**
 * Récupère les ressources filtrées par catégorie
 */
export async function getResourcesByCategory(categoryName: string): Promise<Resource[]> {
  // D'abord, récupérer l'ID de la catégorie
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (categoryError || !categoryData) {
    console.error('Erreur lors de la récupération de la catégorie:', categoryError);
    return [];
  }

  const categoryId = categoryData.id;

  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      categories(name)
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des ressources par catégorie:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    category: item.categories ? item.categories.name : null,
  }));
}

/**
 * Récupère les ressources filtrées par type
 */
export async function getResourcesByType(type: string): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      categories(name)
    `)
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des ressources par type:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    category: item.categories ? item.categories.name : null,
  }));
}

/**
 * Récupère une ressource par son ID
 */
export async function getResourceById(resourceId: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      categories(name)
    `)
    .eq('id', resourceId)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération de la ressource ${resourceId}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    category: data.categories ? data.categories.name : null,
  };
} 