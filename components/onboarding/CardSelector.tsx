'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface CardSelectorProps {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  isSelected: boolean
  onClick: () => void
  className?: string
}

export default function CardSelector({
  id,
  title,
  description,
  icon,
  isSelected,
  onClick,
  className = '',
}: CardSelectorProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card
        className={`cursor-pointer transition-all relative overflow-hidden ${
          isSelected 
            ? 'border-primary ring-1 ring-primary/30 shadow-sm' 
            : 'hover:border-primary/50'
        } ${className}`}
        onClick={onClick}
      >
        {isSelected && (
          <div className="absolute top-0 right-0">
            <div className="w-0 h-0 border-t-[40px] border-r-[40px] border-t-primary border-r-transparent" />
            <Check className="absolute top-1 right-1 text-white h-4 w-4" />
          </div>
        )}
        
        <CardContent className={`p-4 ${icon ? 'flex items-center gap-3' : ''}`}>
          {icon && (
            <div className={`flex-shrink-0 ${isSelected ? 'text-primary' : 'text-[#64748B]'}`}>
              {icon}
            </div>
          )}
          
          <div>
            <div className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
              {title}
            </div>
            {description && (
              <div className="text-sm text-[#64748B] mt-1">
                {description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 