import React from "react";
import { Check, X } from "lucide-react";

type ItemType = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
};

interface DocListProps {
  items: ItemType[];
  className?: string;
  showIcons?: boolean;
}

export default function DocList({ items, className = "", showIcons = false }: DocListProps) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          {showIcons && (
            <div className="flex-shrink-0 mt-0.5">
              {item.icon ? (
                item.icon
              ) : item.positive ? (
                <div className="p-1 bg-green-100 rounded-full">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
              ) : item.negative ? (
                <div className="p-1 bg-red-100 rounded-full">
                  <X className="h-3 w-3 text-red-600" />
                </div>
              ) : null}
            </div>
          )}
          <div>
            <p className={`font-medium ${item.positive ? "text-green-700" : item.negative ? "text-red-700" : ""}`}>
              {item.title}
            </p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
} 