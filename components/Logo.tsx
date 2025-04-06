import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  // Une fois que vous aurez ajouté votre fichier logo à public/images, 
  // vous pourrez décommenter ces lignes et supprimer le div placeholder
  
  // return (
  //   <Link href="/" className={`flex items-center ${className}`}>
  //     <Image 
  //       src="/images/klyra-logo.png" 
  //       alt="Klyra Logo"
  //       width={40} 
  //       height={40}
  //       className="h-10 w-auto"
  //     />
  //     {showText && (
  //       <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">
  //         Klyra Design
  //       </span>
  //     )}
  //   </Link>
  // );
  
  // Solution temporaire jusqu'à l'ajout du fichier image
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#467FF7] to-[#7FA3F9] flex items-center justify-center">
        <span className="text-white font-bold text-xl">K</span>
      </div>
      {showText && (
        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">
          Klyra Design
        </span>
      )}
    </Link>
  );
} 