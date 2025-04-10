'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type HoverEffectType = 'subtle' | 'glow' | 'none'

interface IconHoverEffectProps {
  children: React.ReactNode
  isActive?: boolean
  effect?: HoverEffectType
  className?: string
}

export function IconHoverEffect({ 
  children, 
  isActive = false,
  effect = 'subtle',
  className = ""
}: IconHoverEffectProps) {
  const [hover, setHover] = useState(false)
  
  // Active state
  const isActiveState = hover || isActive
  
  // Style conditionnel basé sur le type d'effet
  const getBackgroundEffect = () => {
    if (!isActiveState || effect === 'none') return null;
    
    const commonClasses = "absolute -z-10 transition-all duration-200";
    
    if (effect === 'glow') {
      return (
        <motion.div 
          className={`${commonClasses} -inset-3 bg-primary/10 blur-md rounded-full`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        />
      )
    }
    
    // Effet subtle par défaut
    return (
      <motion.div 
        className={`${commonClasses} -inset-2 bg-primary/5 rounded-full`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.7, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      />
    )
  }
  
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {getBackgroundEffect()}
      {children}
    </motion.div>
  )
}

export default IconHoverEffect 