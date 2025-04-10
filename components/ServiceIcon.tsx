"use client"

import React from 'react'
import { motion } from 'framer-motion'
import {
  // Icônes plus modernes et fines
  Layers,
  Code2,
  BarChart3,
  Sparkles,
  Megaphone,
  Search,
  ImageIcon, 
  LayoutGrid,
  Settings2,
  ShieldCheck,
  Globe,
  Lightbulb,
  Zap,
  Tag,
  LayoutDashboard,
  FileText,
  Users2,
  ScanLine
} from 'lucide-react'

type ServiceIconProps = {
  serviceName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  variant?: 'outline' | 'bold' | 'minimal';
}

// Animation variants subtiles
const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      duration: 0.8,
      ease: "easeInOut"
    }
  }
}

export const ServiceIcon = ({ 
  serviceName, 
  size = 'md', 
  className = '', 
  animate = true,
  variant = 'outline'
}: ServiceIconProps) => {
  // Get icon size based on size prop
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }
  
  // Styles based on variant
  const variantClasses = {
    outline: "stroke-[1.5px] stroke-current fill-none",
    bold: "stroke-[2px] stroke-current fill-none",
    minimal: "stroke-[1px] stroke-current fill-none"
  }

  // Map service name to icon
  const getIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('design') || lowercaseName.includes('ui')) {
      return <Layers />
    } else if (lowercaseName.includes('développement') || lowercaseName.includes('web') || lowercaseName.includes('site')) {
      return <Code2 />
    } else if (lowercaseName.includes('marketing') || lowercaseName.includes('stratégie')) {
      return <BarChart3 />
    } else if (lowercaseName.includes('branding') || lowercaseName.includes('marque')) {
      return <Sparkles />
    } else if (lowercaseName.includes('pub') || lowercaseName.includes('communication')) {
      return <Megaphone />
    } else if (lowercaseName.includes('seo') || lowercaseName.includes('référencement')) {
      return <Search />
    } else if (lowercaseName.includes('logo') || lowercaseName.includes('identité')) {
      return <ImageIcon />
    } else if (lowercaseName.includes('landing') || lowercaseName.includes('one page')) {
      return <LayoutGrid />
    } else if (lowercaseName.includes('maintenance') || lowercaseName.includes('support')) {
      return <Settings2 />
    } else if (lowercaseName.includes('securité') || lowercaseName.includes('audit')) {
      return <ShieldCheck />
    } else if (lowercaseName.includes('international') || lowercaseName.includes('global')) {
      return <Globe />
    } else if (lowercaseName.includes('création') || lowercaseName.includes('créatif')) {
      return <Lightbulb />
    } else if (lowercaseName.includes('performance') || lowercaseName.includes('rapide')) {
      return <Zap />
    } else if (lowercaseName.includes('prix') || lowercaseName.includes('tarif')) {
      return <Tag />
    } else if (lowercaseName.includes('interface') || lowercaseName.includes('ux')) {
      return <LayoutDashboard />
    } else if (lowercaseName.includes('contenu') || lowercaseName.includes('article')) {
      return <FileText />
    } else if (lowercaseName.includes('équipe') || lowercaseName.includes('collaboration')) {
      return <Users2 />
    } else if (lowercaseName.includes('analyse') || lowercaseName.includes('diagnostic')) {
      return <ScanLine />
    } else {
      return <Globe />
    }
  }

  const icon = getIcon(serviceName);
  
  // Container classes
  const containerClasses = `text-primary ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  // Si animation est activée, utiliser motion.div avec des animations subtiles
  if (animate) {
    return (
      <motion.div 
        className={containerClasses}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration: 0.3 }
          }
        }}
      >
        <motion.div
          variants={lineVariants}
        >
          {icon}
        </motion.div>
      </motion.div>
    )
  }
  
  // Sans animation, retourner simplement l'icône
  return (
    <div className={containerClasses}>
      {icon}
    </div>
  )
}

export default ServiceIcon; 