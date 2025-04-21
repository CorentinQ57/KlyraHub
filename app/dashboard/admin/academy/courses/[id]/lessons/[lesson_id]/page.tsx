"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { getLessonById, createCourseLesson, updateCourseLesson } from '@/lib/academy-service'
import { useAuth } from '@/lib/auth'

// Types
type LessonType = 'video' | 'text' | 'quiz';

interface LessonFormProps {
  courseId: string;
  lesson?: any;
  moduleId: string;
}

interface PageProps {
  params: {
    id: string;
    lesson_id: string;
  }
}

const LessonForm = ({ courseId, lesson, moduleId }: LessonFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [duration, setDuration] = useState(lesson?.duration || '');
  const [type, setType] = useState<LessonType>(lesson?.type || 'video');
  const [content, setContent] = useState(lesson?.content || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const lessonData = {
        title,
        description,
        duration,
        type,
        content: type === 'text' ? content : null,
        video_url: type === 'video' ? videoUrl : null,
        module_id: moduleId,
        order: lesson?.order || 1,
      };
      
      let response;
      
      if (lesson) {
        // Update existing lesson
        response = await updateCourseLesson(lesson.id, lessonData);
      } else {
        // Create new lesson
        response = await createCourseLesson(lessonData);
      }
      
      if (response) {
        router.push(`/dashboard/admin/academy/courses/${courseId}`);
        toast({
          title: lesson ? "Leçon mise à jour" : "Leçon créée",
          description: lesson ? "La leçon a été mise à jour avec succès." : "La leçon a été créée avec succès.",
        });
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la leçon.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la leçon"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la leçon"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Durée *</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 10:30"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">Format: MM:SS</p>
          </div>
          
          <div>
            <Label htmlFor="type">Type de contenu *</Label>
            <Select
              value={type}
              onValueChange={(value: LessonType) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {type === 'video' && (
            <div>
              <Label htmlFor="videoUrl">URL de la vidéo</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          )}
          
          {type === 'text' && (
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu de la leçon en texte..."
                rows={8}
              />
            </div>
          )}
          
          {type === 'quiz' && (
            <div className="p-4 border rounded-md bg-yellow-50 text-yellow-700">
              <p>La fonctionnalité de quiz sera disponible prochainement.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/admin/academy/courses/${courseId}`)}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {lesson ? 'Mettre à jour' : 'Créer'} la leçon
        </Button>
      </div>
    </form>
  );
};

export default function LessonPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const { id: courseId, lesson_id } = params;
  const isNewLesson = lesson_id === 'new';
  const moduleId = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('moduleId') || '';
  
  useEffect(() => {
    // Si on crée une nouvelle leçon, on n'a pas besoin de charger de données
    if (isNewLesson) {
      setLoading(false);
      return;
    }
    
    // Sinon, on charge les données de la leçon existante
    const fetchLessonData = async () => {
      try {
        const lessonData = await getLessonById(lesson_id);
        if (!lessonData) {
          toast({
            title: "Erreur",
            description: "Impossible de trouver cette leçon",
            variant: "destructive",
          });
          router.push(`/dashboard/admin/academy/courses/${courseId}`);
          return;
        }
        
        setLesson(lessonData);
      } catch (error) {
        console.error("Erreur lors du chargement de la leçon:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement de la leçon",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [courseId, lesson_id, isNewLesson, router, toast]);
  
  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader 
        title={isNewLesson ? "Ajouter une leçon" : "Modifier une leçon"}
        description={isNewLesson ? "Créer une nouvelle leçon pour ce cours" : "Modifier les informations de cette leçon"}
      >
        <Link href={`/dashboard/admin/academy/courses/${courseId}`}>
          <Button variant="outline">
            Retour au cours
          </Button>
        </Link>
      </PageHeader>
      
      <PageSection>
        <ContentCard>
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <LessonForm 
              courseId={courseId}
              lesson={!isNewLesson ? lesson : undefined}
              moduleId={moduleId}
            />
          )}
        </ContentCard>
      </PageSection>
    </PageContainer>
  );
} 