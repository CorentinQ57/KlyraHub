import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  video_url?: string; // URL vidéo YouTube/Vimeo
  is_popular: boolean;
  is_new: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  content?: string; // Contenu détaillé du cours
  objectives?: string[]; // Objectifs d'apprentissage
  modules?: CourseModule[]; // Modules du cours
};

export type CourseModule = {
  id: string;
  title: string;
  description?: string;
  order: number;
  course_id: string;
  lessons: CourseLesson[];
};

export type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  duration: string;
  type: 'video' | 'text' | 'quiz';
  content?: string;
  video_url?: string;
  order: number;
  module_id: string;
  is_free?: boolean;
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

/**
 * Récupère les modules et leçons d'un cours
 */
export async function getCourseModules(courseId: string): Promise<CourseModule[]> {
  const { data, error } = await supabase
    .from('course_modules')
    .select(`
      *,
      course_lessons(*)
    `)
    .eq('course_id', courseId)
    .order('order');

  if (error) {
    console.error(`Erreur lors de la récupération des modules du cours ${courseId}:`, error);
    return [];
  }

  if (!data || data.length === 0) {
    // Si aucun module n'est trouvé, on crée un vrai module dans la base de données
    const course = await getCourseById(courseId);
    if (!course) return [];
    
    try {
      // Créer un vrai module dans la base de données
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          title: 'Module principal',
          description: 'Ce module contient toutes les leçons du cours',
          order: 1,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (moduleError || !moduleData) {
        console.error(`Erreur lors de la création du module pour le cours ${courseId}:`, moduleError);
        return [];
      }

      // On récupère l'id du module créé
      const moduleId = moduleData.id;
      
      // On crée les leçons factices avec de vrais UUIDs
      const fakeLessons: CourseLesson[] = [];
      for (let i = 0; i < (course.lessons || 3); i++) {
        const lessonData = {
          title: `Leçon ${i + 1}`,
          description: 'Description de la leçon',
          duration: '15-20 min',
          type: 'video' as 'video' | 'text' | 'quiz',
          order: i + 1,
          module_id: moduleId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: lessonResult, error: lessonError } = await supabase
          .from('course_lessons')
          .insert(lessonData)
          .select()
          .single();
          
        if (!lessonError && lessonResult) {
          fakeLessons.push(lessonResult);
        } else {
          console.error('Erreur lors de la création d\'une leçon factice:', lessonError);
        }
      }
      
      // Retourner le nouveau module avec ses leçons
      return [{
        ...moduleData,
        lessons: fakeLessons,
      }];
    } catch (err) {
      console.error('Erreur lors de la création du module et des leçons:', err);
      return [];
    }
  }

  // Formater les données pour inclure les leçons triées par ordre
  return data.map(module => ({
    ...module,
    lessons: (module.course_lessons || []).sort((a: CourseLesson, b: CourseLesson) => a.order - b.order),
  }));
}

/**
 * Crée un nouveau module pour un cours
 */
