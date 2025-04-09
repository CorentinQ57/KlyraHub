"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export type LinkItem = {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
  external?: boolean;
};

type LinkCardProps = {
  title: string;
  links: LinkItem[];
  className?: string;
};

export function LinkCard({ title, links, className }: LinkCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b bg-muted/50">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <ul className="divide-y">
          {links.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    {link.icon && <div className="mr-2">{link.icon}</div>}
                    <div>
                      <h4 className="text-sm font-medium">{link.title}</h4>
                      {link.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    {link.icon && <div className="mr-2">{link.icon}</div>}
                    <div>
                      <h4 className="text-sm font-medium">{link.title}</h4>
                      {link.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 