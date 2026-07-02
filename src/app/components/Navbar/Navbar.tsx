'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, BookOpen, Calendar, MessageSquare, HelpCircle, LucideIcon } from 'lucide-react';

// --- TYPESCRIPT INTERFACES ---
interface NavbarProps {
  hamburgerStatus: boolean;
  setHamburgerStatus: (status: boolean) => void;
}

interface NavLinkItem {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Navbar({ hamburgerStatus, setHamburgerStatus }: NavbarProps) {
  const pathname = usePathname();

  // Unified global configuration handler for link interactions
  const handleLinkClick = () => {
    //setHamburgerStatus(false);
  };

  // Modern element anchor scrolling utility for cross-device support
  const scrollToFooter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    //setHamburgerStatus(false);
    
    const footer = document.querySelector('#footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navlinks: NavLinkItem[] = [
    {
      icon: HomeIcon,
      label: 'Home',
      href: '/',
      onClick: handleLinkClick
    },
      {
      icon: HelpCircle,
      label: 'About',
      href: '#footer',
      onClick: scrollToFooter,
    },
    {
      icon: BookOpen,
      label: 'Courses',
      href: '/courses',
      onClick: handleLinkClick,
    },
    {
      icon: MessageSquare,
      label: 'Feedback',
      href: '/feedbacks',
      onClick: handleLinkClick,
    },
    
  ];

  return (
    <nav
      className={`
        /* Mobile Layout: Fixed absolute drawer below the header bar */
        fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-slate-900/95 backdrop-blur-md z-50 
        transition-transform duration-300 ease-in-out box-border p-6
        
        /* Desktop Layout: Revert back to inline fluid row layout on large screens */
        lg:static lg:w-auto lg:h-auto lg:bg-transparent lg:backdrop-blur-none lg:p-0
        
        /* 🔑 VIEW / HIDE CONTROL USING TRANSFORMS */
        ${hamburgerStatus ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <ul className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-1 p-6 lg:p-0 m-0 list-none box-border h-full lg:h-auto overflow-y-auto lg:overflow-visible">
        {navlinks.map((link, index) => {
          const IconComponent = link.icon;
          // Determine if the route is currently active to attach highlighted focus rings
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

          return (
            <li key={index} className="w-full lg:w-auto list-none m-0 p-0">
              <Link
                href={link.href}
                onClick={link.onClick}
                className={`
                  flex items-center gap-3 px-4 py-3 lg:py-2 rounded-xl text-sm font-semibold 
                  transition-all duration-200 ease-in-out group cursor-pointer text-decoration-none
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                    : 'text-slate-300 lg:text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hover:bg-slate-100/10'}
                `}
              >
                {/* Reusable Scalable Vector Graphic Container */}
                <div 
                  className={`
                    flex items-center justify-center transition-transform duration-200 group-hover:scale-110
                    ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}
                  `}
                >
                  <IconComponent size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span className="tracking-wide">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}