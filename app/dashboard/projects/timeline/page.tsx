"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  addMonths, 
  parseISO, 
  format, 
  subMonths 
} from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Gantt, 
  Task, 
  ViewMode, 
  createTask 
} from "@/components/ui/gantt";
import { useAuth } from "@/lib/auth";
import { fetchProjects, fetchAllProjects } from "@/lib/supabase";
import { PageContainer, PageHeader, PageSection } from "@/components/ui/page-container";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

// Types
type ProjectWithRelations = {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'validated' | 'in_progress' | 'delivered' | 'completed';
  created_at: string;
  client_id: string;
  service_id: string;
  start_date?: string;
  end_date?: string;
  services?: {
    name?: string;
    duration?: number;
    category_id?: string;
    category?: {
      id: string;
      name: string;
      image_url?: string;
    };
  } | null;
};

export default function ProjectTimeline() {
  // États
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRelations[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: ProjectWithRelations[] }>({});
  const [ganttTasks, setGanttTasks] = useState<Task[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const redirectAttempted = useRef(false);

  // Hooks
  const router = useRouter();
  const { user, isAdmin = false, isLoading } = useAuth();

  // Couleurs des statuts pour le Gantt
  const statusColors: Record<string, { bg: string; progressColor: string }> = {
    pending: {
      bg: "#FFF8E6",
      progressColor: "#FBBF24",
    },
    validated: {
      bg: "#EEF4FF",
      progressColor: "#467FF7",
    },
    in_progress: {
      bg: "#F2EBFE",
      progressColor: "#8B5CF6",
    },
    delivered: {
      bg: "#ECFDF5",
      progressColor: "#10B981",
    },
    completed: {
      bg: "#F9FAFB",
      progressColor: "#6B7280",
    },
  };

  // Protection contre la redirection en boucle
  useEffect(() => {
    if (!isLoading && !user && !redirectAttempted.current) {
      console.log('Utilisateur non connecté, redirection vers login depuis timeline')
      redirectAttempted.current = true;
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Initialisation avec protection améliorée
  useEffect(() => {
    // Ne charger les projets que si l'utilisateur est connecté et que le chargement est terminé
    if (!isLoading && user) {
      loadProjects();
    }
  }, [user, isLoading]);

  // Effet pour filtrer et grouper les projets
  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, categoryFilter]);

  // Effet pour convertir les projets en tâches Gantt
  useEffect(() => {
    groupProjectsByCategory();
  }, [filteredProjects]);

  // Effet pour créer les tâches Gantt
  useEffect(() => {
    convertProjectsToGanttTasks();
  }, [categories]);

  // Fonction pour charger les projets
  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      let projectsData: ProjectWithRelations[] = [];

      // Vérifier que user n'est pas null avant d'accéder à user.id
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour voir les projets",
          variant: "destructive",
        });
        return;
      }

      // Si l'utilisateur est admin, récupérer tous les projets
      // Sinon, récupérer seulement les projets de l'utilisateur
      projectsData = isAdmin 
        ? await fetchAllProjects() 
        : await fetchProjects(user.id);

      // Ajouter les dates de début et de fin calculées à partir de created_at et duration
      const projectsWithDates = projectsData.map((project) => {
        const startDate = parseISO(project.created_at);
        const endDate = project.services?.duration
          ? addMonths(startDate, Math.ceil(project.services.duration / 30))
          : addMonths(startDate, 1); // Par défaut 1 mois si pas de durée spécifiée

        return {
          ...project,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        };
      });

      setProjects(projectsWithDates);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fonction pour filtrer les projets
  const filterProjects = () => {
    let filtered = [...projects];

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.status === statusFilter
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.services?.category_id === categoryFilter
      );
    }

    setFilteredProjects(filtered);
  };

  // Grouper les projets par catégorie
  const groupProjectsByCategory = () => {
    const groupedProjects: { [key: string]: ProjectWithRelations[] } = {};
    
    filteredProjects.forEach((project) => {
      const categoryName = project.services?.category?.name || "Non catégorisé";
      if (!groupedProjects[categoryName]) {
        groupedProjects[categoryName] = [];
      }
      groupedProjects[categoryName].push(project);
    });
    
    setCategories(groupedProjects);
  };

  // Convertir les projets en tâches pour le composant Gantt
  const convertProjectsToGanttTasks = () => {
    const tasks: Task[] = [];

    // Créer une tâche par catégorie (tâche parent)
    Object.entries(categories).forEach(([categoryName, categoryProjects], index) => {
      const categoryId = `category-${index}`;
      
      tasks.push({
        id: categoryId,
        name: categoryName,
        start: new Date(Math.min(...categoryProjects.map(p => new Date(p.start_date || p.created_at).getTime()))),
        end: new Date(Math.max(...categoryProjects.map(p => new Date(p.end_date || addMonths(parseISO(p.created_at), 1)).getTime()))),
        progress: 0,
        type: "project",
        hideChildren: false,
        styles: {
          progressColor: "#467FF7",
          progressSelectedColor: "#467FF7",
        },
      });

      // Ajouter les projets comme sous-tâches
      categoryProjects.forEach((project) => {
        const startDate = new Date(project.start_date || project.created_at);
        const endDate = new Date(project.end_date || addMonths(parseISO(project.created_at), 1));
        
        // Calculer le pourcentage de progression
        let progress = 0;
        if (project.status === "completed") {
          progress = 100;
        } else if (project.status === "delivered") {
          progress = 90;
        } else if (project.status === "in_progress") {
          progress = 50;
        } else if (project.status === "validated") {
          progress = 20;
        } else {
          progress = 10;
        }

        tasks.push({
          id: project.id,
          name: project.title,
          start: startDate,
          end: endDate,
          progress,
          type: "task",
          project: categoryId,
          styles: {
            backgroundColor: statusColors[project.status].bg,
            progressColor: statusColors[project.status].progressColor,
            progressSelectedColor: statusColors[project.status].progressColor,
          },
          isDisabled: false,
        });
      });
    });

    setGanttTasks(tasks);
  };

  // Changer le mode d'affichage
  const handleViewModeChange = (mode: string) => {
    switch (mode) {
      case "day":
        setViewMode(ViewMode.Day);
        break;
      case "week":
        setViewMode(ViewMode.Week);
        break;
      case "month":
        setViewMode(ViewMode.Month);
        break;
      case "quarter":
        setViewMode(ViewMode.QuarterDay);
        break;
      case "year":
        setViewMode(ViewMode.Year);
        break;
      default:
        setViewMode(ViewMode.Month);
    }
  };

  // Naviguer d'une période en avant ou en arrière
  const navigatePeriod = (direction: "forward" | "backward") => {
    if (direction === "forward") {
      switch (viewMode) {
        case ViewMode.Day:
          setCurrentDate((prev) => addMonths(prev, 1));
          break;
        case ViewMode.Week:
          setCurrentDate((prev) => addMonths(prev, 1));
          break;
        case ViewMode.Month:
          setCurrentDate((prev) => addMonths(prev, 3));
          break;
        case ViewMode.QuarterDay:
          setCurrentDate((prev) => addMonths(prev, 3));
          break;
        case ViewMode.Year:
          setCurrentDate((prev) => addMonths(prev, 12));
          break;
      }
    } else {
      switch (viewMode) {
        case ViewMode.Day:
          setCurrentDate((prev) => subMonths(prev, 1));
          break;
        case ViewMode.Week:
          setCurrentDate((prev) => subMonths(prev, 1));
          break;
        case ViewMode.Month:
          setCurrentDate((prev) => subMonths(prev, 3));
          break;
        case ViewMode.QuarterDay:
          setCurrentDate((prev) => subMonths(prev, 3));
          break;
        case ViewMode.Year:
          setCurrentDate((prev) => subMonths(prev, 12));
          break;
      }
    }
  };

  // Gérer le clic sur une tâche
  const handleTaskClick = (task: Task) => {
    // Ne pas naviguer si c'est une catégorie
    if (task.type === "project") return;

    // Naviguer vers la page du projet
    router.push(`/dashboard/projects/${task.id}`);
  };

  // Construire le contenu de la page
  return (
    <PageContainer>
      <PageHeader
        title="Timeline des Projets"
        description="Visualisez tous vos projets sur une timeline interactive"
      />

      <PageSection>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium mr-2">Filtrer par:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validé</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {/* Dynamiquement générer les catégories basées sur les projets disponibles */}
                {Object.keys(categories).map((category, index) => (
                  <SelectItem key={`category-${index}`} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vue et navigation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod("backward")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium mx-2">
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod("forward")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Select 
              value={viewMode === ViewMode.Day 
                ? "day" 
                : viewMode === ViewMode.Week 
                ? "week" 
                : viewMode === ViewMode.Month 
                ? "month" 
                : viewMode === ViewMode.QuarterDay 
                ? "quarter" 
                : "year"
              } 
              onValueChange={handleViewModeChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Vue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Légende des statuts */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium mr-2">Statuts :</span>
          <Badge variant="outline" className="bg-[#FFF8E6] text-amber-700 border-amber-200">
            En attente
          </Badge>
          <Badge variant="outline" className="bg-[#EEF4FF] text-blue-700 border-blue-200">
            Validé
          </Badge>
          <Badge variant="outline" className="bg-[#F2EBFE] text-purple-700 border-purple-200">
            En cours
          </Badge>
          <Badge variant="outline" className="bg-[#ECFDF5] text-green-700 border-green-200">
            Livré
          </Badge>
          <Badge variant="outline" className="bg-[#F9FAFB] text-gray-700 border-gray-200">
            Terminé
          </Badge>
        </div>

        {/* Affichage du Gantt */}
        <Card className="p-0 overflow-hidden">
          {isLoadingProjects ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              <span className="ml-2">Chargement des projets...</span>
            </div>
          ) : ganttTasks.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                Aucun projet à afficher avec les filtres actuels.
              </p>
            </div>
          ) : (
            <div className="h-[calc(100vh-280px)] min-h-[500px]">
              <Gantt 
                tasks={ganttTasks}
                options={{
                  viewMode: viewMode,
                  locale: "fr",
                  onClick: handleTaskClick,
                  headerHeight: 50,
                }}
                className="h-full"
              />
            </div>
          )}
        </Card>
      </PageSection>
    </PageContainer>
  );
} 