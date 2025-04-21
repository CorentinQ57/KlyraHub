import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TableOfContents, TocItem } from './TableOfContents';
import { LinkCard, LinkItem } from './LinkCard';

interface DocHeaderProps {
  title: string;
  description?: string;
  className?: string;
  tableOfContents: TocItem[];
  relatedLinks?: {
    href: string;
    label: string;
  }[];
}

export default function DocHeader({
  title,
  description,
  className,
  tableOfContents,
  relatedLinks,
}: DocHeaderProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row gap-10 mb-10', className)}>
      {/* Contenu principal */}
      <div className="flex-1">
        <div className="space-y-6">
          <Link
            href="/dashboard/docs"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la documentation
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Barre latérale droite */}
      <div className="lg:w-64 lg:flex-shrink-0 space-y-6">
        <div className="lg:sticky lg:top-6">
          <TableOfContents items={tableOfContents} />
          
          {relatedLinks && relatedLinks.length > 0 && (
            <div className="mt-8">
              <LinkCard
                title="Liens connexes"
                links={relatedLinks.map(link => ({
                  title: link.label,
                  href: link.href,
                  icon: null,
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 