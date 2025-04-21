import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

type NoteType = 'info' | 'warning' | 'success';

interface DocNoteProps {
  type?: NoteType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function DocNote({ 
  type = 'info', 
  title, 
  children, 
  className, 
}: DocNoteProps) {
  const styles = {
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      descriptionColor: 'text-blue-700',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      descriptionColor: 'text-amber-700',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      descriptionColor: 'text-green-700',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
  };

  const { bgColor, borderColor, textColor, descriptionColor, icon } = styles[type];

  return (
    <div className={cn(`${bgColor} border ${borderColor} rounded-lg p-4`, className)}>
      <div className="flex items-start">
        <div className="mt-0.5 mr-3 flex-shrink-0">{icon}</div>
        <div>
          {title && <h3 className={`text-base font-medium ${textColor}`}>{title}</h3>}
          <div className={`${title ? 'mt-1' : ''} text-sm ${descriptionColor}`}>{children}</div>
        </div>
      </div>
    </div>
  );
} 