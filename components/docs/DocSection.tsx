import React from "react";
import { LucideIcon } from "lucide-react";

interface DocSectionProps {
  id: string;
  title: string;
  icon?: React.ElementType | LucideIcon;
  children: React.ReactNode;
}

export default function DocSection({ id, title, icon: Icon, children }: DocSectionProps) {
  return (
    <section id={id} className="py-6 scroll-mt-16">
      <div className="mb-4">
        {Icon && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {React.createElement(Icon, { className: "h-4 w-4 text-primary" })}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          </div>
        )}
        {!Icon && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
} 