'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep, OnboardingQuestion, QuestionOption, onboardingSteps } from '../onboarding-steps';

type FormData = {
  [key: string]: string | string[] | number;
};

type OnboardingFormProps = {
  onComplete: (data: FormData) => void;
  initialData?: FormData;
};

export function OnboardingForm({ onComplete, initialData = {} }: OnboardingFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialData);
  const currentStep = onboardingSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / onboardingSteps.length) * 100;

  const handleInputChange = (questionId: string, value: string | string[] | number) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    const currentQuestions = currentStep.questions;
    return currentQuestions.every(question => {
      if (question.validation?.required) {
        const value = formData[question.id];
        if (question.type === 'multiple') {
          return Array.isArray(value) && value.length > 0;
        }
        return value !== undefined && value !== '';
      }
      return true;
    });
  };

  const renderQuestion = (question: OnboardingQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={question.placeholder}
            value={formData[question.id]?.toString() || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder={question.placeholder}
            value={formData[question.id]?.toString() || ''}
            onChange={(e) => handleInputChange(question.id, Number(e.target.value))}
            min={question.validation?.min}
            max={question.validation?.max}
            className="w-full"
          />
        );
      case 'single':
        return (
          <RadioGroup
            value={formData[question.id]?.toString() || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
            className="grid grid-cols-2 gap-4"
          >
            {question.options?.map((option: QuestionOption) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex items-center space-x-2">
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'multiple':
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options?.map((option: QuestionOption) => {
              const values = formData[question.id] as string[] || [];
              return (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={values.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...values, option.id]
                        : values.filter((v) => v !== option.id);
                      handleInputChange(question.id, newValues);
                    }}
                  />
                  <Label htmlFor={option.id} className="flex items-center space-x-2">
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Progress value={progress} className="mb-8" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>

          <div className="space-y-6">
            {currentStep.questions.map((question) => (
              <div key={question.id} className="space-y-4">
                <Label className="text-lg font-medium">{question.title}</Label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              Retour
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStepIndex === onboardingSteps.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 