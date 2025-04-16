"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FileEdit, 
  Trash2, 
  PlusCircle, 
  Tag, 
  ChevronLeft,
  BookOpen,
  Video,
  FileText,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Plus,
  Clock,
  Lock,
  Unlock,
  GripVertical,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { Course, CourseModule, CourseLesson, getCourseById, getCourseModules } from '@/lib/academy-service'
import { supabase } from '@/lib/supabase'

export default function CourseModulesManagementPage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // États pour les dialogues
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null)
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null)
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null)
  
  // Formulaire module
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1
  })
  
  // Formulaire leçon
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '',
    type: 'video' as 'video' | 'text' | 'quiz',
    content: '',
    video_url: '',
    is_free: false,
    order: 1
  })
  
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin && courseId) {
      loadData()
    }
  }, [user, authLoading, isAdmin, router, courseId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les informations du cours
      const courseData = await getCourseById(courseId)
      if (!courseData) {
        toast({
          title: "Erreur",
          description: "Cours introuvable",
          variant: "destructive",
        })
        router.push('/dashboard/admin/academy/courses')
        return
      }
      setCourse(courseData)
      
      // Charger les modules et leçons
      const modulesData = await getCourseModules(courseId)
      setModules(modulesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Gestion des modules
  const openAddModuleDialog = () => {
    setEditingModule(null)
    setModuleForm({
      title: '',
      description: '',
      order: modules.length + 1
    })
    setIsModuleDialogOpen(true)
  }

  const openEditModuleDialog = (module: CourseModule) => {
    setEditingModule(module)
    setModuleForm({
      title: module.title,
      description: module.description || '',
      order: module.order
    })
    setIsModuleDialogOpen(true)
  }

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const moduleData = {
        title: moduleForm.title,
        description: moduleForm.description,
        order: moduleForm.order,
        course_id: courseId,
        updated_at: new Date().toISOString()
      }

      if (editingModule) {
        // Mettre à jour un module existant
        const { error } = await supabase
          .from('course_modules')
          .update(moduleData)
          .eq('id', editingModule.id)

        if (error) throw error
        
        toast({
          title: "Succès",
          description: "Module mis à jour avec succès",
        })
      } else {
        // Créer un nouveau module
        const { error } = await supabase
          .from('course_modules')
          .insert({
            ...moduleData,
            created_at: new Date().toISOString(),
          })

        if (error) throw error
        
        toast({
          title: "Succès",
          description: "Module créé avec succès",
        })
      }

      setIsModuleDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error('Error saving module:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le module.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ? Toutes les leçons associées seront également supprimées.")) {
      return
    }

    try {
      const { error } = await supabase
        .from('course_modules')
        .delete()
        .eq('id', moduleId)

      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Module supprimé avec succès",
      })
      
      await loadData()
    } catch (error) {
      console.error('Error deleting module:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le module.",
        variant: "destructive",
      })
    }
  }

  // Gestion des leçons
  const openAddLessonDialog = (moduleId: string) => {
    setEditingLesson(null)
    setCurrentModuleId(moduleId)
    
    // Trouver le module pour déterminer l'ordre
    const currentModule = modules.find(m => m.id === moduleId)
    const nextOrder = currentModule ? currentModule.lessons.length + 1 : 1
    
    setLessonForm({
      title: '',
      description: '',
      duration: '',
      type: 'video',
      content: '',
      video_url: '',
      is_free: false,
      order: nextOrder
    })
    
    setIsLessonDialogOpen(true)
  }

  const openEditLessonDialog = (lesson: CourseLesson, moduleId: string) => {
    setEditingLesson(lesson)
    setCurrentModuleId(moduleId)
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration,
      type: lesson.type,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      is_free: lesson.is_free,
      order: lesson.order
    })
    setIsLessonDialogOpen(true)
  }

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentModuleId) return
    
    try {
      const lessonData = {
        title: lessonForm.title,
        description: lessonForm.description,
        duration: lessonForm.duration,
        type: lessonForm.type,
        content: lessonForm.content,
        video_url: lessonForm.video_url,
        is_free: lessonForm.is_free,
        order: lessonForm.order,
        module_id: currentModuleId,
        updated_at: new Date().toISOString()
      }

      if (editingLesson) {
        // Mettre à jour une leçon existante
        const { error } = await supabase
          .from('course_lessons')
          .update(lessonData)
          .eq('id', editingLesson.id)

        if (error) throw error
        
        toast({
          title: "Succès",
          description: "Leçon mise à jour avec succès",
        })
      } else {
        // Créer une nouvelle leçon
        const { error } = await supabase
          .from('course_lessons')
          .insert({
            ...lessonData,
            created_at: new Date().toISOString(),
          })

        if (error) throw error
        
        toast({
          title: "Succès",
          description: "Leçon créée avec succès",
        })
      }

      setIsLessonDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error('Error saving lesson:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la leçon.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette leçon ?")) {
      return
    }

    try {
      const { error } = await supabase
        .from('course_lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Leçon supprimée avec succès",
      })
      
      await loadData()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la leçon.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour obtenir l'icône du type de leçon
  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Fonction pour déplacer un module vers le haut ou le bas
  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId)
    if (
      (direction === 'up' && moduleIndex === 0) || 
      (direction === 'down' && moduleIndex === modules.length - 1)
    ) {
      return
    }

    const currentModule = modules[moduleIndex]
    const newOrder = direction === 'up' 
      ? currentModule.order - 1 
      : currentModule.order + 1
    
    const otherModuleIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1
    const otherModule = modules[otherModuleIndex]
    
    try {
      // Mettre à jour les deux modules concernés
      const promises = [
        supabase
          .from('course_modules')
          .update({ order: newOrder })
          .eq('id', currentModule.id),
        supabase
          .from('course_modules')
          .update({ order: currentModule.order })
          .eq('id', otherModule.id)
      ]
      
      const results = await Promise.all(promises)
      const errors = results.flatMap(r => r.error ? [r.error] : [])
      
      if (errors.length > 0) {
        throw errors[0]
      }
      
      await loadData()
    } catch (error) {
      console.error('Error reordering modules:', error)
      toast({
        title: "Erreur",
        description: "Impossible de réorganiser les modules.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour déplacer une leçon vers le haut ou le bas
  const moveLesson = async (lessonId: string, moduleId: string, direction: 'up' | 'down') => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return
    
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId)
    if (
      (direction === 'up' && lessonIndex === 0) || 
      (direction === 'down' && lessonIndex === module.lessons.length - 1)
    ) {
      return
    }

    const currentLesson = module.lessons[lessonIndex]
    const newOrder = direction === 'up' 
      ? currentLesson.order - 1 
      : currentLesson.order + 1
    
    const otherLessonIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1
    const otherLesson = module.lessons[otherLessonIndex]
    
    try {
      // Mettre à jour les deux leçons concernées
      const promises = [
        supabase
          .from('course_lessons')
          .update({ order: newOrder })
          .eq('id', currentLesson.id),
        supabase
          .from('course_lessons')
          .update({ order: currentLesson.order })
          .eq('id', otherLesson.id)
      ]
      
      const results = await Promise.all(promises)
      const errors = results.flatMap(r => r.error ? [r.error] : [])
      
      if (errors.length > 0) {
        throw errors[0]
      }
      
      await loadData()
    } catch (error) {
      console.error('Error reordering lessons:', error)
      toast({
        title: "Erreur",
        description: "Impossible de réorganiser les leçons.",
        variant: "destructive",
      })
    }
  }

  // Mise à jour du nombre de leçons dans le cours
  const updateCourseInfo = async () => {
    // Calculer le nombre total de leçons
    const totalLessons = modules.reduce((count, module) => count + module.lessons.length, 0)
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          lessons: totalLessons,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)

      if (error) throw error
      
      // Recharger les données du cours
      const courseData = await getCourseById(courseId)
      if (courseData) {
        setCourse(courseData)
      }
    } catch (error) {
      console.error('Error updating course info:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations du cours.",
        variant: "destructive",
      })
    }
  }

  // Mise à jour automatique du nombre de leçons lorsque les modules ou leçons changent
  useEffect(() => {
    if (modules.length > 0) {
      updateCourseInfo()
    }
  }, [modules])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Cours introuvable</h2>
            <p className="text-muted-foreground mb-4">Le cours demandé n'existe pas ou a été supprimé.</p>
            <Link href="/dashboard/admin/academy/courses">
              <Button>Retour à la liste des cours</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8">
        <div>
          <Link 
            href="/dashboard/admin/academy/courses" 
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour à la liste des cours
          </Link>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">
            Gérez les modules et leçons pour ce cours
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center">
          <Button onClick={openAddModuleDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un module
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informations du cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                <p>{course.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Niveau</p>
                <Badge className={
                  course.level === 'Débutant' ? 'bg-green-500' : 
                  course.level === 'Intermédiaire' ? 'bg-blue-500' : 
                  'bg-purple-500'
                }>
                  {course.level}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre de leçons</p>
                <p>{modules.reduce((count, module) => count + module.lessons.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {modules.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucun module trouvé</h3>
            <p className="text-muted-foreground text-center mb-4">
              Ce cours ne contient encore aucun module. Ajoutez votre premier module pour commencer.
            </p>
            <Button onClick={openAddModuleDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={modules.map((_, i) => `module-${i}`)} className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <AccordionItem 
              key={module.id} 
              value={`module-${moduleIndex}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex flex-1 items-center">
                  <GripVertical className="h-4 w-4 text-muted-foreground mr-2 opacity-50" />
                  <span className="font-medium">{module.title}</span>
                  <Badge variant="outline" className="ml-2">
                    {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 pb-4 space-y-4">
                  {module.description && (
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => moveModule(module.id, 'up')}
                      disabled={moduleIndex === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="sr-only">Déplacer vers le haut</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => moveModule(module.id, 'down')}
                      disabled={moduleIndex === modules.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="sr-only">Déplacer vers le bas</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModuleDialog(module)}
                    >
                      <FileEdit className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Leçons</h4>
                      <Button 
                        size="sm"
                        onClick={() => openAddLessonDialog(module.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une leçon
                      </Button>
                    </div>
                    
                    {module.lessons.length === 0 ? (
                      <div className="bg-muted/50 rounded-md p-4 text-center">
                        <p className="text-sm text-muted-foreground">Aucune leçon dans ce module</p>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => openAddLessonDialog(module.id)}
                        >
                          Ajouter votre première leçon
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <Card key={lesson.id} className="border-none shadow-none bg-muted/30">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                    {getLessonTypeIcon(lesson.type)}
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1">{lesson.title}</p>
                                    <div className="flex items-center text-xs text-muted-foreground space-x-3">
                                      <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {lesson.duration}
                                      </div>
                                      {lesson.is_free ? (
                                        <div className="flex items-center text-green-600">
                                          <Unlock className="h-3 w-3 mr-1" />
                                          Leçon gratuite
                                        </div>
                                      ) : (
                                        <div className="flex items-center">
                                          <Lock className="h-3 w-3 mr-1" />
                                          Accès restreint
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => moveLesson(lesson.id, module.id, 'up')}
                                    disabled={lessonIndex === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                    <span className="sr-only">Déplacer vers le haut</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => moveLesson(lesson.id, module.id, 'down')}
                                    disabled={lessonIndex === module.lessons.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                    <span className="sr-only">Déplacer vers le bas</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openEditLessonDialog(lesson, module.id)}
                                  >
                                    <FileEdit className="h-4 w-4" />
                                    <span className="sr-only">Modifier</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Supprimer</span>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Dialog pour ajouter/modifier un module */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Modifier le module' : 'Ajouter un module'}
            </DialogTitle>
            <DialogDescription>
              {editingModule 
                ? 'Modifiez les informations du module'
                : 'Remplissez le formulaire pour ajouter un nouveau module au cours'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleModuleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Titre du module *</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-order">Ordre d'affichage *</Label>
              <Input
                id="module-order"
                type="number"
                value={moduleForm.order}
                onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                min={1}
                required
              />
              <p className="text-xs text-muted-foreground">
                Détermine l'ordre d'affichage du module dans le cours.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingModule ? 'Mettre à jour' : 'Ajouter le module'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier une leçon */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Modifier la leçon' : 'Ajouter une leçon'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson 
                ? 'Modifiez les informations de la leçon'
                : 'Remplissez le formulaire pour ajouter une nouvelle leçon au module'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLessonSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Titre de la leçon *</Label>
                <Input
                  id="lesson-title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Durée approximative *</Label>
                <Input
                  id="lesson-duration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="Ex: 15-20 min"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-type">Type de contenu *</Label>
                <Select 
                  value={lessonForm.type} 
                  onValueChange={(value: 'video' | 'text' | 'quiz') => 
                    setLessonForm({ ...lessonForm, type: value })
                  }
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

              <div className="space-y-2">
                <Label htmlFor="lesson-order">Ordre d'affichage *</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                rows={2}
              />
            </div>

            {lessonForm.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="lesson-video-url">URL de la vidéo</Label>
                <Input
                  id="lesson-video-url"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Ajoutez l'URL de la vidéo YouTube, Vimeo ou autre.
                </p>
              </div>
            )}

            {(lessonForm.type === 'text' || lessonForm.type === 'quiz') && (
              <div className="space-y-2">
                <Label htmlFor="lesson-content">Contenu</Label>
                <Textarea
                  id="lesson-content"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  rows={8}
                  placeholder={
                    lessonForm.type === 'text' 
                      ? "Entrez le contenu textuel de la leçon (supporte le markdown)"
                      : "Entrez les questions du quiz au format JSON ou texte structuré"
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="lesson-is-free"
                checked={lessonForm.is_free}
                onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_free: checked })}
              />
              <Label htmlFor="lesson-is-free">Leçon gratuite (accessible sans inscription)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingLesson ? 'Mettre à jour' : 'Ajouter la leçon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 