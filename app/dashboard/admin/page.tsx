"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { fetchAllProjects } from '@/lib/supabase'
import { Project } from '@/lib/supabase'
import { Card } from '@/components/ui/card'

// Étendre le type Project pour inclure les relations
type ProjectWithRelations = Project & {
  services?: { 
    id: string;
    name: string;
    description: string;
    category_id: string;
    price: number;
    duration: number;
  } | null;
  client?: { 
    id: string;
    full_name: string | null;
    email: string | null 
  } | null;
}

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()

  // Status labels and colors for UI
  const statusLabels: Record<string, { label: string, color: string }> = {
    pending: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800"
    },
    validated: {
      label: "Validé",
      color: "bg-blue-100 text-blue-800"
    },
    in_progress: {
      label: "En cours",
      color: "bg-purple-100 text-purple-800"
    },
    delivered: {
      label: "Livré",
      color: "bg-green-100 text-green-800"
    },
    completed: {
      label: "Terminé",
      color: "bg-gray-100 text-gray-800"
    },
  }

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!authLoading && (!user || !isAdmin)) {
      console.log("Not authenticated as admin, redirecting")
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      console.log("Admin authenticated, fetching all projects")
      loadProjects()
    }
  }, [user, authLoading, isAdmin, router])

  // Filter projects when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(projects.filter(project => project.status === statusFilter))
    }
  }, [statusFilter, projects])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const projectData = await fetchAllProjects()
      console.log("Admin fetched all projects:", projectData.length)
      setProjects(projectData)
      setFilteredProjects(projectData)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-klyra">Klyra</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-klyra">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="text-sm font-medium transition-colors hover:text-klyra">
                Profil
              </Link>
              <Link href="/dashboard/marketplace" className="text-sm font-medium transition-colors hover:text-klyra">
                Marketplace
              </Link>
              <Link href="/dashboard/admin" className="text-sm font-medium text-klyra transition-colors">
                Admin
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Retour au Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-sm text-klyra mt-1">Gestion des projets et utilisateurs</p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">Projets</h2>
              <p className="text-muted-foreground mb-4">Gérez tous les projets clients</p>
              <div className="mt-auto">
                <Button 
                  className="w-full bg-klyra hover:bg-klyra/90" 
                  onClick={() => router.push('/dashboard/admin')}
                >
                  Voir les projets
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">Services</h2>
              <p className="text-muted-foreground mb-4">Gérez les services de la marketplace</p>
              <div className="mt-auto">
                <Button 
                  className="w-full bg-klyra hover:bg-klyra/90" 
                  onClick={() => router.push('/dashboard/admin/services')}
                >
                  Gérer les services
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
              <p className="text-muted-foreground mb-4">Gérez les comptes utilisateurs</p>
              <div className="mt-auto">
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled
                >
                  Fonctionnalité à venir
                </Button>
              </div>
            </Card>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Tous les projets ({filteredProjects.length})</h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setStatusFilter('all')}
                className="text-xs"
              >
                Tous
              </Button>
              {Object.entries(statusLabels).map(([status, { label }]) => (
                <Button 
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setStatusFilter(status)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Titre</th>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">Prix</th>
                    <th className="px-4 py-3 text-left">Date de création</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b hover:bg-muted/20">
                        <td className="px-4 py-3">{project.id}</td>
                        <td className="px-4 py-3 font-medium">{project.title}</td>
                        <td className="px-4 py-3">
                          {project.client?.full_name || project.client?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}>
                            {statusLabels[project.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">{project.price}€</td>
                        <td className="px-4 py-3">
                          {new Date(project.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link href={`/dashboard/admin/projects/${project.id}`}>
                              <Button size="sm" variant="outline">Voir</Button>
                            </Link>
                            <Link href={`/dashboard/admin/projects/${project.id}/edit`}>
                              <Button size="sm">Éditer</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Aucun projet correspondant aux critères de filtrage
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 