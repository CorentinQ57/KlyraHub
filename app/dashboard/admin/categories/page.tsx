"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string;
  name: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  services_count?: number;
}

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
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
      loadCategories()
    }
  }, [user, authLoading, isAdmin, router])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      
      // Récupérer les catégories avec le comptage des services
      const { data: categoriesWithCount, error: countError } = await supabase
        .from('categories')
        .select(`
          *,
          services_count:services(count)
        `)
        .order('name')

      if (countError) throw countError

      // Formater les données pour inclure le comptage
      const formattedCategories = (categoriesWithCount || []).map(cat => ({
        ...cat,
        services_count: cat.services_count?.[0]?.count || 0
      }))

      setCategories(formattedCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let imageUrl = editingCategory?.image_url

      // Upload new image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = fileName // Pas besoin de sous-dossier car nous avons un bucket dédié

        const { error: uploadError } = await supabase.storage
          .from('klyra-categories')
          .upload(filePath, formData.image)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('klyra-categories')
          .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      }

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)

        if (error) throw error
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      toast({
        title: "Succès",
        description: `Catégorie ${editingCategory ? 'modifiée' : 'créée'} avec succès.`,
      })

      setIsDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: '', image: null })
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la catégorie.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return
    }

    try {
      // Check if category is used by any services
      const { data: services, error: checkError } = await supabase
        .from('services')
        .select('id')
        .eq('category_id', categoryId)

      if (checkError) throw checkError

      if (services && services.length > 0) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la catégorie car elle est utilisée par des services.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès.",
      })

      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image: null
    })
    setIsDialogOpen(true)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des catégories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <Link 
            href="/dashboard/admin" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour à l'administration
          </Link>
          <h1 className="text-3xl font-bold mt-4">Gestion des catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de services disponibles dans la marketplace
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', image: null })
            setIsDialogOpen(true)
          }}
          className="mt-4 sm:mt-0"
        >
          Ajouter une catégorie
        </Button>
      </div>

      <Card>
        <Table>
          <TableCaption>Liste des catégories ({categories.length})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Services associés</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-2xl">📁</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {category.services_count} service{category.services_count !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        Éditer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Aucune catégorie disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Modifiez les informations de la catégorie'
                : 'Créez une nouvelle catégorie de services'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Design Web"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image de la catégorie</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {editingCategory?.image_url && !formData.image && (
                <p className="text-sm text-muted-foreground">
                  Une image est déjà associée à cette catégorie
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingCategory ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 