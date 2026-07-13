import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FileText, User as UserIcon, Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm font-semibold transition-colors duration-150 hover:text-black dark:hover:text-white ${
      isActive(path)
        ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-1'
        : 'text-slate-600 dark:text-slate-400'
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-l-4 transition-all duration-150 ${
      isActive(path)
        ? 'bg-slate-100 dark:bg-slate-800 border-black dark:border-white text-black dark:text-white'
        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white'
    }`;

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b no-print transition-colors duration-300"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-black dark:bg-white">
              <FileText className="h-4 w-4 text-white dark:text-black" />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              CV<span className="font-normal" style={{ color: 'var(--text-secondary)' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/designer" className={linkClass('/designer')}>Resume Designer</Link>
            <Link to="/analyzer" className={linkClass('/analyzer')}>Resume Analyzer</Link>
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            <Link to="/about" className={linkClass('/about')}>About</Link>
            <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-3">

            {/* Guest Badge */}
            <div
              className="hidden sm:flex items-center gap-2 pl-3 py-1.5 pr-4 rounded text-xs font-semibold border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 dark:bg-slate-300 flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-white dark:text-slate-800" />
              </div>
              Guest Mode
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full border transition-all duration-200 hover:scale-110"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {isDark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-slate-600" />
              }
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 md:hidden focus:outline-none rounded"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          className="md:hidden border-t absolute left-0 w-full shadow-xl py-2 z-50"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="space-y-0.5">
            <Link to="/" onClick={() => setIsOpen(false)} className={mobileLinkClass('/')}>Home</Link>
            <Link to="/designer" onClick={() => setIsOpen(false)} className={mobileLinkClass('/designer')}>Resume Designer</Link>
            <Link to="/analyzer" onClick={() => setIsOpen(false)} className={mobileLinkClass('/analyzer')}>Resume Analyzer</Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className={mobileLinkClass('/dashboard')}>Dashboard</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className={mobileLinkClass('/about')}>About</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className={mobileLinkClass('/contact')}>Contact</Link>
          </div>

          {/* Mobile bottom: Guest badge + Theme toggle */}
          <div
            className="mt-3 pt-3 border-t px-4 flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 dark:bg-slate-300 flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-white dark:text-slate-800" />
              </div>
              Guest Mode
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
