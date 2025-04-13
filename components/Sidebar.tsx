import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Logo } from '@/components/Logo'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  User,
  ShoppingCart,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  BookOpen,
  LogIn,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Home,
  Briefcase,
  Users,
  BarChart,
  MessageSquare,
  PanelLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from "@/components/ui/use-toast"

// Interface pour les liens de navigation
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  adminOnly?: boolean;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  
  useEffect(() => {
    setMounted(true)
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === 'true')
    }
  }, [])
  
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', collapsed.toString())
    }
  }, [collapsed, mounted])
  
  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
      })
    }
  }
  
  // Common navigation links for all users
  const userLinks: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
    { label: 'Projects', href: '/projects', icon: <Briefcase size={20} /> },
    { label: 'Profile', href: '/profile', icon: <User size={20} /> },
    { label: 'Messages', href: '/messages', icon: <MessageSquare size={20} /> },
  ]
  
  // Admin only links
  const adminLinks: NavLink[] = [
    { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart size={20} /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ]
  
  // Links for visitors/non-authenticated users
  const visitorLinks: NavLink[] = [
    { label: 'Home', href: '/', icon: <Home size={20} /> },
    { label: 'Projects', href: '/projects', icon: <Briefcase size={20} /> },
  ]
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }
  
  // Determine which links to show based on authentication state
  const navLinks = user ? userLinks : visitorLinks
  const isAdmin = user?.role === 'admin'
  
  // If auth is still loading, show skeleton/placeholder
  if (!user) {
    return (
      <motion.aside 
        className={cn(
          'flex flex-col h-screen bg-background border-r border-border',
          className
        )}
        initial={{ width: collapsed ? 70 : 250 }}
        animate={{ width: collapsed ? 70 : 250 }}
        transition={{ duration: 0.3 }}
      >
        <div className='p-4 flex justify-center items-center'>
          <div className='h-8 w-full bg-muted animate-pulse rounded-md'></div>
        </div>
        <div className='flex flex-col space-y-2 p-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-10 bg-muted animate-pulse rounded-md'></div>
          ))}
        </div>
      </motion.aside>
    )
  }
  
  return (
    <motion.aside 
      className={cn(
        'flex flex-col h-screen bg-background border-r border-border relative',
        className
      )}
      initial={{ width: collapsed ? 70 : 250 }}
      animate={{ width: collapsed ? 70 : 250 }}
      transition={{ duration: 0.3 }}
    >
      {/* Collapse button */}
      <Button 
        variant='ghost' 
        size='icon' 
        className='absolute -right-4 top-20 z-10 h-8 w-8 rounded-full bg-background border border-border shadow-md'
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
      
      {/* Header with logo */}
      <div className='p-4 flex items-center justify-center border-b border-border'>
        <Logo showText={!collapsed} iconOnly={collapsed} />
      </div>
      
      {/* Navigation links */}
      <div className='flex-1 overflow-y-auto py-4 px-3'>
        <nav className='space-y-1'>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
            >
              <span className='flex-shrink-0'>{link.icon}</span>
              {!collapsed && <span className='ml-3'>{link.label}</span>}
            </Link>
          ))}
          
          {/* Admin section if user is admin */}
          {isAdmin && (
            <>
              <div className={cn(
                'mt-6 mb-2 flex items-center', 
                collapsed ? 'justify-center' : 'px-3'
              )}>
                {!collapsed && <p className='text-xs font-semibold text-muted-foreground'>ADMIN</p>}
                {collapsed && <PanelLeft size={16} className='text-muted-foreground' />}
              </div>
              {adminLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === link.href 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center'
                  )}
                >
                  <span className='flex-shrink-0'>{link.icon}</span>
                  {!collapsed && <span className='ml-3'>{link.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
      
      {/* Footer with help and logout */}
      <div className='p-4 border-t border-border'>
        <div className='space-y-2'>
          <Link 
            href='/help'
            className={cn(
              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center'
            )}
          >
            <HelpCircle size={20} />
            {!collapsed && <span className='ml-3'>Help</span>}
          </Link>
          
          {user && (
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
            >
              <LogOut size={20} />
              {!collapsed && <span className='ml-3'>Logout</span>}
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
} 