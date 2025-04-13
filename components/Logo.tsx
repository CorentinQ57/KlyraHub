import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = false }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {!imageError ? (
        <div className="relative h-8 w-auto min-w-[120px]">
          <Image 
            src="/images/klyra-logo.png" 
            alt="Klyra Logo"
            width={120} 
            height={32}
            priority
            className="h-full w-auto"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <span className="text-2xl font-bold text-primary">Klyra</span>
      )}
      {showText && (
        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">
          Klyra Design
        </span>
      )}
    </Link>
  );
} 