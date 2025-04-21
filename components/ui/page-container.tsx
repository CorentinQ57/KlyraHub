'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function PageContainer({ 
  children, 
  className,
  fullWidth = false, 
}: PageContainerProps) {
  return (
    <div className="bg-[#f9fafc] min-h-[calc(100vh-64px)] pt-8">
      <div 
        className={cn(
          'mx-auto bg-white rounded-2xl shadow-sm pb-8 relative z-[2]',
          fullWidth ? 'max-w-[calc(100%-64px)]' : 'max-w-[1280px] px-8',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-center py-8 border-b border-[#E2E8F0] mb-6">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-[#1A2333]">{title}</h1>
        {description && (
          <p className="text-[14px] text-[#64748B] mt-1 leading-normal">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function PageSection({
  title,
  description,
  className,
  children,
}: {
  title?: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('mb-8', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-[18px] font-semibold text-[#1A2333] mb-1">{title}</h2>}
          {description && <p className="text-[13px] text-[#64748B]">{description}</p>}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export function ContentCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]',
      className
    )}>
      {children}
    </div>
  );
}