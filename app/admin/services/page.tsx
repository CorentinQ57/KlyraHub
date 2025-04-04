'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category_id: string
  created_at: string
  image_url: string | null
  active: boolean
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export default function AdminServices() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  
  // Nouveaux services
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceDescription, setNewServiceDescription] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')
  const [newServiceCategoryId, setNewServiceCategoryId] = useState('')
  const [newServiceImage, setNewServiceImage] = useState<File | null>(null)
  
  // Nouvelle catégorie
  const [newCategoryName, setNewCategoryName] = useState('')
  
  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])
  
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(id, name)
        `)
        .order('name')
      
      if (error) throw error
      
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      })
    }
  }
  
  const addService = async () => {
    try {
      if (!newServiceName || !newServiceDescription || !newServicePrice || !newServiceDuration || !newServiceCategoryId) {
        return toast({
          title: "Champs manquants",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        })
      }
      
      let imageUrl = null
      
      // Upload image if provided
      if (newServiceImage) {
        const fileExt = newServiceImage.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `services/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, newServiceImage)
          
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)
          
        imageUrl = urlData.publicUrl
      }
      
      // Add service to database
      const { error } = await supabase
        .from('services')
        .insert({
          name: newServiceName,
          description: newServiceDescription,
          price: parseFloat(newServicePrice),
          duration: parseInt(newServiceDuration),
          category_id: newServiceCategoryId,
          image_url: imageUrl,
          active: true
        })
        
      if (error) throw error
      
      toast({
        title: "Service ajouté",
        description: "Le service a été ajouté avec succès"
      })
      
      // Reset form
      setNewServiceName('')
      setNewServiceDescription('')
      setNewServicePrice('')
      setNewServiceDuration('')
      setNewServiceCategoryId('')
      setNewServiceImage(null)
      setShowAddService(false)
      
      // Refresh services
      fetchServices()
      
    } catch (error) {
      console.error('Error adding service:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le service",
        variant: "destructive"
      })
    }
  }
  
  const addCategory = async () => {
    try {
      if (!newCategoryName) {
        return toast({
          title: "Champ manquant",
          description: "Veuillez entrer un nom de catégorie",
          variant: "destructive"
        })
      }
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName
        })
        
      if (error) throw error
      
      toast({
        title: "Catégorie ajoutée",
        description: "La catégorie a été ajoutée avec succès"
      })
      
      // Reset form
      setNewCategoryName('')
      setShowAddCategory(false)
      
      // Refresh categories
      fetchCategories()
      
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la catégorie",
        variant: "destructive"
      })
    }
  }
  
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentStatus })
        .eq('id', serviceId)
        
      if (error) throw error
      
      toast({
        title: "Statut modifié",
        description: `Le service est maintenant ${!currentStatus ? 'actif' : 'inactif'}`
      })
      
      // Refresh services
      fetchServices()
      
    } catch (error) {
      console.error('Error toggling service status:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du service",
        variant: "destructive"
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des services...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Services</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddCategory(true)}>
            Ajouter une catégorie
          </Button>
          <Button onClick={() => setShowAddService(true)}>
            Ajouter un service
          </Button>
        </div>
      </div>
      
      {/* Formulaire d'ajout de catégorie */}
      {showAddCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une catégorie</CardTitle>
            <CardDescription>Créer une nouvelle catégorie de service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-klyra focus:ring-klyra"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddCategory(false)
                    setNewCategoryName('')
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={addCategory}>
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Formulaire d'ajout de service */}
      {showAddService && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un service</CardTitle>
            <CardDescription>Créer un nouveau service dans la marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-klyra focus:ring-klyra"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-klyra focus:ring-klyra"
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-klyra focus:ring-klyra"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durée (jours)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-klyra focus:ring-klyra"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-klyra focus:ring-klyra"
                  value={newServiceCategoryId}
                  onChange={(e) => setNewServiceCategoryId(e.target.value)}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-klyra-50 file:text-klyra-700 hover:file:bg-klyra-100"
                  onChange={(e) => setNewServiceImage(e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddService(false)
                    setNewServiceName('')
                    setNewServiceDescription('')
                    setNewServicePrice('')
                    setNewServiceDuration('')
                    setNewServiceCategoryId('')
                    setNewServiceImage(null)
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={addService}>
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Liste des catégories */}
      <div>
        <h2 className="text-xl font-bold mb-4">Catégories ({categories.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>ID: {category.id.slice(0, 8)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Liste des services */}
      <div>
        <h2 className="text-xl font-bold mb-4">Services ({services.length})</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {service.image_url && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={service.image_url}
                              alt={service.name}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {service.description.substring(0, 50)}
                            {service.description.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.price}€
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.duration} jours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {service.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/services/${service.id}`}>
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        </Link>
                        <Button
                          variant={service.active ? "outline" : "default"}
                          size="sm"
                          className={service.active ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
                          onClick={() => toggleServiceStatus(service.id, service.active)}
                        >
                          {service.active ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 