export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color?: string
}

export interface OnboardingData {
  name: string
  businessName: string
  role: string
  sector: string
  companySize: string
  projectType: string[]
  teamSize?: string
  collaborationStyles?: string[]
  ambitions?: string[]
  experience?: string
  style?: {
    communication?: string
    timeManagement?: string
    visualPreference?: string
  }
  growthGoals?: string[]
  marketingBudget?: number
  timelineMonths?: number
  vision?: string
  targetMarket?: string[]
  innovationLevel?: string
}

export interface StepProps {
  data: OnboardingData
  onComplete: (data: OnboardingData) => void
  badges?: Badge[]
} 