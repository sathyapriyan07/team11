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
} from 'lucide-react';

export const Navbar: React.FC = () => {
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20C878] to-[#1bb56c] flex items-center justify-center shadow-lg shadow-[#20C878]/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-black text-lg tracking-tighter font-heading">
                XI
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold font-heading text-white tracking-wide flex items-center gap-1.5">
                XI ARENA
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#20C878]/15 text-[#20C878] font-bold uppercase tracking-widest border border-[#20C878]/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-[#929BA8] font-medium tracking-tight -mt-1">
                Cricket Playing XI Builder
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold">
            {/* Builder Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBuilderDropdownOpen(!builderDropdownOpen)}
                onBlur={() => setTimeout(() => setBuilderDropdownOpen(false), 200)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
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
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 rounded-xl text-[#929BA8] hover:text-white hover:bg-white/5 transition-colors"
              title="Admin Panel & Database Management"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <Link
              to="/builder/dream"
              className="px-4 py-2 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Playing XI</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/builder/dream"
              className="px-3 py-1.5 bg-[#20C878] text-[#090B0F] font-bold text-xs rounded-lg"
            >
              + Create XI
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
        <div className="lg:hidden bg-[#121720] border-b border-white/10 px-4 py-4 flex flex-col gap-2">
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
