import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  Compass,
  Layers3,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface NavbarProps {
  theme: 'black' | 'light';
  onToggleTheme: () => void;
}

const builderLinks = [
  { label: 'Dream XI', path: '/builder/dream', description: 'Open player pool' },
  { label: 'Franchise XI', path: '/builder/franchise', description: 'Official squads' },
  { label: 'All-Time XI', path: '/builder/all-time', description: 'Across generations' },
  { label: 'International XI', path: '/builder/international', description: 'National teams' },
  { label: 'Custom Pool XI', path: '/builder/custom-pool', description: 'Your player list' },
  { label: 'Auto-Generated XI', path: '/generator', description: 'Tactical engine' },
];

const moreLinks = [
  { label: 'Teams', path: '/teams', icon: Shield },
  { label: 'Competitions', path: '/competitions', icon: Trophy },
  { label: 'Auto Generator', path: '/generator', icon: Sparkles },
  { label: 'Player Compare', path: '/compare', icon: BarChart3 },
  { label: 'Team Compare', path: '/team-compare', icon: BarChart3 },
  { label: 'My Teams', path: '/my-teams', icon: Users },
  { label: 'Admin', path: '/admin', icon: Settings },
];

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [builderMenuOpen, setBuilderMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setProfileEmail(session?.user?.email || null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setBuilderMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !builderMenuOpen && !moreMenuOpen) return;
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setBuilderMenuOpen(false);
        setMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', closeMenus);
    return () => window.removeEventListener('keydown', closeMenus);
  }, [mobileMenuOpen, builderMenuOpen, moreMenuOpen]);

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));
  const builderIsActive = location.pathname.startsWith('/builder');
  const moreIsActive = moreLinks.some((link) => isActive(link.path));
  const activeLinkClasses = 'bg-white/[0.08] text-[#F5F5F6]';
  const idleLinkClasses = 'text-[#A0A5AE] hover:bg-white/[0.05] hover:text-[#F5F5F6]';

  return (
    <nav className="sticky top-0 z-50 border-b border-[#262A32] bg-[#090A0D]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-3">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B7BBC4]"
            aria-label="Team11 home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#454B56] bg-[#171A20] font-heading text-xs font-bold tracking-tight text-[#D4D7DC]">
              XI
            </span>
            <span className="font-heading text-lg font-semibold tracking-[-0.04em] text-[#F5F5F6] transition-colors group-hover:text-[#C7CBD2]">
              team11
            </span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            <Link
              to="/players"
              aria-current={isActive('/players') ? 'page' : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${isActive('/players') ? activeLinkClasses : idleLinkClasses}`}
            >
              <Users className="h-4 w-4" />
              Players
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-expanded={builderMenuOpen}
                aria-controls="builder-menu"
                onClick={() => {
                  setBuilderMenuOpen((open) => !open);
                  setMoreMenuOpen(false);
                }}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${
                  builderIsActive || builderMenuOpen ? activeLinkClasses : idleLinkClasses
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Builder
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${builderMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                id="builder-menu"
                aria-hidden={!builderMenuOpen}
                className={`absolute left-0 top-full mt-2 w-60 origin-top rounded-xl border border-[#262A32] bg-[#111318] p-2 shadow-2xl shadow-black/40 transition duration-150 ${
                  builderMenuOpen
                    ? 'visible translate-y-0 opacity-100'
                    : 'invisible -translate-y-1 pointer-events-none opacity-0'
                }`}
              >
                {builderLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    tabIndex={builderMenuOpen ? 0 : -1}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition ${
                      isActive(link.path) ? 'bg-white/[0.07] text-white' : 'text-[#D2D4D9] hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-xs font-medium">{link.label}</span>
                    <span className="text-[9px] text-[#858B96]">{link.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/pools"
              aria-current={isActive('/pools') ? 'page' : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${isActive('/pools') ? activeLinkClasses : idleLinkClasses}`}
            >
              <Layers3 className="h-4 w-4" />
              Pools
            </Link>
            <Link
              to="/explore"
              aria-current={isActive('/explore') ? 'page' : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${isActive('/explore') ? activeLinkClasses : idleLinkClasses}`}
            >
              <Compass className="h-4 w-4" />
              Explore
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-label="More navigation links"
                aria-expanded={moreMenuOpen}
                aria-controls="more-menu"
                onClick={() => {
                  setMoreMenuOpen((open) => !open);
                  setBuilderMenuOpen(false);
                }}
                className={`inline-flex min-h-10 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition ${
                  moreIsActive || moreMenuOpen ? activeLinkClasses : idleLinkClasses
                }`}
              >
                More <MoreHorizontal className="h-4 w-4" />
              </button>
              <div
                id="more-menu"
                aria-hidden={!moreMenuOpen}
                className={`absolute right-0 top-full mt-2 w-52 origin-top-right rounded-xl border border-[#262A32] bg-[#111318] p-2 shadow-2xl shadow-black/40 transition duration-150 ${
                  moreMenuOpen
                    ? 'visible translate-y-0 opacity-100'
                    : 'invisible -translate-y-1 pointer-events-none opacity-0'
                }`}
              >
                {moreLinks.map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    tabIndex={moreMenuOpen ? 0 : -1}
                    className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs transition ${
                      isActive(path) ? 'bg-white/[0.07] text-white' : 'text-[#A0A5AE] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'black' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'black' ? 'light' : 'dark'} theme`}
              className="grid h-10 w-10 place-items-center rounded-lg text-[#A0A5AE] transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
            >
              {theme === 'black' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {profileEmail && (
              <Link
                to="/my-teams"
                aria-label={`Open your Team11 profile${profileEmail ? `, ${profileEmail}` : ''}`}
                title={profileEmail}
                className={`grid h-9 w-9 place-items-center rounded-full border border-[#343943] bg-[#171A20] text-xs font-semibold uppercase text-[#D6D8DD] transition hover:border-[#666D79] ${isActive('/my-teams') ? 'ring-1 ring-[#B7BBC4]' : ''}`}
              >
                {profileEmail.slice(0, 1)}
              </Link>
            )}
            <Link
              to="/builder/dream"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#B7BBC4] px-4 text-xs font-semibold text-[#111318] transition hover:bg-[#D5D8DE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
            >
              <Plus className="h-4 w-4" />
              Create XI
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'black' ? 'light' : 'dark'} theme`}
              className="grid h-10 w-10 place-items-center rounded-lg text-[#A0A5AE] transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
            >
              {theme === 'black' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/builder/dream"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#B7BBC4] px-3 text-xs font-semibold text-[#111318] transition hover:bg-[#D5D8DE]"
            >
              <Plus className="h-3.5 w-3.5" />
              Create XI
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-lg text-[#D1D4DA] transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        className={`overflow-hidden border-t border-[#262A32] bg-[#111318]/95 transition-[max-height,opacity] duration-300 ease-out xl:hidden ${
          mobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 border-transparent opacity-0'
        }`}
      >
        <div className="mx-auto max-h-[80vh] max-w-7xl overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/players"
              aria-current={isActive('/players') ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium ${isActive('/players') ? activeLinkClasses : idleLinkClasses}`}
            >
              <Users className="h-4 w-4" /> Players
            </Link>
            <Link
              to="/pools"
              aria-current={isActive('/pools') ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium ${isActive('/pools') ? activeLinkClasses : idleLinkClasses}`}
            >
              <Layers3 className="h-4 w-4" /> Pools
            </Link>
            <Link
              to="/explore"
              aria-current={isActive('/explore') ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium ${isActive('/explore') ? activeLinkClasses : idleLinkClasses}`}
            >
              <Compass className="h-4 w-4" /> Explore
            </Link>
            {profileEmail && (
              <Link to="/my-teams" className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium ${isActive('/my-teams') ? activeLinkClasses : idleLinkClasses}`}>
                <Users className="h-4 w-4" /> Profile
              </Link>
            )}
          </div>

          <div className="mt-5">
            <p className="px-3 text-[9px] font-semibold tracking-[0.16em] text-[#858B96]">BUILD A LINEUP</p>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {builderLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 text-xs ${isActive(link.path) ? activeLinkClasses : idleLinkClasses}`}
                >
                  {link.label} <ChevronDown className="h-3 w-3 -rotate-90 text-[#858B96]" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-[#262A32] pt-4">
            <p className="px-3 text-[9px] font-semibold tracking-[0.16em] text-[#858B96]">DISCOVER & MANAGE</p>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {moreLinks.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs ${isActive(path) ? activeLinkClasses : idleLinkClasses}`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
