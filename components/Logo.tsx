import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  small?: boolean;
}

export function Logo({ className = '', showText = false, small = false }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {!imageError ? (
        <div className={`relative ${small ? 'h-6 w-6 min-w-[24px]' : 'h-8 w-auto min-w-[120px]'}`}>
          <Image 
            src={small ? '/images/klyra-icon.png' : '/images/klyra-logo.png'}
            alt="Klyra Logo"
            width={small ? 24 : 120} 
            height={small ? 24 : 32}
            priority
            className="h-full w-auto"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <span className={`font-bold text-primary ${small ? 'text-xl' : 'text-2xl'}`}>
          {small ? 'K' : 'Klyra'}
        </span>
      )}
      {showText && (
        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">
          Klyra Design
        </span>
      )}
    </Link>
  );
} 