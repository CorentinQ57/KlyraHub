'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileEdit, 
  Trash2, 
  PlusCircle, 
  Tag, 
  Check, 
  X,
  BookOpen,
  ChevronLeft,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { Course, getCategories, getCourses } from '@/lib/academy-service';
import { supabase } from '@/lib/supabase';

type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

interface CourseFormData {
  id?: string;
  title: string;
  category_id: string;
  level: CourseLevel;
  duration: string;
  lessons: number;
  video_url: string | null;
  description: string;
  objectives: string[];
  is_popular: boolean;
}

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'Débutant' as 'Débutant' | 'Intermédiaire' | 'Avancé',
    duration: '',
    lessons: 0,
    is_popular: false,
    is_new: false,
    tags: [] as string[],
    objectives: [] as string[],
    objectiveInput: '',
    image: null as File | null,
    video_url: '',
  });
  
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (user && isAdmin) {
      loadData();
    }
  }, [user, authLoading, isAdmin, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les cours
      const coursesData = await getCourses();
      setCourses(coursesData);
      
      // Charger les catégories pour le formulaire
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !courseData.tags.includes(tagInput.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleAddObjective = () => {
    if (courseData.objectiveInput.trim() && !courseData.objectives.includes(courseData.objectiveInput.trim())) {
      setCourseData(prev => ({
        ...prev,
        objectives: [...prev.objectives, prev.objectiveInput.trim()],
        objectiveInput: '',
      }));
    }
  };

  const handleRemoveObjective = (objective: string) => {
    setCourseData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(o => o !== objective),
    }));
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean | string[] | null) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingCourse?.image_url;
      let videoUrl = editingCourse?.video_url;

      // Gérer l'URL vidéo si fournie
      if (courseData.video_url) {
        videoUrl = courseData.video_url;
      }

      // Gérer l'image si fournie
      if (courseData.image) {
        const fileExt = courseData.image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('klyra-academy')
          .upload(filePath, courseData.image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('klyra-academy')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const courseDataToSave = {
        title: courseData.title,
        description: courseData.description,
        category_id: courseData.category_id,
        level: courseData.level,
        duration: courseData.duration,
        lessons: courseData.lessons,
        image_url: imageUrl,
        video_url: videoUrl,
        is_popular: courseData.is_popular,
        is_new: courseData.is_new,
        tags: courseData.tags,
        objectives: courseData.objectives,
        updated_at: new Date().toISOString(),
      };

      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseDataToSave)
          .eq('id', editingCourse.id);

        if (error) {
          throw error;
        }
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert({
            ...courseDataToSave,
            created_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Succès',
        description: `Cours ${editingCourse ? 'modifié' : 'créé'} avec succès.`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le cours.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      // Vérifier les modules et leçons associés
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);

      if (modulesError) {
        throw modulesError;
      }

      if (modules && modules.length > 0) {
        // Il faudrait idéalement supprimer toutes les leçons associées aux modules
        const moduleIds = modules.map(m => m.id);
        
        // Supprimer les leçons
        const { error: lessonsError } = await supabase
          .from('course_lessons')
          .delete()
          .in('module_id', moduleIds);
        
        if (lessonsError) {
          throw lessonsError;
        }
        
        // Supprimer les modules
        const { error: deleteModulesError } = await supabase
          .from('course_modules')
          .delete()
          .eq('course_id', courseId);
        
        if (deleteModulesError) {
          throw deleteModulesError;
        }
      }

      // Supprimer le cours
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Succès',
        description: 'Cours supprimé avec succès.',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le cours.',
        variant: 'destructive',
      });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseData({
      title: course.title,
      description: course.description || '',
      category_id: course.category_id,
      level: course.level,
      duration: course.duration.toString(),
      lessons: course.lessons,
      is_popular: course.is_popular,
      is_new: course.is_new,
      tags: course.tags || [],
      objectives: course.objectives || [],
      objectiveInput: '',
      image: null,
      video_url: course.video_url || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setCourseData({
      title: '',
      description: '',
      category_id: '',
      level: 'Débutant',
      duration: '',
      lessons: 0,
      is_popular: false,
      is_new: false,
      tags: [],
      objectives: [],
      objectiveInput: '',
      image: null,
      video_url: '',
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <Link 
            href="/dashboard/admin/academy" 
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour à la gestion de l'academy
          </Link>
          <h1 className="text-3xl font-bold">Gestion des cours</h1>
          <p className="text-muted-foreground">Gérez les cours disponibles dans l'academy.</p>
        </div>
        <Button onClick={handleOpenDialog} className="mt-4 sm:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un cours
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <Table>
            <TableCaption>Liste des cours de l'academy</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Leçons</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-20" />
                    <p>Aucun cours trouvé</p>
                    <Button variant="link" onClick={handleOpenDialog} className="mt-2">
                      Ajouter votre premier cours
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      {course.image_url ? (
                        <div className="relative h-10 w-12 rounded overflow-hidden bg-gray-100">
                          <Image 
                            src={course.image_url} 
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-12 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{course.title}</div>
                    </TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>
                      <Badge className={
                        course.level === 'Débutant' ? 'bg-green-500' : 
                          course.level === 'Intermédiaire' ? 'bg-blue-500' : 
                            'bg-purple-500'
                      }>
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>{course.lessons}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {course.is_new && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Nouveau
                          </Badge>
                        )}
                        {course.is_popular && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Populaire
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/dashboard/admin/academy/courses/${course.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Gérer les modules et leçons"
                        >
                          <Layers className="h-4 w-4" />
                          <span className="sr-only">Gérer les modules et leçons</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCourse(course)}
                        title="Modifier le cours"
                      >
                        <FileEdit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Supprimer le cours"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Modifier le cours' : 'Ajouter un nouveau cours'}
            </DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour {editingCourse ? 'modifier' : 'ajouter'} un cours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <Label htmlFor="title">Titre du cours</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Entrez le titre du cours"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={courseData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  placeholder="Entrez la catégorie du cours"
                />
              </div>

              <div>
                <Label htmlFor="level">Niveau</Label>
                <Select
                  value={courseData.level}
                  onValueChange={(value) => handleInputChange('level', value as 'Débutant' | 'Intermédiaire' | 'Avancé')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Durée totale</Label>
                <Input
                  id="duration"
                  value={courseData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Ex: 2h30"
                />
              </div>

              <div>
                <Label htmlFor="lessons">Nombre de leçons</Label>
                <Input
                  id="lessons"
                  type="number"
                  value={courseData.lessons}
                  onChange={(e) => handleInputChange('lessons', parseInt(e.target.value))}
                  placeholder="Entrez le nombre de leçons"
                />
              </div>

              <div>
                <Label htmlFor="image">Image du cours</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {courseData.image && (
                  <img
                    src={URL.createObjectURL(courseData.image)}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="video">Vidéo de présentation (optionnel)</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleInputChange('video_url', e.target.files![0]?.name)}
                />
                {courseData.video_url && (
                  <video
                    src={courseData.video_url}
                    controls
                    className="mt-2 max-w-xs rounded"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez le contenu du cours"
                  className="h-32"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {courseData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Ajouter un tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Objectifs d'apprentissage</Label>
                <div className="flex flex-wrap gap-2">
                  {courseData.objectives.map((objective: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...courseData.objectives];
                          newObjectives[index] = e.target.value;
                          handleInputChange('objectives', newObjectives);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newObjectives = courseData.objectives.filter((_: string, i: number) => i !== index);
                          handleInputChange('objectives', newObjectives);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleInputChange('objectives', [...courseData.objectives, '']);
                  }}
                >
                  Ajouter un objectif
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_popular"
                  checked={courseData.is_popular}
                  onCheckedChange={(checked) => handleInputChange('is_popular', checked)}
                />
                <Label htmlFor="is_popular">Marquer comme populaire</Label>
              </div>
            </div>

            <DialogFooter className="flex space-x-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingCourse ? 'Mettre à jour' : 'Créer le cours'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 