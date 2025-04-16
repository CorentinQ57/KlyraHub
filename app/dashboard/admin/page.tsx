"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { fetchAllProjects } from '@/lib/supabase'
import { Project } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { Settings, Users, ShoppingBag, FileText, BookOpen } from 'lucide-react'

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
  const { user, isAdmin } = useAuth()

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
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadProjects()
    }
  }, [user, isAdmin, router])

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
      setProjects(projectData)
      setFilteredProjects(projectData)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement des données d'administration...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Administration"
        description="Gestion des projets et utilisateurs"
      >
        <Link href="/dashboard">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Dashboard client
          </Button>
        </Link>
      </PageHeader>

      {/* Quick actions */}
      <PageSection title="Accès rapides">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContentCard>
            <h2 className="text-[18px] font-semibold mb-3">Services</h2>
            <p className="text-[14px] text-[#64748B] mb-4">
              Gérez les services de la marketplace
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/dashboard/admin/services')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> Gérer les services
            </Button>
          </ContentCard>

          <ContentCard>
            <h2 className="text-[18px] font-semibold mb-3">Catégories</h2>
            <p className="text-[14px] text-[#64748B] mb-4">
              Gérez les catégories de services
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/dashboard/admin/categories')}
            >
              <Settings className="mr-2 h-4 w-4" /> Gérer les catégories
            </Button>
          </ContentCard>

          <ContentCard>
            <h2 className="text-[18px] font-semibold mb-3">Academy</h2>
            <p className="text-[14px] text-[#64748B] mb-4">
              Gérez le contenu pédagogique de l'academy
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/dashboard/admin/academy')}
            >
              <BookOpen className="mr-2 h-4 w-4" /> Gérer l'academy
            </Button>
          </ContentCard>
        </div>
      </PageSection>

      {/* Filter Controls */}
      <PageSection title={`Tous les projets (${filteredProjects.length})`}>
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Projects Table */}
        <ContentCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-[14px]">{project.id}</td>
                      <td className="px-4 py-3 text-[14px] font-medium">{project.title}</td>
                      <td className="px-4 py-3 text-[14px]">
                        {project.client?.full_name || project.client?.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}>
                          {statusLabels[project.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[14px]">{project.price}€</td>
                      <td className="px-4 py-3 text-[14px]">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Link href={`/dashboard/admin/projects/${project.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Éditer
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Voir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[14px] text-[#64748B]">
                      Aucun projet ne correspond à votre recherche
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ContentCard>
      </PageSection>

      <PageSection title="Gestion des utilisateurs">
        <ContentCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-semibold">Utilisateurs</h3>
            <Button size="sm" onClick={() => router.push('/dashboard/admin/users')}>
              <Users className="mr-2 h-4 w-4" /> Gérer les utilisateurs
            </Button>
          </div>
          <p className="text-[14px] text-[#64748B]">
            Accédez à la liste des utilisateurs, gérez les rôles et permissions.
          </p>
        </ContentCard>
      </PageSection>
    </PageContainer>
  )
} 