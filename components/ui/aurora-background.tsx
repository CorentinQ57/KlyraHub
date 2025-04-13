"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  intensity = 'subtle',
  ...props
}: AuroraBackgroundProps) => {
  const opacityClass = 
    intensity === 'subtle' ? 'opacity-30' : 
    intensity === 'medium' ? 'opacity-50' : 
    'opacity-70';

  return (
    <div
      className={cn(
        "relative min-h-full w-full flex-1 flex flex-col bg-gradient-to-b from-klyra-bg to-white dark:from-zinc-900 dark:to-zinc-950 text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden z-layer-background">
        <div
          className={cn(
            `
          [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
          [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
          [--aurora:repeating-linear-gradient(100deg,#467FF7_10%,#93c5fd_15%,#60a5fa_20%,#ddd6fe_25%,#3b82f6_30%)]
          [background-image:var(--white-gradient),var(--aurora)]
          dark:[background-image:var(--dark-gradient),var(--aurora)]
          [background-size:300%,_200%]
          [background-position:50%_50%,50%_50%]
          filter blur-[10px] invert dark:invert-0
          after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
          after:dark:[background-image:var(--dark-gradient),var(--aurora)]
          after:[background-size:200%,_100%] 
          after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
          pointer-events-none
          absolute -inset-[10px] will-change-transform`,
            opacityClass,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
      </div>
      {children}
    </div>
  );
}; 