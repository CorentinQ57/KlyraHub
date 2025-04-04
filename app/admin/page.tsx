'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface Project {
  id: string
  title: string
  status: string
  created_at: string
  client: {
    full_name: string
  }
}

interface DashboardStats {
  totalUsers: number
  totalProjects: number
  totalServices: number
  pendingProjects: number
  completedProjects: number
  activeServices: number
  recentProjects: Project[]
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalServices: 0,
    pendingProjects: 0,
    completedProjects: 0,
    activeServices: 0,
    recentProjects: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (usersError) throw usersError
      
      // Get projects stats
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, status, created_at')
      
      if (projectsError) throw projectsError
      
      // Get pending projects
      const { count: pendingProjects, error: pendingError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      if (pendingError) throw pendingError
      
      // Get completed projects
      const { count: completedProjects, error: completedError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
      
      if (completedError) throw completedError
      
      // Get services stats
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, active')
      
      if (servicesError) throw servicesError
      
      // Get recent projects
      const { data: recentProjectsData, error: recentError } = await supabase
        .from('projects')
        .select(`
          id, 
          title, 
          status, 
          created_at,
          client:profiles!projects_client_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (recentError) throw recentError
      
      // Format recent projects data to match the expected type
      const recentProjects: Project[] = recentProjectsData ? recentProjectsData.map((project: any) => ({
        id: project.id,
        title: project.title,
        status: project.status,
        created_at: project.created_at,
        client: {
          full_name: project.client.full_name
        }
      })) : []
      
      setStats({
        totalUsers: totalUsers || 0,
        totalProjects: projects?.length || 0,
        totalServices: services?.length || 0,
        pendingProjects: pendingProjects || 0,
        completedProjects: completedProjects || 0,
        activeServices: services?.filter(s => s.active)?.length || 0,
        recentProjects
      })
      
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      review: 'En révision',
      completed: 'Terminé',
      cancelled: 'Annulé'
    }
    return labels[status as keyof typeof labels] || status
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <div className="space-x-2">
          <Link href="/dashboard">
            <Button variant="outline">
              Voir le Dashboard Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalUsers}</p>
            <Link href="/admin/users" className="text-sm text-klyra hover:underline mt-2 block">
              Voir tous les utilisateurs →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalServices}</p>
            <p className="text-sm text-gray-500">
              {stats.activeServices} actifs
            </p>
            <Link href="/admin/services" className="text-sm text-klyra hover:underline mt-2 block">
              Gérer les services →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalProjects}</p>
            <p className="text-sm text-gray-500">
              {stats.pendingProjects} en attente, {stats.completedProjects} terminés
            </p>
            <Link href="/admin/projects" className="text-sm text-klyra hover:underline mt-2 block">
              Voir tous les projets →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Projets récents */}
      <div>
        <h2 className="text-xl font-bold mb-4">Projets récents</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {project.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      #{project.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {project.client.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/projects/${project.id}`}>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Ajouter un service</h3>
              <p className="text-sm text-gray-500 mb-4">
                Créer un nouveau service dans la marketplace
              </p>
              <Link href="/admin/services">
                <Button className="w-full">
                  Ajouter un service
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Projets en attente</h3>
              <p className="text-sm text-gray-500 mb-4">
                {stats.pendingProjects} projet(s) à attribuer
              </p>
              <Link href="/admin/projects">
                <Button className="w-full" variant="outline">
                  Gérer les projets
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Gérer les designers</h3>
              <p className="text-sm text-gray-500 mb-4">
                Attribuer des projets aux designers
              </p>
              <Link href="/admin/users">
                <Button className="w-full" variant="outline">
                  Voir les utilisateurs
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Aller à la marketplace</h3>
              <p className="text-sm text-gray-500 mb-4">
                Voir la marketplace côté client
              </p>
              <Link href="/marketplace">
                <Button className="w-full" variant="outline">
                  Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 