import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
}

export function Logo({ className = "", showText = false, iconOnly = false }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {!imageError ? (
        <div className={`relative ${iconOnly ? 'h-8 w-8' : 'h-8 w-auto min-w-[120px]'}`}>
          <Image 
            src="/images/klyra-logo.png" 
            alt="Klyra Logo"
            width={iconOnly ? 32 : 120} 
            height={32}
            priority
            className="h-full w-auto"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <span className={`font-bold text-primary ${iconOnly ? 'text-xl' : 'text-2xl'}`}>K</span>
      )}
      {showText && !iconOnly && (
        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">
          Klyra Design
        </span>
      )}
    </Link>
  );
} 