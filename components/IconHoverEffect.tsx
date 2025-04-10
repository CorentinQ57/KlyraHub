'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type AnimationType = 'float' | 'pulse' | 'bounce' | 'spin' | 'glow'

interface IconHoverEffectProps {
  children: React.ReactNode
  type?: AnimationType
  isActive?: boolean
  className?: string
}

// Animation variants for different effects
const variants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  bounce: {
    y: [0, -15, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeOut"
    }
  },
  spin: {
    rotate: [0, 360],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  },
  glow: {
    opacity: [0.85, 1, 0.85],
    filter: ["brightness(100%)", "brightness(150%)", "brightness(100%)"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export function IconHoverEffect({ 
  children, 
  type = 'float', 
  isActive = false,
  className = ""
}: IconHoverEffectProps) {
  const [hover, setHover] = useState(false)
  
  // Only animate if hovering or explicitly set as active
  const shouldAnimate = hover || isActive
  
  return (
    <motion.div
      className={className}
      animate={shouldAnimate ? variants[type] : {}}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      {children}
    </motion.div>
  )
}

export default IconHoverEffect 