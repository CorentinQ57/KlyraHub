'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { fetchAllProjects, createProject, supabase } from '@/lib/supabase';
import { Project } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container';
import { Settings, Users, ShoppingBag, FileText, BookOpen, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

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

// Type pour les utilisateurs clients
type Client = {
  id: string;
  full_name: string | null;
  email: string | null;
}

// Type pour les services
type Service = {
  id: string;
  name: string;
  price: number;
}

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client_id: '',
    service_id: '',
    price: 0,
    status: 'pending'
  });
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  // Status labels and colors for UI
  const statusLabels: Record<string, { label: string, color: string }> = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800',
    },
    validated: {
      label: 'Validé',
      color: 'bg-blue-100 text-blue-800',
    },
    in_progress: {
      label: 'En cours',
      color: 'bg-purple-100 text-purple-800',
    },
    delivered: {
      label: 'Livré',
      color: 'bg-green-100 text-green-800',
    },
    completed: {
      label: 'Terminé',
      color: 'bg-gray-100 text-gray-800',
    },
  };

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (user && isAdmin) {
      loadProjects();
      loadClients();
      loadServices();
    }
  }, [user, isAdmin, router]);

  // Filter projects when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.status === statusFilter));
    }
  }, [statusFilter, projects]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectData = await fetchAllProjects();
      setProjects(projectData);
      setFilteredProjects(projectData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement des clients pour le menu déroulant
  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'client');
        
      if (error) {
        throw error;
      }
      
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des clients.',
        variant: 'destructive',
      });
    }
  };

  // Chargement des services pour le menu déroulant
  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('active', true);
        
      if (error) {
        throw error;
      }
      
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des services.',
        variant: 'destructive',
      });
    }
  };

  // Mise à jour des données du nouveau projet
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mise à jour du prix quand le service change
  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(service => service.id === serviceId);
    
    setNewProject(prev => ({
      ...prev,
      service_id: serviceId,
      price: selectedService?.price || 0
    }));
  };

  // Fonction pour créer un projet
  const handleCreateProject = async () => {
    if (!newProject.client_id || !newProject.service_id || !newProject.title) {
      toast({
        title: 'Données manquantes',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // Création du projet en utilisant la fonction createProject mais avec admin_created = true
      const { data: projectData, error } = await supabase
        .from('projects')
        .insert({
          client_id: newProject.client_id,
          service_id: newProject.service_id,
          title: newProject.title,
          description: newProject.description || null,
          price: newProject.price,
          status: newProject.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          admin_created: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Projet créé',
        description: 'Le projet a été créé avec succès.',
      });

      // Recharger les projets et fermer la modal
      await loadProjects();
      setIsModalOpen(false);
      
      // Réinitialiser le formulaire
      setNewProject({
        title: '',
        description: '',
        client_id: '',
        service_id: '',
        price: 0,
        status: 'pending'
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de créer le projet: ${error.message || 'Erreur inconnue'}`,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

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
    );
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

      {/* Filter Controls and Create Project Button */}
      <div className="flex justify-between items-center mb-4">
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
        </PageSection>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto">
              <Plus className="mr-2 h-4 w-4" /> Créer un projet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>
                Créez un projet directement dans l'administration et assignez-le à un client.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_id" className="text-right">
                  Client *
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newProject.client_id} 
                    onValueChange={(value) => setNewProject({...newProject, client_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name || client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service_id" className="text-right">
                  Service *
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newProject.service_id} 
                    onValueChange={handleServiceChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.price}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="title"
                    name="title"
                    value={newProject.title}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Statut
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => setNewProject({...newProject, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([status, { label }]) => (
                        <SelectItem key={status} value={status}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="description"
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    placeholder="Description du projet"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={isCreating || !newProject.client_id || !newProject.service_id || !newProject.title}
              >
                {isCreating ? 'Création en cours...' : 'Créer le projet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
      
    </PageContainer>
  );
} 