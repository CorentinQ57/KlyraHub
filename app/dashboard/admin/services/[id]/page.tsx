"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { getServiceById, updateService, getAllCategories } from '@/lib/supabase'
import { Category, Service } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Schema de validation pour le formulaire
const serviceFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit comporter au moins 10 caractères.",
  }),
  long_description: z.string().optional(),
  category_id: z.string({
    required_error: "Veuillez sélectionner une catégorie.",
  }),
  price: z.coerce.number().min(0, {
    message: "Le prix ne peut pas être négatif.",
  }),
  duration: z.coerce.number().int().min(1, {
    message: "La durée doit être d'au moins 1 jour.",
  }),
  active: z.boolean(),
  features: z.string(),
  phases: z.string()
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

export default function EditServicePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [service, setService] = useState<Service | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const { toast } = useToast()

  // Initialisation du formulaire
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      long_description: "",
      category_id: "",
      price: 0,
      duration: 7,
      active: true,
      features: "",
      phases: "",
    },
  })

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadServiceAndCategories()
    }
  }, [user, authLoading, isAdmin, params.id, router])

  const loadServiceAndCategories = async () => {
    try {
      setIsLoading(true)
      
      // Chargement des données du service
      const serviceData = await getServiceById(params.id)
      if (!serviceData) {
        toast({
          title: "Erreur",
          description: "Service non trouvé.",
          variant: "destructive",
        })
        router.push('/dashboard/admin/services')
        return
      }
      
      setService(serviceData)
      
      // Chargement des catégories
      const categoriesData = await getAllCategories()
      setCategories(categoriesData)
      
      // Remplissage du formulaire avec les données du service
      form.reset({
        name: serviceData.name,
        description: serviceData.description,
        long_description: serviceData.long_description || '',
        category_id: serviceData.category_id.toString(),
        price: serviceData.price,
        duration: serviceData.duration,
        active: serviceData.active,
        features: Array.isArray(serviceData.features) ? serviceData.features.join('\n') : '',
        phases: Array.isArray(serviceData.phases) ? serviceData.phases.join('\n') : ''
      })
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

  const onSubmit = async (data: ServiceFormValues) => {
    if (!service) return
    
    try {
      setIsSubmitting(true)
      
      // Prépare les features et les phases comme des tableaux
      const featuresArray = data.features
        ? data.features.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        : [];
        
      const phasesArray = data.phases
        ? data.phases.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        : ["Briefing", "Conception", "Développement", "Tests et validation", "Livraison"];
      
      // Mise à jour du service sans le champ features qui n'existe pas dans la base de données
      const serviceUpdate = {
        name: data.name,
        description: data.description,
        long_description: data.long_description,
        category_id: data.category_id,
        price: data.price,
        duration: data.duration,
        active: data.active,
        features: featuresArray,
        phases: phasesArray
      };
      
      const updatedService = await updateService(service.id, serviceUpdate);
      
      if (updatedService) {
        toast({
          title: "Succès",
          description: "Service mis à jour avec succès.",
        })
        
        // Redirection vers la liste des services
        router.push('/dashboard/admin/services')
      } else {
        throw new Error('Échec de la mise à jour du service')
      }
    } catch (error) {
      console.error('Error updating service:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le service.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Service non trouvé</h1>
          <p className="mt-2 text-muted-foreground">Le service demandé n'existe pas.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/admin/services')}>
            Retour à la liste des services
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link 
          href="/dashboard/admin/services" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à la liste des services
        </Link>
        <h1 className="text-3xl font-bold mt-4">Modifier le service</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du service</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du service</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Logo Design Premium" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom affiché dans la marketplace
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Catégorie du service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Prix en euros (sans TVA)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (jours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Durée estimée en jours
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée du service..." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Description complète du service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description longue</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée du service..." 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Description complète du service (affichée sur la page détaillée)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Caractéristiques</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Une caractéristique par ligne..." 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Liste des caractéristiques du service (une par ligne)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phases"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Phases du projet</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Une phase par ligne..." 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Liste des phases du projet (une par ligne)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Actif</FormLabel>
                        <FormDescription>
                          Activez pour rendre le service visible dans la marketplace
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/admin/services')}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-klyra hover:bg-klyra/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 