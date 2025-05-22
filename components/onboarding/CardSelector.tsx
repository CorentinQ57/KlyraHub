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
        className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
          isSelected 
            ? 'border-primary border-2 shadow-md shadow-primary/20 bg-gradient-to-br from-white to-primary/5' 
            : 'hover:border-primary/50 hover:shadow-sm'
        } ${className}`}
        onClick={onClick}
      >
        {isSelected && (
          <motion.div 
            className="absolute top-0 right-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center -mr-2 -mt-2 shadow-sm">
              <Check className="text-white h-4 w-4" />
            </div>
          </motion.div>
        )}
        
        <CardContent className={`p-4 ${icon ? 'flex items-center gap-3' : ''}`}>
          {icon && (
            <div className={`flex-shrink-0 transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-[#64748B]'}`}>
              {icon}
            </div>
          )}
          
          <div>
            <div className={`font-medium transition-colors duration-300 ${isSelected ? 'text-primary' : ''}`}>
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