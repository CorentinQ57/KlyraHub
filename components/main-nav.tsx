"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  BookOpen, LayoutDashboard, ShoppingBag, 
  User, Settings, HelpCircle 
} from "lucide-react"

// Liste des éléments de navigation
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    matchPattern: /^\/dashboard(?!\/documentation)/
  },
  {
    title: "Services",
    href: "/marketplace",
    icon: <ShoppingBag className="h-4 w-4 mr-2" />,
    matchPattern: /^\/marketplace/
  },
  {
    title: "Documentation",
    href: "/documentation",
    icon: <BookOpen className="h-4 w-4 mr-2" />,
    matchPattern: /^\/documentation/
  },
  {
    title: "Profil",
    href: "/dashboard/profile",
    icon: <User className="h-4 w-4 mr-2" />,
    matchPattern: /^\/dashboard\/profile/
  },
  {
    title: "Support",
    href: "/support",
    icon: <HelpCircle className="h-4 w-4 mr-2" />,
    matchPattern: /^\/support/
  },
  {
    title: "Admin",
    href: "/dashboard/admin",
    icon: <Settings className="h-4 w-4 mr-2" />,
    matchPattern: /^\/dashboard\/admin/,
    adminOnly: true
  }
]

export function MainNav({
  className,
  isAdmin = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  
  // Filtrer les éléments de navigation en fonction des droits d'admin
  const filteredNavItems = navItems.filter(item => !item.adminOnly || (item.adminOnly && isAdmin))
  
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {filteredNavItems.map((item, index) => {
        // Vérifier si le chemin correspond au modèle de correspondance
        const isActive = item.matchPattern.test(pathname)
        
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-[#467FF7]",
              isActive
                ? "text-[#467FF7]"
                : "text-[#64748B]"
            )}
          >
            {item.icon}
            {item.title}
            {item.title === "Documentation" && isActive && (
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#467FF7]"></span>
            )}
          </Link>
        )
      })}
    </nav>
  )
} 