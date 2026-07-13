import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return `text-sm font-semibold transition-colors duration-150 hover:text-black ${
      isActive(path) ? 'text-black border-b-2 border-black pb-1' : 'text-slate-600'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black">
                <FileText className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-black text-black tracking-tight">
                CV<span className="text-slate-500 font-normal">AI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/designer" className={linkClass('/designer')}>Resume Designer</Link>
            <Link to="/analyzer" className={linkClass('/analyzer')}>Resume Analyzer</Link>
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            <Link to="/about" className={linkClass('/about')}>About</Link>
            <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pl-3 py-1.5 pr-4 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">Guest Mode</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
