import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Layers,
  Users,
  Compass,
  Trophy,
  Sliders,
  Sparkles,
  Bookmark,
  Settings,
  Menu,
  X,
  PlusCircle,
  BarChart2,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  theme: 'black' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [builderDropdownOpen, setBuilderDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Players', path: '/players', icon: Users },
    { label: 'Teams', path: '/teams', icon: Shield },
    { label: 'Competitions', path: '/competitions', icon: Trophy },
    { label: 'Custom Pools', path: '/pools', icon: Layers },
    { label: 'Auto Generator', path: '/generator', icon: Sparkles },
    { label: 'Compare', path: '/compare', icon: BarChart2 },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'My Teams', path: '/my-teams', icon: Bookmark },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#090B0F]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="group flex shrink-0 items-center">
            <span className="font-heading text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-[#20C878]">
              team11
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 whitespace-nowrap text-xs font-semibold 2xl:flex">
            {/* Builder Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBuilderDropdownOpen(!builderDropdownOpen)}
                onBlur={() => setTimeout(() => setBuilderDropdownOpen(false), 200)}
                className={`flex shrink-0 cursor-pointer items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                  location.pathname.startsWith('/builder')
                    ? 'text-[#20C878] bg-[#20C878]/10'
                    : 'text-[#929BA8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Builder</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {builderDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-[#121720] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <Link
                    to="/builder/dream"
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-[#181F29] text-white hover:text-[#20C878]"
                  >
                    <div className="font-bold">Dream XI</div>
                    <div className="text-[#929BA8] text-[10px]">Open pool across all leagues</div>
                  </Link>
                  <Link
                    to="/builder/franchise"
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-[#181F29] text-white hover:text-[#20C878]"
                  >
                    <div className="font-bold">Franchise XI</div>
                    <div className="text-[#929BA8] text-[10px]">Official IPL team squads</div>
                  </Link>
                  <Link
                    to="/builder/all-time"
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-[#181F29] text-white hover:text-[#20C878]"
                  >
                    <div className="font-bold">All-Time XI</div>
                    <div className="text-[#929BA8] text-[10px]">Historical legends & icons</div>
                  </Link>
                  <Link
                    to="/builder/international"
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-[#181F29] text-white hover:text-[#20C878]"
                  >
                    <div className="font-bold">International XI</div>
                    <div className="text-[#929BA8] text-[10px]">National World Cup rosters</div>
                  </Link>
                  <Link
                    to="/builder/custom-pool"
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-[#181F29] text-white hover:text-[#20C878]"
                  >
                    <div className="font-bold">Custom Pool XI</div>
                    <div className="text-[#929BA8] text-[10px]">From your custom pools</div>
                  </Link>
                </div>
              )}
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex shrink-0 items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                    isActive(link.path)
                      ? 'text-[#20C878] bg-[#20C878]/10'
                      : 'text-[#929BA8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action CTA & Admin link */}
          <div className="hidden shrink-0 items-center gap-1.5 2xl:flex">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'black' ? 'light' : 'black'} theme`}
              title={`Switch to ${theme === 'black' ? 'light' : 'black'} theme`}
              className="rounded-xl p-2 text-[#929BA8] transition-colors hover:bg-white/5 hover:text-white"
            >
              {theme === 'black' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/admin"
              className="p-2 rounded-xl text-[#929BA8] hover:text-white hover:bg-white/5 transition-colors"
              title="Admin Panel & Database Management"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <Link
              to="/builder/dream"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#20C878] px-3 py-2 text-xs font-bold text-[#090B0F] shadow-lg shadow-[#20C878]/20 transition-all hover:scale-[1.02] hover:bg-[#1bb56c]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create XI</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-1.5 2xl:hidden">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'black' ? 'light' : 'black'} theme`}
              title={`Switch to ${theme === 'black' ? 'light' : 'black'} theme`}
              className="rounded-lg p-2 text-[#929BA8] transition-colors hover:bg-white/5 hover:text-white"
            >
              {theme === 'black' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/builder/dream"
              className="whitespace-nowrap rounded-lg bg-[#20C878] px-3 py-1.5 text-xs font-bold text-[#090B0F]"
            >
              Create XI
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#929BA8] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="2xl:hidden bg-[#121720] border-b border-white/10 px-4 py-4 flex flex-col gap-2">
          <Link
            to="/builder/dream"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-xl font-bold bg-[#20C878] text-[#090B0F] flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Playing XI Builder</span>
          </Link>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive(link.path)
                    ? 'text-[#20C878] bg-[#20C878]/10'
                    : 'text-[#929BA8] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#929BA8] hover:text-white"
          >
            <Settings className="w-4 h-4" />
            <span>Admin & Database Controls</span>
          </Link>
        </div>
      )}
    </nav>
  );
};
