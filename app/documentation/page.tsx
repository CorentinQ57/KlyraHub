import Link from 'next/link'
import { 
  BookOpen, Layers, CreditCard, 
  HelpCircle, ShoppingBag, ArrowRight 
} from 'lucide-react'

// Composant pour les cartes de catégories
const CategoryCard = ({ 
  title, 
  description, 
  icon, 
  href, 
  isNew
}: { 
  title: string
  description: string
  icon: React.ReactNode
  href: string
  isNew?: boolean
}) => (
  <Link
    href={href}
    className="group block p-6 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#467FF7] hover:shadow-md transition-all duration-200"
  >
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7]">
          {icon}
        </div>
        {isNew && (
          <span className="bg-[#E6EDFD] text-[#467FF7] px-2 py-1 rounded-full text-xs font-bold uppercase">
            Nouveau
          </span>
        )}
      </div>
      
      <h3 className="text-[18px] font-semibold mb-2 text-[#1A2333]">{title}</h3>
      <p className="text-[#64748B] text-sm mb-4 flex-grow">{description}</p>
      
      <div className="flex items-center text-[#467FF7] text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
        Explorer
        <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </div>
  </Link>
)

export default function DocumentationPage() {
  return (
    <div className="pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4 text-[#1A2333]">Documentation KlyraDesign</h1>
        <p className="text-[#64748B] text-lg max-w-3xl">
          Bienvenue dans la documentation de KlyraDesign. Découvrez nos guides, ressources et tutoriels pour tirer le meilleur parti de nos services.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryCard
          title="Commencer"
          description="Guides d'introduction, premiers pas et FAQs pour vous aider à démarrer rapidement avec KlyraDesign."
          icon={<BookOpen className="h-6 w-6" />}
          href="/documentation/introduction"
        />
        
        <CategoryCard
          title="Services"
          description="Explorez notre gamme complète de services de design, branding et stratégie digitale."
          icon={<ShoppingBag className="h-6 w-6" />}
          href="/documentation/services/overview"
          isNew={true}
        />
        
        <CategoryCard
          title="Projets"
          description="Apprenez à suivre l'avancement de vos projets, comprendre le cycle de vie et gérer les livrables."
          icon={<Layers className="h-6 w-6" />}
          href="/documentation/projects/lifecycle"
        />
        
        <CategoryCard
          title="Facturation"
          description="Tout ce que vous devez savoir sur les méthodes de paiement, factures et historique d'achat."
          icon={<CreditCard className="h-6 w-6" />}
          href="/documentation/billing/payment-methods"
        />
        
        <CategoryCard
          title="Support"
          description="Besoin d'aide ? Consultez nos guides de dépannage ou contactez notre équipe."
          icon={<HelpCircle className="h-6 w-6" />}
          href="/documentation/support/contact"
        />
      </div>
      
      <div className="mt-12 p-6 bg-[#EBF2FF] rounded-xl">
        <h2 className="text-xl font-semibold mb-2 text-[#1A2333]">Vous ne trouvez pas ce que vous cherchez ?</h2>
        <p className="text-[#4A5568] mb-4">
          Notre équipe est disponible pour vous aider à résoudre vos problèmes ou répondre à vos questions.
        </p>
        <Link 
          href="/contact" 
          className="inline-flex items-center bg-[#467FF7] text-white px-4 py-2 rounded-lg hover:bg-[#3A6FE0] transition-colors"
        >
          Contacter le support
        </Link>
      </div>
    </div>
  )
} 