'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface StatProps {
  label: string
  value: number
  total?: number
  color?: string
  icon?: React.ReactNode
  suffix?: string
  animationDelay?: number
}

export function AnimatedStat({ 
  label, 
  value, 
  total = 100, 
  color = 'var(--primary)', 
  icon, 
  suffix = '', 
  animationDelay = 0, 
}: StatProps) {
  const [count, setCount] = useState(0);
  const percentage = Math.round((value / total) * 100);
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => {
        let start = 0;
        const duration = 1500; // ms
        const step = Math.max(1, Math.floor(value / (duration / 16))); // Assuming 60fps
        
        const timer = setInterval(() => {
          start += step;
          if (start > value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(start);
          }
        }, 16);
        
        return () => clearInterval(timer);
      }, animationDelay);
      
      return () => clearTimeout(timeout);
    }
  }, [inView, value, animationDelay]);

  return (
    <div ref={ref} className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">
          {inView ? count : 0}{suffix} {total !== 100 && `/ ${total}${suffix}`}
        </span>
      </div>
      
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: inView ? `${percentage}%` : 0 }}
          transition={{ 
            duration: 1, 
            delay: animationDelay / 1000,
            ease: 'easeOut', 
          }}
        />
      </div>
    </div>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

export default function AnimatedStats() {
  return <></>;
} 