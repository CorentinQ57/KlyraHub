'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  steps: string[]
  currentStep: number
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full mb-8 px-6 max-w-4xl mx-auto">
      <div className="flex justify-between relative">
        {/* Ligne de fond continue */}
        <div className="absolute top-5 left-5 right-5 h-[2px] bg-slate-200"></div>
        
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="relative flex flex-col items-center flex-1"
          >
            <motion.div 
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 
                ${index < currentStep 
            ? 'bg-primary text-white'
            : index === currentStep 
              ? 'bg-primary text-white' 
              : 'bg-slate-100 text-slate-400 border border-slate-200'
          }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: index === currentStep ? 1.1 : 1,
                backgroundColor: index <= currentStep ? '#467FF7' : '#EBF2FF',
                color: index <= currentStep ? '#FFFFFF' : '#94A3B8',
              }}
              transition={{ duration: 0.3 }}
            >
              {index < currentStep ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            <span 
              className={`text-xs mt-2 font-medium text-center ${
                index <= currentStep ? 'text-primary' : 'text-slate-400'
              }`}
            >
              {step}
            </span>
            
            {/* Ligne de progression entre les étapes */}
            {index < steps.length - 1 && (
              <motion.div 
                className="absolute top-5 left-1/2 h-[2px] bg-primary"
                style={{ width: 'calc(100% - 10px)' }}
                initial={{ width: 0, left: '50%' }}
                animate={{ 
                  width: index < currentStep ? 'calc(100% - 10px)' : '0%',
                  left: index < currentStep ? '50%' : '50%',
                }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 