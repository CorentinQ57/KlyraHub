import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function IntroductionPage() {
  return (
    <article className="prose prose-blue max-w-none">
      <nav className="flex text-sm mb-6 text-[#64748B]">
        <Link href="/documentation" className="hover:text-[#467FF7] transition-colors">
          Documentation
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#467FF7] font-medium">Introduction</span>
      </nav>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A2333] mb-3">Introduction à KlyraDesign</h1>
        <p className="text-[#4A5568] text-lg max-w-3xl">
          Découvrez comment KlyraDesign peut transformer votre vision en réalité grâce à des services de design, branding et stratégie digitale sur mesure.
        </p>
      </div>
      
      <div className="my-8 rounded-lg overflow-hidden border border-[#E2E8F0]">
        <div className="bg-[#F8FAFC] p-4 border-b border-[#E2E8F0]">
          <h2 className="text-[16px] font-medium text-[#1A2333]">Dans cette section</h2>
        </div>
        <div className="p-4">
          <ul className="grid gap-2">
            <li>
              <Link href="#about-klyra" className="text-[#467FF7] hover:underline flex items-center">
                <ArrowRight className="h-3 w-3 mr-2" /> À propos de KlyraDesign
              </Link>
            </li>
            <li>
              <Link href="#our-services" className="text-[#467FF7] hover:underline flex items-center">
                <ArrowRight className="h-3 w-3 mr-2" /> Nos services
              </Link>
            </li>
            <li>
              <Link href="#how-it-works" className="text-[#467FF7] hover:underline flex items-center">
                <ArrowRight className="h-3 w-3 mr-2" /> Comment ça marche
              </Link>
            </li>
            <li>
              <Link href="#why-choose-us" className="text-[#467FF7] hover:underline flex items-center">
                <ArrowRight className="h-3 w-3 mr-2" /> Pourquoi nous choisir
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <section id="about-klyra" className="mb-10">
        <h2 className="text-2xl font-semibold text-[#1A2333] mb-4">À propos de KlyraDesign</h2>
        <p className="text-[#4A5568] mb-4">
          KlyraDesign est une agence spécialisée en design, branding et stratégie digitale dédiée aux TPE/PME tech ambitieuses. Notre mission est de vous aider à concrétiser votre vision à travers des services professionnels packagés et accessibles.
        </p>
        <p className="text-[#4A5568] mb-6">
          Nous comprenons les défis uniques auxquels sont confrontées les entreprises en croissance, c'est pourquoi nous avons créé un écosystème de services clairs et transparents pour vous accompagner à chaque étape de votre développement.
        </p>
        
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6">
          <p className="text-[#4A5568] text-sm italic">
            "KlyraDesign a transformé notre identité visuelle et notre présence en ligne, ce qui nous a permis d'acquérir une crédibilité immédiate auprès de nos clients potentiels."
          </p>
          <p className="text-[#1A2333] text-sm font-medium mt-2">— Marie Durand, CEO de TechStart</p>
        </div>
      </section>
      
      <section id="our-services" className="mb-10">
        <h2 className="text-2xl font-semibold text-[#1A2333] mb-4">Nos services</h2>
        <p className="text-[#4A5568] mb-6">
          KlyraDesign propose une gamme complète de services adaptés aux besoins des entreprises tech en développement. Nos offres sont structurées en packages clairs pour une transparence totale.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="border border-[#E2E8F0] rounded-lg p-6">
            <h3 className="text-[18px] font-semibold mb-2 text-[#1A2333]">Branding</h3>
            <p className="text-[#4A5568] text-sm mb-4">
              Création d'identités de marque distinctives, logos, chartes graphiques et guides de style complets.
            </p>
            <Link 
              href="/documentation/services/branding" 
              className="text-[#467FF7] text-sm font-medium flex items-center hover:underline"
            >
              En savoir plus <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="border border-[#E2E8F0] rounded-lg p-6">
            <h3 className="text-[18px] font-semibold mb-2 text-[#1A2333]">Web Design</h3>
            <p className="text-[#4A5568] text-sm mb-4">
              Conception et développement de sites web optimisés, landing pages et interfaces utilisateur.
            </p>
            <Link 
              href="/documentation/services/web-design" 
              className="text-[#467FF7] text-sm font-medium flex items-center hover:underline"
            >
              En savoir plus <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
      
      <section id="how-it-works" className="mb-10">
        <h2 className="text-2xl font-semibold text-[#1A2333] mb-4">Comment ça marche</h2>
        <p className="text-[#4A5568] mb-6">
          Chez KlyraDesign, nous avons simplifié le processus de collaboration pour le rendre aussi fluide et efficace que possible. Voici les étapes de notre démarche :
        </p>
        
        <ol className="space-y-6 mb-6">
          <li className="flex">
            <div className="h-8 w-8 rounded-full bg-[#EBF2FF] text-[#467FF7] flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
            <div>
              <h3 className="text-[16px] font-medium text-[#1A2333] mb-1">Exploration</h3>
              <p className="text-[#4A5568] text-sm">
                Choisissez le service adapté à vos besoins sur notre marketplace et procédez à l'achat.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="h-8 w-8 rounded-full bg-[#EBF2FF] text-[#467FF7] flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
            <div>
              <h3 className="text-[16px] font-medium text-[#1A2333] mb-1">Validation</h3>
              <p className="text-[#4A5568] text-sm">
                Notre équipe valide votre demande et vous contacte pour affiner les détails du projet.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="h-8 w-8 rounded-full bg-[#EBF2FF] text-[#467FF7] flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
            <div>
              <h3 className="text-[16px] font-medium text-[#1A2333] mb-1">Création</h3>
              <p className="text-[#4A5568] text-sm">
                Nos designers travaillent sur votre projet et vous présentent des concepts dans votre espace client.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="h-8 w-8 rounded-full bg-[#EBF2FF] text-[#467FF7] flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
            <div>
              <h3 className="text-[16px] font-medium text-[#1A2333] mb-1">Livraison</h3>
              <p className="text-[#4A5568] text-sm">
                Après vos retours et ajustements, vous recevez les livrables finaux dans votre espace client.
              </p>
            </div>
          </li>
          
          <li className="flex">
            <div className="h-8 w-8 rounded-full bg-[#EBF2FF] text-[#467FF7] flex items-center justify-center font-bold mr-4 flex-shrink-0">5</div>
            <div>
              <h3 className="text-[16px] font-medium text-[#1A2333] mb-1">Accompagnement</h3>
              <p className="text-[#4A5568] text-sm">
                Nous restons disponibles pour vous accompagner dans l'utilisation de vos nouveaux assets.
              </p>
            </div>
          </li>
        </ol>
      </section>
      
      <section id="why-choose-us" className="mb-10">
        <h2 className="text-2xl font-semibold text-[#1A2333] mb-4">Pourquoi nous choisir</h2>
        <p className="text-[#4A5568] mb-6">
          KlyraDesign se distingue par une approche centrée sur les besoins spécifiques des entreprises tech en croissance. Voici pourquoi nos clients nous choisissent :
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F8FAFC] p-4 rounded-lg">
            <h3 className="text-[16px] font-medium text-[#1A2333] mb-2">Expertise tech</h3>
            <p className="text-[#4A5568] text-sm">
              Notre équipe comprend les enjeux spécifiques du secteur technologique et parle votre langage.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] p-4 rounded-lg">
            <h3 className="text-[16px] font-medium text-[#1A2333] mb-2">Transparence totale</h3>
            <p className="text-[#4A5568] text-sm">
              Des prix clairs, des délais respectés et un suivi en temps réel de votre projet.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] p-4 rounded-lg">
            <h3 className="text-[16px] font-medium text-[#1A2333] mb-2">Qualité garantie</h3>
            <p className="text-[#4A5568] text-sm">
              Des livrables professionnels respectant les standards de l'industrie et prêts à l'emploi.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] p-4 rounded-lg">
            <h3 className="text-[16px] font-medium text-[#1A2333] mb-2">Accompagnement continu</h3>
            <p className="text-[#4A5568] text-sm">
              Un support réactif et des conseils d'experts tout au long de votre collaboration avec nous.
            </p>
          </div>
        </div>
      </section>
      
      <div className="border-t border-[#E2E8F0] pt-6 mt-10">
        <h3 className="text-[16px] font-semibold mb-3 text-[#1A2333]">Prêt à commencer ?</h3>
        <p className="text-[#4A5568] mb-4">
          Explorez notre marketplace pour découvrir tous nos services ou consultez le guide des premiers pas pour en savoir plus.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/marketplace" 
            className="bg-[#467FF7] text-white px-4 py-2 rounded-lg hover:bg-[#3A6FE0] transition-colors"
          >
            Explorer les services
          </Link>
          <Link 
            href="/documentation/getting-started" 
            className="bg-white border border-[#467FF7] text-[#467FF7] px-4 py-2 rounded-lg hover:bg-[#EBF2FF] transition-colors"
          >
            Guide de démarrage
          </Link>
        </div>
      </div>
    </article>
  )
} 