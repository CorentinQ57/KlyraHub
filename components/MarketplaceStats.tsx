'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Users, 
  ShoppingBag, 
  Star, 
  Clock, 
  Award,
  FileCheck
} from 'lucide-react'
import IconHoverEffect from './IconHoverEffect'

interface StatProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix?: string
  color?: string
  delay?: number
}

function Stat({ icon, value, label, suffix = "", color = "primary", delay = 0 }: StatProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  
  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        const duration = 1500
        const step = Math.ceil(value / (duration / 16))
        
        let current = 0
        const interval = setInterval(() => {
          current += step
          if (current >= value) {
            current = value
            clearInterval(interval)
          }
          setDisplayValue(current)
        }, 16)
        
        return () => clearInterval(interval)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [inView, value, delay])
  
  const iconColors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    info: "text-blue-500"
  }
  
  const bgColors = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    accent: "bg-accent/10",
    success: "bg-green-500/10",
    warning: "bg-yellow-500/10",
    error: "bg-red-500/10",
    info: "bg-blue-500/10"
  }
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="flex flex-col items-center p-6 rounded-lg shadow-sm border border-gray-100 bg-white"
    >
      <div className={`p-3 rounded-full mb-4 ${bgColors[color as keyof typeof bgColors]}`}>
        <IconHoverEffect type="pulse" isActive={inView}>
          <div className={`w-12 h-12 flex items-center justify-center ${iconColors[color as keyof typeof iconColors]}`}>
            {icon}
          </div>
        </IconHoverEffect>
      </div>
      <div className="text-2xl md:text-3xl font-bold">
        {displayValue}{suffix}
      </div>
      <div className="text-gray-500 mt-1 text-center">{label}</div>
    </motion.div>
  )
}

export function MarketplaceStats() {
  const stats = [
    { 
      icon: <Users size={24} />, 
      value: 18500, 
      label: "Utilisateurs", 
      color: "primary", 
      delay: 0 
    },
    { 
      icon: <ShoppingBag size={24} />, 
      value: 245, 
      label: "Services disponibles", 
      color: "success", 
      delay: 100 
    },
    { 
      icon: <Star size={24} />, 
      value: 4.8, 
      label: "Note moyenne", 
      suffix: "/5", 
      color: "warning", 
      delay: 200 
    },
    { 
      icon: <Clock size={24} />, 
      value: 24, 
      label: "Délai moyen (heures)", 
      color: "info", 
      delay: 300 
    },
    { 
      icon: <Award size={24} />, 
      value: 96, 
      label: "Satisfaction client (%)", 
      suffix: "%", 
      color: "accent", 
      delay: 400 
    },
    { 
      icon: <FileCheck size={24} />, 
      value: 3500, 
      label: "Livrables complétés", 
      color: "secondary", 
      delay: 500 
    }
  ]
  
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Klyra Marketplace en chiffres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Stat 
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              color={stat.color}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketplaceStats 