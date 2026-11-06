import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { UserTeam, Player } from '../types/cricket';
import {
  Bookmark,
  Sliders,
  Copy,
  Trash2,
  Image as ImageIcon,
  Share2,
  Plus,
  Heart,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const MyTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<UserTeam[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setTeams(storageService.getUserTeams());
    setAllPlayers(storageService.getPlayers());
    const unsub = storageService.subscribe(() => {
      setTeams(storageService.getUserTeams());
    });
    return unsub;
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Delete this team lineup?')) {
      storageService.deleteUserTeam(id);
    }
  };

  const handleDuplicate = (id: string) => {
    storageService.duplicateUserTeam(id);
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/builder/dream?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Workspace Archive</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            My Tactical Lineups
          </h1>
          <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
            Manage your saved drafts, finished tournament XIs, and exported team posters.
          </p>
        </div>

        <Link
          to="/builder/dream"
          className="px-5 py-2.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/25 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Playing XI</span>
        </Link>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="p-16 text-center bg-[#121720] border border-white/5 rounded-3xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#181F29] flex items-center justify-center text-3xl mb-4 border border-white/5">
            🏏
          </div>
          <h3 className="text-lg font-bold text-white font-heading">No Saved Teams Yet</h3>
          <p className="text-xs text-[#929BA8] max-w-sm mt-1">
            Build your first cricket lineup using the Dream XI, Franchise, or All-Time builder modes.
          </p>
          <Link
            to="/builder/dream"
            className="mt-6 px-5 py-2.5 bg-[#20C878] text-[#090B0F] font-bold text-xs rounded-xl shadow-md"
          >
            Launch Builder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const starterNames = team.players
              .map((p) => playersMap.get(p.playerId)?.displayName)
              .filter(Boolean)
              .slice(0, 5);

            return (
              <div
                key={team.id}
                className="bg-[#121720] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#20C878]/15 text-[#20C878] uppercase tracking-wider border border-[#20C878]/30">
                      {team.mode} XI • {team.format}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        team.status === 'completed' || team.status === 'published'
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : 'bg-amber-400/20 text-amber-300'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-white line-clamp-1">{team.title}</h3>
                  <p className="text-xs text-[#929BA8] mt-2 line-clamp-2 leading-relaxed">
                    {team.tacticalNotes || team.description}
                  </p>

                  {/* Sample Starters */}
                  {starterNames.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="text-[10px] text-[#929BA8] block uppercase">Lineup Preview:</span>
                      <span className="text-xs text-[#F5F7FA] font-medium mt-0.5 block truncate">
                        {starterNames.join(', ')}...
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-[#929BA8]">
                    <span>{team.players.length} Starters Picked</span>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                      <span>{team.likesCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleShare(team.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-white transition-colors"
                        title="Copy Share Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(team.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-white transition-colors"
                        title="Duplicate XI"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(team.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#929BA8] hover:text-rose-400 transition-colors"
                        title="Delete XI"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/poster?id=${team.id}`}
                        className="px-3 py-1.5 rounded-xl bg-[#181F29] hover:bg-[#202938] text-xs font-semibold text-[#3BA7FF] border border-[#3BA7FF]/30 flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Poster</span>
                      </Link>

                      <Link
                        to={`/builder/${team.mode}?id=${team.id}`}
                        className="px-4 py-1.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md"
                      >
                        Edit XI
                      </Link>
                    </div>
                  </div>

                  {copiedId === team.id && (
                    <span className="text-[10px] text-center text-[#20C878] font-semibold animate-in fade-in">
                      ✓ Shareable lineup link copied to clipboard!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
