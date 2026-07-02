'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, LayoutDashboard, LogOut, User } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import { useAuth } from '../../Context/AuthContext'; // 🔑 Import your global app context

export default function Header() {
  const [hamburgerStatus, setHamburgerStatus] = useState<boolean>(false);
  
  // 🔑 Destructure your authentication state and logout handler from your context
  // Replace 'user' and 'logout' with whatever your actual context variables are named
   const { user,logout } = useAuth();

  const handleLogoutClick = async () => {
    setHamburgerStatus(false);
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full h-[72px] bg-slate-900 border-b border-slate-800 backdrop-blur-md z-50 flex items-center box-border select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative box-border">
        
        {/* BRANDING LOGO */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-white font-extrabold text-xl tracking-wider text-decoration-none shrink-0"
          onClick={() => setHamburgerStatus(false)}
        >
          <span className="bg-blue-600 px-2.5 py-1 rounded-lg text-sm font-black shadow-md shadow-blue-600/20">ATPLC</span>
          <span className="hidden sm:inline text-sm font-bold tracking-widest text-slate-300">PORTAL</span>
        </Link>

        {/* NAVIGATION WRAPPER */}
        <Navbar 
          hamburgerStatus={hamburgerStatus} 
          setHamburgerStatus={setHamburgerStatus} 
        />

        {/* ACTIONS REGION: CONDITIONAL LOGIN STATUS */}
        <div className="flex items-center gap-3 shrink-0">
          
          {user ? (
            /* 💡 AUTHENTICATED STATE: Show Dashboard & Logout Actions */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer box-border"
                title="Sign Out"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            /* 💡 UNAUTHENTICATED STATE: Show Original Sign In Button */
            <Link
              href="/login"
              onClick={() => setHamburgerStatus(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-98 tracking-wide uppercase text-decoration-none cursor-pointer box-border"
            >
              <LogIn size={14} strokeWidth={2.5} />
              <span>Sign In</span>
            </Link>
          )}

          {/* MOBILE HAMBURGER TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setHamburgerStatus(!hamburgerStatus)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white transition-all cursor-pointer box-border"
            aria-label={hamburgerStatus ? 'Close menu' : 'Open menu'}
          >
            {hamburgerStatus ? <X size={20} /> : <Menu size={20} />}
          </button>
          
        </div>

      </div>
    </header>
  );
}