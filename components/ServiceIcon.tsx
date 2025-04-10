"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Code, 
  LineChart, 
  Megaphone, 
  Globe, 
  PenSquare, 
  Image, 
  LayoutGrid, 
  Building2, 
  Settings, 
  ShieldCheck, 
  Search,
  Lightbulb,
  Zap,
  Tag,
  Layout,
  FileText,
  Users,
  ScanLine
} from 'lucide-react'

type ServiceIconProps = {
  serviceName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  animationType?: 'pulse' | 'float' | 'spin' | 'bounce' | 'glow' | 'none';
}

// Animation variants
const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
}

// Path animations for SVG icons
const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      duration: 1.5,
      ease: "easeInOut"
    }
  }
}

export const ServiceIcon = ({ 
  serviceName, 
  size = 'md', 
  className = '', 
  animate = true,
  animationType = 'pulse'
}: ServiceIconProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get icon size based on size prop
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-16 h-16"
  }

  // Map service name to icon
  const getIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('design') || lowercaseName.includes('ui')) {
      return <Palette />
    } else if (lowercaseName.includes('développement') || lowercaseName.includes('web') || lowercaseName.includes('site')) {
      return <Code />
    } else if (lowercaseName.includes('marketing') || lowercaseName.includes('stratégie')) {
      return <LineChart />
    } else if (lowercaseName.includes('branding') || lowercaseName.includes('marque')) {
      return <PenSquare />
    } else if (lowercaseName.includes('pub') || lowercaseName.includes('communication')) {
      return <Megaphone />
    } else if (lowercaseName.includes('seo') || lowercaseName.includes('référencement')) {
      return <Search />
    } else if (lowercaseName.includes('logo') || lowercaseName.includes('identité')) {
      return <Image />
    } else if (lowercaseName.includes('landing') || lowercaseName.includes('one page')) {
      return <LayoutGrid />
    } else if (lowercaseName.includes('maintenance') || lowercaseName.includes('support')) {
      return <Settings />
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
      return <Layout />
    } else if (lowercaseName.includes('contenu') || lowercaseName.includes('article')) {
      return <FileText />
    } else if (lowercaseName.includes('équipe') || lowercaseName.includes('collaboration')) {
      return <Users />
    } else if (lowercaseName.includes('analyse') || lowercaseName.includes('diagnostic')) {
      return <ScanLine />
    } else {
      return <Building2 />
    }
  }

  const icon = getIcon(serviceName);
  
  // Animation CSS class based on animationType
  const animationClass = animate && animationType !== 'none' ? `icon-${animationType}` : '';
  
  // Base container classes
  const containerClasses = `text-primary ${sizeClasses[size]} ${animationClass} ${className}`;
  
  // Container animation props for framer-motion
  const containerAnimationProps = animate ? {
    whileHover: "hover",
    variants: iconVariants,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  } : {};

  return (
    <motion.div 
      className={containerClasses}
      {...containerAnimationProps}
    >
      {icon}
      {isHovered && animate && (
        <motion.div 
          className="absolute -inset-3 rounded-full bg-primary-100 -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  )
}

export default ServiceIcon; 