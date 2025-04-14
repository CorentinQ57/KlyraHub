"use client";

import { useRef, useState, useEffect } from "react";
import { Gantt as GanttChart, Task, ViewMode, StylingOption, DisplayOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { cn } from "@/lib/utils";
import { format, addDays, addMonths, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type des options de customisation
export interface GanttOptions {
  viewMode?: ViewMode;
  locale?: typeof fr;
  headerHeight?: number;
  columnWidth?: number;
  listCellWidth?: string;
  rowHeight?: number;
  barCornerRadius?: number;
  barFill?: number;
  todayColor?: string;
  projectProgressColor?: string;
  progressColor?: string;
  onExpanderClick?: (task: Task) => void;
  onDateChange?: (task: Task, children: Task[]) => void;
  onTaskClick?: (task: Task) => void;
  onTaskDoubleClick?: (task: Task) => void;
  TooltipContent?: React.FC<{ task: Task; fontSize: string; fontFamily: string }>;
}

// Composant Gantt principal
export function Gantt({
  tasks,
  options,
  className,
}: {
  tasks: Task[];
  options?: GanttOptions;
  className?: string;
}) {
  const [view, setView] = useState<ViewMode>(options?.viewMode || ViewMode.Month);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Options par défaut de style pour le Gantt
  const defaultOptions: StylingOption = {
    headerHeight: options?.headerHeight || 50,
    columnWidth: options?.columnWidth || 60,
    listCellWidth: options?.listCellWidth || "155px",
    rowHeight: options?.rowHeight || 50,
    barCornerRadius: options?.barCornerRadius || 4,
    barFill: options?.barFill || 60,
    todayColor: options?.todayColor || "#467FF7",
    projectProgressColor: options?.projectProgressColor || "#467FF7",
    progressColor: options?.progressColor || "#7FA3F9",
    fontFamily: "Poppins, sans-serif",
  };
  
  // Options d'affichage pour le Gantt
  const displayOptions: DisplayOption = {
    viewMode: view,
    locale: options?.locale || fr,
  };
  
  // Effet pour faire défiler le gantt vers la position enregistrée
  useEffect(() => {
    if (containerRef.current && scrollLeft) {
      containerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft, view]);
  
  // Sauvegarde de la position de défilement lors du changement de vue
  const handleViewChange = (newView: ViewMode) => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
    setView(newView);
  };
  
  // Rendu du tooltip personnalisé par défaut
  const defaultTooltipContent = ({ task, fontSize, fontFamily }: { task: Task; fontSize: string; fontFamily: string }) => {
    return (
      <div
        className="p-3 bg-white border rounded-md shadow-md min-w-[200px]"
        style={{ fontSize, fontFamily }}
      >
        <div className="font-semibold">{task.name}</div>
        <div className="mt-1 text-gray-600">
          {format(task.start, "dd/MM/yyyy", { locale: fr })} - {format(task.end, "dd/MM/yyyy", { locale: fr })}
        </div>
        {task.progress !== undefined && (
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className="h-2 rounded-full bg-[#467FF7]" 
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="ml-2 text-sm">{Math.round(task.progress)}%</span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn("gantt-container flex flex-col h-full", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border-b mb-3">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange(ViewMode.Day)}
            className={cn(
              view === ViewMode.Day ? "bg-[#EBF2FF] text-[#467FF7] border-[#467FF7]" : ""
            )}
          >
            Jour
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange(ViewMode.Week)}
            className={cn(
              view === ViewMode.Week ? "bg-[#EBF2FF] text-[#467FF7] border-[#467FF7]" : ""
            )}
          >
            Semaine
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange(ViewMode.Month)}
            className={cn(
              view === ViewMode.Month ? "bg-[#EBF2FF] text-[#467FF7] border-[#467FF7]" : ""
            )}
          >
            Mois
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange(ViewMode.QuarterDay)}
            className={cn(
              view === ViewMode.QuarterDay ? "bg-[#EBF2FF] text-[#467FF7] border-[#467FF7]" : ""
            )}
          >
            Trimestre
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange(ViewMode.Year)}
            className={cn(
              view === ViewMode.Year ? "bg-[#EBF2FF] text-[#467FF7] border-[#467FF7]" : ""
            )}
          >
            Année
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <GanttChart
          tasks={tasks}
          viewMode={view}
          onDateChange={options?.onDateChange}
          onTaskClick={options?.onTaskClick}
          onDoubleClick={options?.onTaskDoubleClick}
          onExpanderClick={options?.onExpanderClick}
          listCellWidth={defaultOptions.listCellWidth}
          columnWidth={defaultOptions.columnWidth}
          rowHeight={defaultOptions.rowHeight}
          barCornerRadius={defaultOptions.barCornerRadius}
          barFill={defaultOptions.barFill}
          headerHeight={defaultOptions.headerHeight}
          TooltipContent={options?.TooltipContent || defaultTooltipContent}
          locale={displayOptions.locale}
          todayColor={defaultOptions.todayColor}
          projectProgressColor={defaultOptions.projectProgressColor}
          progressColor={defaultOptions.progressColor}
          fontFamily={defaultOptions.fontFamily}
        />
      </div>
    </div>
  );
}

// Exporte les types et enums de la librairie pour faciliter l'utilisation
export { Task, ViewMode }

// Fonction utilitaire pour créer une tâche
export function createTask(
  id: string,
  name: string,
  start: Date | string,
  end: Date | string,
  type: "task" | "milestone" | "project",
  progress: number = 0,
  dependencies: string[] = [],
  styles: any = {},
  isDisabled: boolean = false,
  project?: string
): Task {
  // Convertit les dates string en objets Date si nécessaire
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;
  
  // S'assure que la date de fin est après la date de début
  const finalEndDate = endDate < startDate ? addDays(startDate, 1) : endDate;

  return {
    id,
    name,
    start: startDate,
    end: finalEndDate,
    type,
    progress,
    dependencies,
    styles,
    isDisabled,
    project,
  };
}

// Fonction utilitaire pour créer une tâche projet
export function createProjectTask(
  id: string,
  name: string,
  start: Date | string,
  end: Date | string,
  progress: number = 0,
  hideChildren: boolean = false
): Task {
  const task = createTask(id, name, start, end, "project", progress);
  return {
    ...task,
    hideChildren,
  };
}

// Fonction utilitaire pour calculer la date de fin basée sur la durée en jours
export function calculateEndDate(start: Date | string, durationInDays: number): Date {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  return addDays(startDate, durationInDays);
}

// Fonction utilitaire pour calculer la date de fin basée sur la durée en mois
export function calculateEndDateMonths(start: Date | string, durationInMonths: number): Date {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  return addMonths(startDate, durationInMonths);
} 