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
  Check, 
  X,
  BookOpen,
  ChevronLeft 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { Course, getCategories, getCourses } from '@/lib/academy-service'
import { supabase } from '@/lib/supabase'

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState({
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
    image: null as File | null
  })
  
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadData()
    }
  }, [user, authLoading, isAdmin, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les cours
      const coursesData = await getCourses()
      setCourses(coursesData)
      
      // Charger les catégories pour le formulaire
      const categoriesData = await getCategories()
      setCategories(categoriesData)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleAddObjective = () => {
    if (formData.objectiveInput.trim() && !formData.objectives.includes(formData.objectiveInput.trim())) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, prev.objectiveInput.trim()],
        objectiveInput: ''
      }))
    }
  }

  const handleRemoveObjective = (objective: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(o => o !== objective)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let imageUrl = editingCourse?.image_url

      // Upload new image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = fileName

        const { error: uploadError } = await supabase.storage
          .from('klyra-academy')
          .upload(filePath, formData.image)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('klyra-academy')
          .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        level: formData.level,
        duration: formData.duration,
        lessons: formData.lessons,
        image_url: imageUrl,
        is_popular: formData.is_popular,
        is_new: formData.is_new,
        tags: formData.tags,
        objectives: formData.objectives,
        updated_at: new Date().toISOString()
      }

      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id)

        if (error) throw error
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert({
            ...courseData,
            created_at: new Date().toISOString(),
          })

        if (error) throw error
      }

      toast({
        title: "Succès",
        description: `Cours ${editingCourse ? 'modifié' : 'créé'} avec succès.`,
      })

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error saving course:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le cours.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return
    }

    try {
      // Vérifier les modules et leçons associés
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId)

      if (modulesError) throw modulesError

      if (modules && modules.length > 0) {
        // Il faudrait idéalement supprimer toutes les leçons associées aux modules
        const moduleIds = modules.map(m => m.id)
        
        // Supprimer les leçons
        const { error: lessonsError } = await supabase
          .from('course_lessons')
          .delete()
          .in('module_id', moduleIds)
        
        if (lessonsError) throw lessonsError
        
        // Supprimer les modules
        const { error: deleteModulesError } = await supabase
          .from('course_modules')
          .delete()
          .eq('course_id', courseId)
        
        if (deleteModulesError) throw deleteModulesError
      }

      // Supprimer le cours
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Cours supprimé avec succès.",
      })

      loadData()
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le cours.",
        variant: "destructive",
      })
    }
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      category_id: course.category_id,
      level: course.level,
      duration: course.duration,
      lessons: course.lessons,
      is_popular: course.is_popular,
      is_new: course.is_new,
      tags: course.tags || [],
      objectives: course.objectives || [],
      objectiveInput: '',
      image: null
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingCourse(null)
    setFormData({
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
      image: null
    })
  }

  const handleOpenDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des cours...</p>
        </div>
      </div>
    )
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCourse(course)}
                      >
                        <FileEdit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCourse(course.id)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du cours *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Niveau *</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value: 'Débutant' | 'Intermédiaire' | 'Avancé') => 
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée approximative *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Ex: 3h 30min"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessons">Nombre de leçons *</Label>
                <Input
                  id="lessons"
                  type="number"
                  value={formData.lessons}
                  onChange={(e) => setFormData({ ...formData, lessons: parseInt(e.target.value) })}
                  min={1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image du cours</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {editingCourse?.image_url && !formData.image && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="relative h-10 w-16 rounded overflow-hidden">
                      <Image 
                        src={editingCourse.image_url} 
                        alt="Image actuelle" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Image actuelle</span>
                  </div>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="tags">Tags (mots-clés)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Ajouter un tag"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="objectives">Objectifs d'apprentissage</Label>
                <div className="flex space-x-2">
                  <Input
                    id="objectives"
                    value={formData.objectiveInput}
                    onChange={(e) => setFormData({ ...formData, objectiveInput: e.target.value })}
                    placeholder="Ajouter un objectif"
                  />
                  <Button type="button" onClick={handleAddObjective}>
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-2 bg-gray-50 rounded p-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="flex-1">{objective}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(objective)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label htmlFor="is-popular">Marquer comme populaire</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                />
                <Label htmlFor="is-new">Marquer comme nouveau</Label>
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
  )
} 