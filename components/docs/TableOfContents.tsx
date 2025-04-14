"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  title: string;
  level: number;
};

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px", threshold: 0.1 }
    );

    // Observer tous les titres avec des IDs
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-2 sticky top-6">
      <p className="font-medium text-sm">Sur cette page</p>
      <ul className="space-y-2 text-sm max-h-[calc(100vh-8rem)] overflow-auto pr-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "line-clamp-2",
              item.level === 2 ? "ml-0" : "ml-4",
              activeId === item.id
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
} 