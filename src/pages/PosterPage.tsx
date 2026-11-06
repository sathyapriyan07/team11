import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { UserTeam, Player } from '../types/cricket';
import { PosterCanvas } from '../components/poster/PosterCanvas';
import { Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';

export const PosterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState<UserTeam[]>(() => storageService.getUserTeams());
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => storageService.getPlayers());
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => {
    const list = storageService.getUserTeams();
    return list[0]?.id || '';
  });

  useEffect(() => {
    const userTeams = storageService.getUserTeams();
    const pList = storageService.getPlayers();
    setTeams(userTeams);
    setAllPlayers(pList);

    const queryId = searchParams.get('id');
    if (queryId && userTeams.some((t) => t.id === queryId)) {
      setSelectedTeamId(queryId);
    } else if (userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [searchParams]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Broadcasting Graphics Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Playing XI Poster Generator
          </h1>
          <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
            Create cinema-grade visual posters for social media, WhatsApp groups, and match day build-up.
          </p>
        </div>

        {/* Team Selector */}
        {teams.length > 0 && (
          <div className="flex items-center gap-2 bg-[#121720] p-2 rounded-2xl border border-white/10">
            <span className="text-xs text-[#929BA8] px-2 font-semibold">Select Lineup:</span>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-[#181F29] text-white text-xs font-bold p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#20C878]"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.format} • {t.players.length} players)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Canvas Workspace */}
      {selectedTeam ? (
        <PosterCanvas team={selectedTeam} allPlayers={allPlayers} />
      ) : (
        <div className="p-16 text-center bg-[#121720] border border-white/5 rounded-3xl">
          <p className="text-sm font-semibold text-white">No teams available to generate poster.</p>
          <p className="text-xs text-[#929BA8] mt-1">Create a Playing XI in the builder first.</p>
        </div>
      )}
    </div>
  );
};
