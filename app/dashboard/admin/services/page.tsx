"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { getAllServices, updateService, deleteService } from '@/lib/supabase'
import { Service } from '@/lib/supabase'

export default function ServicesManagementPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadServices()
    }
  }, [user, authLoading, isAdmin, router])

  const loadServices = async () => {
    try {
      setIsLoading(true)
      const data = await getAllServices()
      // Tri par statut (actifs d'abord) puis par nom
      setServices(data.sort((a, b) => {
        if (a.active === b.active) {
          return a.name.localeCompare(b.name)
        }
        return a.active ? -1 : 1
      }))
    } catch (error) {
      console.error('Error loading services:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les services.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      setStatusLoading(service.id)
      const updatedService = await updateService(service.id, {
        active: !service.active
      })
      
      if (updatedService) {
        // Mettre à jour localement
        setServices(prevServices => 
          prevServices.map(s => 
            s.id === service.id ? { ...s, active: !s.active } : s
          )
        )
        
        toast({
          title: "Succès",
          description: `Service ${updatedService.active ? 'activé' : 'désactivé'}.`,
        })
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du service.",
        variant: "destructive",
      })
    } finally {
      setStatusLoading(null)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      return
    }
    
    try {
      setDeleteLoading(serviceId)
      const success = await deleteService(serviceId)
      
      if (success) {
        // Rafraîchir la liste après suppression
        await loadServices()
        
        toast({
          title: "Succès",
          description: "Service supprimé avec succès.",
        })
      } else {
        throw new Error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service. Il peut être utilisé par des projets.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <Link 
            href="/dashboard/admin" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour à l'administration
          </Link>
          <h1 className="text-3xl font-bold mt-4">Gestion des services</h1>
          <p className="text-muted-foreground">
            Gérez les services disponibles dans la marketplace
          </p>
        </div>
        <Link href="/dashboard/admin/services/new">
          <Button className="mt-4 sm:mt-0 bg-klyra hover:bg-klyra/90">
            Ajouter un service
          </Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableCaption>Liste des services ({services.length})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id} className={!service.active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category || 'Non catégorisé'}</TableCell>
                  <TableCell className="text-right">{service.price}€</TableCell>
                  <TableCell>{service.duration} jours</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={service.active}
                        disabled={statusLoading === service.id}
                        onCheckedChange={() => handleToggleActive(service)}
                      />
                      <span>{service.active ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/admin/services/${service.id}`}>
                        <Button variant="outline" size="sm">
                          Éditer
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        disabled={deleteLoading === service.id}
                      >
                        {deleteLoading === service.id ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aucun service disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 