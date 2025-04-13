export type QuestionOption = {
  id: string;
  label: string;
  icon?: string;
};

export type OnboardingQuestion = {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'number' | 'single' | 'multiple';
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
    pattern?: RegExp;
  };
  options?: QuestionOption[];
};

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  questions: OnboardingQuestion[];
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us a bit about yourself',
    questions: [
      {
        id: 'name',
        title: 'What is your name?',
        type: 'text',
        placeholder: 'Enter your full name',
        validation: { required: true }
      },
      {
        id: 'age',
        title: 'What is your age?',
        type: 'number',
        placeholder: 'Enter your age',
        validation: { required: true, min: 18, max: 120 }
      }
    ]
  },
  {
    id: 'professional',
    title: 'Professional Details',
    description: 'Tell us about your work',
    questions: [
      {
        id: 'role',
        title: 'What is your role?',
        type: 'single',
        options: [
          { id: 'developer', label: 'Developer' },
          { id: 'designer', label: 'Designer' },
          { id: 'manager', label: 'Manager' },
          { id: 'other', label: 'Other' }
        ]
      },
      {
        id: 'skills',
        title: 'What are your skills?',
        type: 'multiple',
        options: [
          { id: 'react', label: 'React' },
          { id: 'typescript', label: 'TypeScript' },
          { id: 'node', label: 'Node.js' },
          { id: 'design', label: 'UI/UX Design' }
        ]
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Set up your preferences',
    questions: [
      {
        id: 'notifications',
        title: 'How would you like to be notified?',
        type: 'multiple',
        options: [
          { id: 'email', label: 'Email' },
          { id: 'push', label: 'Push Notifications' },
          { id: 'sms', label: 'SMS' }
        ]
      }
    ]
  }
]; 