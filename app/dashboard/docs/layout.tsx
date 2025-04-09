"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocsNav } from "@/components/docs/DocsNav";
import { ChevronLeft, Menu, X } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si l'appareil est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="lg:hidden w-full border-b px-4 py-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au dashboard
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label={isNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation latérale gauche (desktop) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-full max-w-xs transform overflow-auto border-r bg-background lg:static lg:block lg:w-64 lg:translate-x-0",
            isNavOpen ? "translate-x-0" : "-translate-x-full",
            "transition-transform duration-200 ease-in-out"
          )}
        >
          <div className="hidden lg:flex items-center border-b px-6 py-3 h-16">
            <Link
              href="/dashboard"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour au dashboard
            </Link>
          </div>
          <div className="sticky top-0 p-4 lg:p-6">
            <DocsNav />
          </div>
        </aside>

        {/* Overlay pour fermer la navigation sur mobile */}
        {isNavOpen && isMobile && (
          <div
            className="fixed inset-0 z-10 bg-black/30 lg:hidden"
            onClick={() => setIsNavOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 lg:py-10 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 