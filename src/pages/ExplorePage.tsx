import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { UserTeam, Player } from '../types/cricket';
import {
  Compass,
  Heart,
  Bookmark,
  Copy,
  Sliders,
  Search,
  Filter,
  Flame,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<UserTeam[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<string>('All');

  useEffect(() => {
    setTeams(storageService.getUserTeams().filter((t) => t.isPublic));
    setAllPlayers(storageService.getPlayers());

    const unsub = storageService.subscribe(() => {
      setTeams(storageService.getUserTeams().filter((t) => t.isPublic));
    });
    return unsub;
  }, []);

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (formatFilter !== 'All' && t.format !== formatFilter) return false;
      if (modeFilter !== 'All' && t.mode !== modeFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(term);
        const matchDesc = (t.description || '').toLowerCase().includes(term);
        const matchNotes = (t.tacticalNotes || '').toLowerCase().includes(term);
        const matchAuthor = t.authorName.toLowerCase().includes(term);
        if (!matchTitle && !matchDesc && !matchNotes && !matchAuthor) return false;
      }
      return true;
    });
  }, [teams, formatFilter, modeFilter, searchTerm]);

  const handleLike = (teamId: string) => {
    storageService.toggleTeamLike(teamId);
  };

  const handleBookmark = (teamId: string) => {
    storageService.toggleTeamBookmark(teamId);
  };

  const handleCloneIntoWorkspace = (team: UserTeam) => {
    const copy = storageService.duplicateUserTeam(team.id);
    if (copy) {
      navigate(`/builder/${copy.mode}?id=${copy.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3BA7FF] mb-1">
          <Compass className="w-4 h-4" />
          <span>Public Tactical Gallery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Explore Community Lineups
        </h1>
        <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
          Discover tactical masterclasses, controversial XI debates, and dream team combinations crafted by cricket enthusiasts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121720] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#929BA8]" />
            <input
              type="text"
              placeholder="Search public lineups by title, author, or strategy tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181F29] border border-white/10 rounded-xl text-sm text-white placeholder-[#929BA8] focus:outline-none focus:border-[#3BA7FF]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Format Filter */}
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-[#181F29] text-white text-xs border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#3BA7FF] w-full sm:w-auto"
            >
              <option value="All">All Formats</option>
              <option value="T20">T20 Leagues & WC</option>
              <option value="ODI">50-Over ODIs</option>
              <option value="TEST">Test Matches</option>
            </select>

            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-[#181F29] text-white text-xs border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#3BA7FF] w-full sm:w-auto"
            >
              <option value="All">All Modes</option>
              <option value="dream">Dream XI</option>
              <option value="franchise">Franchise XI</option>
              <option value="all-time">All-Time XI</option>
              <option value="international">International XI</option>
              <option value="custom-pool">Custom Pool</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#929BA8] pt-1">
          <span>Showing {filteredTeams.length} public lineups</span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Ranked by Tactical Resonance
          </span>
        </div>
      </div>

      {/* Lineup Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const isLiked = storageService.isTeamLiked(team.id);
          const isBookmarked = storageService.isTeamBookmarked(team.id);

          const starterNames = team.players
            .map((p) => playersMap.get(p.playerId)?.displayName)
            .filter(Boolean)
            .slice(0, 4);

          return (
            <div
              key={team.id}
              className="bg-[#121720] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3BA7FF]/15 text-[#3BA7FF] uppercase tracking-wider border border-[#3BA7FF]/30">
                    {team.mode} XI • {team.format}
                  </span>

                  <span className="text-xs text-[#929BA8] font-medium">
                    By {team.authorName}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-heading text-white line-clamp-1">
                  {team.title}
                </h3>
                <p className="text-xs text-[#929BA8] mt-2 line-clamp-2 leading-relaxed">
                  {team.tacticalNotes || team.description}
                </p>

                {/* Starters list */}
                {starterNames.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-[#929BA8] block uppercase">Selected Lineup:</span>
                    <span className="text-xs text-[#F5F7FA] font-medium mt-0.5 block truncate">
                      {starterNames.join(', ')}...
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  {/* Likes and Bookmarks */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(team.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isLiked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-white/5 text-[#929BA8] hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`}
                      />
                      <span>{team.likesCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBookmark(team.id)}
                      className={`p-1.5 rounded-lg text-xs transition-all ${
                        isBookmarked
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-white/5 text-[#929BA8] hover:text-white'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark Lineup'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCloneIntoWorkspace(team)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                      title="Clone into your workspace to modify"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone</span>
                    </button>

                    <Link
                      to={`/builder/${team.mode}?id=${team.id}`}
                      className="px-4 py-1.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