export async function createCourseModule(moduleData: {
  title: string;
  description?: string;
  order: number;
  course_id: string;
}): Promise<CourseModule | null> {
  const { data, error } = await supabase
    .from('course_modules')
    .insert({
      ...moduleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création du module:', error);
    return null;
  }

  return {
    ...data,
    lessons: []
  };
}

/**
 * Met à jour un module existant
 */
export async function updateCourseModule(
  moduleId: string,
  moduleData: {
    title?: string;
    description?: string;
    order?: number;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('course_modules')
    .update({
      ...moduleData,
      updated_at: new Date().toISOString()
    })
    .eq('id', moduleId);

  if (error) {
    console.error(`Erreur lors de la mise à jour du module ${moduleId}:`, error);
    return false;
  }

  return true;
}

/**
 * Supprime un module et toutes ses leçons
 */
export async function deleteCourseModule(moduleId: string): Promise<boolean> {
  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', moduleId);

  if (error) {
    console.error(`Erreur lors de la suppression du module ${moduleId}:`, error);
    return false;
  }

  return true;
}

/**
 * Récupère une leçon par son ID
 */
export async function getLessonById(lessonId: string): Promise<CourseLesson | null> {
  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération de la leçon ${lessonId}:`, error);
    return null;
  }

  return data;
}

/**
 * Crée une nouvelle leçon dans un module
 */
export async function createCourseLesson(lessonData: {
  title: string;
  description?: string;
  duration: string;
  type: 'video' | 'text' | 'quiz';
  content?: string;
  video_url?: string;
  order: number;
  module_id: string;
}): Promise<CourseLesson | null> {
  const { data, error } = await supabase
    .from('course_lessons')
    .insert({
      ...lessonData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de la leçon:', error);
    return null;
  }

  // Mettre à jour le nombre de leçons dans le cours parent
  try {
    // D'abord, récupérer l'ID du cours
    const { data: moduleData, error: moduleError } = await supabase
      .from('course_modules')
      .select('course_id')
      .eq('id', lessonData.module_id)
      .single();

    if (!moduleError && moduleData) {
      const courseId = moduleData.course_id;
      
      // Puis compter le nombre total de leçons pour ce cours
      const { count, error: countError } = await supabase
        .from('course_lessons')
        .select('id', { count: 'exact' })
        .eq('module_id', lessonData.module_id);
      
      if (!countError && count !== null) {
        // Mettre à jour le cours avec le nouveau nombre
        await supabase
          .from('courses')
          .update({ 
            lessons: count,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId);
      }
    }
  } catch (updateError) {
    console.error('Erreur lors de la mise à jour du compte de leçons:', updateError);
  }

  return data;
}

/**
 * Met à jour une leçon existante
 */
export async function updateCourseLesson(
  lessonId: string,
  lessonData: {
    title?: string;
    description?: string;
    duration?: string;
    type?: 'video' | 'text' | 'quiz';
    content?: string;
    video_url?: string;
    order?: number;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('course_lessons')
    .update({
      ...lessonData,
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId);

  if (error) {
    console.error(`Erreur lors de la mise à jour de la leçon ${lessonId}:`, error);
    return false;
  }

  return true;
}

/**
 * Supprime une leçon
 */
export async function deleteCourseLesson(lessonId: string): Promise<boolean> {
  // D'abord, récupérer les informations de la leçon pour ensuite mettre à jour le compte dans le cours
  const { data: lessonData, error: lessonError } = await supabase
    .from('course_lessons')
    .select('module_id')
    .eq('id', lessonId)
    .single();

  if (lessonError) {
    console.error(`Erreur lors de la récupération des infos de la leçon ${lessonId}:`, lessonError);
    return false;
  }

  // Supprimer la leçon
  const { error } = await supabase
    .from('course_lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    console.error(`Erreur lors de la suppression de la leçon ${lessonId}:`, error);
    return false;
  }

  // Mettre à jour le nombre de leçons dans le cours parent
  try {
    if (lessonData) {
      const moduleId = lessonData.module_id;
      
      // Récupérer l'ID du cours
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .select('course_id')
        .eq('id', moduleId)
        .single();

      if (!moduleError && moduleData) {
        const courseId = moduleData.course_id;
        
        // Obtenir tous les modules du cours
        const { data: modulesData, error: modulesError } = await supabase
          .from('course_modules')
          .select('id')
          .eq('course_id', courseId);
        
        if (!modulesError && modulesData) {
          const moduleIds = modulesData.map(m => m.id);
          
          // Compter le nombre total de leçons pour ces modules
          const { count, error: countError } = await supabase
            .from('course_lessons')
            .select('id', { count: 'exact' })
            .in('module_id', moduleIds);
          
          if (!countError && count !== null) {
            // Mettre à jour le cours avec le nouveau nombre
            await supabase
              .from('courses')
              .update({ 
                lessons: count,
                updated_at: new Date().toISOString()
              })
              .eq('id', courseId);
          }
        }
      }
    }
  } catch (updateError) {
    console.error('Erreur lors de la mise à jour du compte de leçons:', updateError);
  }

  return true;
} 