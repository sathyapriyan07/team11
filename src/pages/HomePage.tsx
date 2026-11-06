import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Shield,
  Trophy,
  Users,
  Compass,
  ArrowRight,
  Target,
  Zap,
  CheckCircle,
  TrendingUp,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserTeam, Player } from '../types/cricket';
import { CricketFieldSvg } from '../components/cricket-field/CricketFieldSvg';
import { PlayerCard } from '../components/player/PlayerCard';
import { PlayerDetailModal } from '../components/player/PlayerDetailModal';

export const HomePage: React.FC = () => {
  const [featuredTeams, setFeaturedTeams] = useState<UserTeam[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    setFeaturedTeams(storageService.getUserTeams().slice(0, 3));
    setPlayers(storageService.getPlayers().slice(0, 6));

    const unsub = storageService.subscribe(() => {
      setFeaturedTeams(storageService.getUserTeams().slice(0, 3));
      setPlayers(storageService.getPlayers().slice(0, 6));
    });
    return unsub;
  }, []);

  const builderModes = [
    {
      id: 'dream',
      title: 'Dream XI',
      tagline: 'Cross-League Superteam',
      desc: 'Build your ultimate world fantasy dream squad across any competition with zero franchise constraints.',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-[#20C878]',
      link: '/builder/dream',
    },
    {
      id: 'franchise',
      title: 'Franchise XI',
      tagline: 'Official IPL Squads',
      desc: 'Select CSK, MI, RCB, KKR and more. Enforces season-specific squads and 4-overseas player quotas.',
      icon: Trophy,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      link: '/builder/franchise',
    },
    {
      id: 'all-time',
      title: 'All-Time XI',
      tagline: 'Historical Cricket Pantheon',
      desc: 'Pair modern icons like Kohli and Bumrah alongside immortal legends like Tendulkar, Warne and Malinga.',
      icon: Shield,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
      link: '/builder/all-time',
    },
    {
      id: 'international',
      title: 'International XI',
      tagline: 'World Cup & Test Rosters',
      desc: 'Assemble national team lineups for T20 World Cup, 50-over ODI World Cup, or World Test Championship.',
      icon: Target,
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
      link: '/builder/international',
    },
    {
      id: 'custom-pool',
      title: 'Custom Pool XI',
      tagline: 'User-Curated Player Lists',
      desc: 'Form teams strictly within custom player lists created by you or shared by the community.',
      icon: Users,
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
      link: '/builder/custom-pool',
    },
    {
      id: 'auto',
      title: 'Auto-Generated XI',
      tagline: 'Algorithmic Optimization',
      desc: 'Generate balanced, high-octane lineups using tactical scoring engines and multi-constraint solver.',
      icon: Zap,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      link: '/generator',
    },
  ];

  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/5">
        {/* Subtle radial glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#20C878]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Top Announcement Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181F29] border border-[#20C878]/30 text-xs font-semibold text-[#20C878] mb-6 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-[#20C878]" />
            <span>IPL 2025 Ready • Tactical Squad Builder & Lineup Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight max-w-4xl leading-[1.1]">
            Build The Ultimate{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C878] via-emerald-400 to-[#3BA7FF]">
              Cricket Playing XI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#929BA8] max-w-2xl mt-5 leading-relaxed font-normal">
            The professional workstation for cricket tacticians. Select from centralized player records, validate competition rules, arrange visual fields, inspect deep team metrics, and export broadcast-grade posters.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/builder/dream"
              className="px-6 py-3.5 bg-[#20C878] hover:bg-[#1bb56c] active:scale-[0.98] text-[#090B0F] font-extrabold text-sm rounded-xl shadow-xl shadow-[#20C878]/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Launch Playing XI Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/generator"
              className="px-6 py-3.5 bg-[#181F29] hover:bg-[#202938] border border-white/10 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#3BA7FF]" />
              <span>Auto-Generate Best XI</span>
            </Link>

            <Link
              to="/explore"
              className="px-6 py-3.5 bg-transparent hover:bg-white/5 text-[#929BA8] hover:text-white text-sm font-semibold rounded-xl transition-all"
            >
              Explore Community Lineups
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 pt-10 border-t border-white/5 w-full max-w-3xl text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white">6</div>
              <div className="text-xs text-[#929BA8] mt-1">Builder Modes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#20C878]">100%</div>
              <div className="text-xs text-[#929BA8] mt-1">Rules Validated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3BA7FF]">25+</div>
              <div className="text-xs text-[#929BA8] mt-1">Field Positions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-400">4K</div>
              <div className="text-xs text-[#929BA8] mt-1">PNG Poster Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Builder Modes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#20C878]">
              Versatile Lineup Creation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
              Six Specialized Builder Modes
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#929BA8] max-w-md">
            Whether replicating your favorite IPL franchise's starting lineup or generating an optimal world XI, each mode enforces tailored eligibility logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {builderModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.id}
                to={mode.link}
                className={`group relative p-6 rounded-2xl bg-[#121720] border hover:border-white/20 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${mode.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#181F29] border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/70">
                      {mode.tagline}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-white group-hover:text-[#20C878] transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-[#929BA8] mt-2 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-white mt-6 pt-4 border-t border-white/5">
                  <span>Enter Mode</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Visual Cricket Field Showcase */}
      {featuredTeams[0] && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#121720] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3BA7FF]">
                  Interactive Ground Visualization
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold font-heading text-white">
                  Fielding Placements & Tactical Formations
                </h2>
                <p className="text-sm text-[#929BA8] leading-relaxed">
                  Experience your Playing XI on a true-to-scale cricket ground with authentic inner ring, boundary lines, wicket spots, and drag-and-drop position management. Apply attacking slip cordons or defensive death-overs boundary lockdowns with a single click.
                </p>

                <div className="flex flex-col gap-2.5 mt-2 text-xs text-[#F5F7FA]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#20C878]" />
                    <span>Top-down SVG field with pitch creases, stumps, and 30-yard circle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#20C878]" />
                    <span>Preset tactical formations (Attacking Slips, Balanced, Death Overs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#20C878]" />
                    <span>Designated Captain, Vice-Captain, and Wicketkeeper badges</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Link
                    to={`/builder/${featuredTeams[0].mode}?id=${featuredTeams[0].id}`}
                    className="px-5 py-2.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/20 flex items-center gap-2"
                  >
                    <span>Open Field Visualizer</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="flex-1 w-full max-w-lg">
                <CricketFieldSvg
                  teamPlayers={featuredTeams[0].players}
                  allPlayers={storageService.getPlayers()}
                  editable={false}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Centralized Players Database Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#20C878]">
              Centralized Records
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
              World-Class Player Database
            </h2>
          </div>
          <Link
            to="/players"
            className="text-xs sm:text-sm font-semibold text-[#20C878] hover:underline flex items-center gap-1"
          >
            <span>View All Players</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onViewDetails={setSelectedPlayer}
              compact={false}
            />
          ))}
        </div>
      </section>

      {/* 5. Featured Community Lineups */}
      {featuredTeams.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3BA7FF]">
                Community Gallery
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
                Trending Playing XIs
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs sm:text-sm font-semibold text-[#3BA7FF] hover:underline flex items-center gap-1"
            >
              <span>Explore Public Lineups</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-[#121720] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#20C878] uppercase tracking-wider">
                      {team.format} • {team.mode.toUpperCase()} XI
                    </span>
                    <span className="text-xs text-[#929BA8]">By {team.authorName}</span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-white">{team.title}</h3>
                  <p className="text-xs text-[#929BA8] mt-2 line-clamp-2 leading-relaxed">
                    {team.tacticalNotes || team.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#929BA8]">
                    <span>❤️ {team.likesCount} Likes</span>
                    <span>•</span>
                    <span>⭐ {team.players.length} Starters</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/poster?id=${team.id}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-white transition-colors"
                      title="Create Team Poster"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/builder/${team.mode}?id=${team.id}`}
                      className="px-4 py-1.5 rounded-xl bg-[#20C878] text-[#090B0F] text-xs font-bold hover:bg-[#1bb56c] transition-colors"
                    >
                      Inspect XI
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Player Details Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
};
