import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { CustomPool, Player } from '../types/cricket';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Users,
  Check,
  Search,
  Share2,
  Heart,
  X,
} from 'lucide-react';

export const PoolsPage: React.FC = () => {
  const [pools, setPools] = useState<CustomPool[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPool, setEditingPool] = useState<CustomPool | null>(null);

  // Form states for creating/editing pool
  const [poolName, setPoolName] = useState<string>('');
  const [poolDesc, setPoolDesc] = useState<string>('');
  const [poolTags, setPoolTags] = useState<string>('IPL, T20, All-Stars');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerSearch, setPlayerSearch] = useState<string>('');

  useEffect(() => {
    setPools(storageService.getCustomPools());
    setPlayers(storageService.getPlayers());
    const unsub = storageService.subscribe(() => {
      setPools(storageService.getCustomPools());
      setPlayers(storageService.getPlayers());
    });
    return unsub;
  }, []);

  const openCreateModal = () => {
    setEditingPool(null);
    setPoolName('');
    setPoolDesc('');
    setPoolTags('IPL, T20');
    setSelectedPlayerIds([]);
    setModalOpen(true);
  };

  const openEditModal = (pool: CustomPool) => {
    setEditingPool(pool);
    setPoolName(pool.name);
    setPoolDesc(pool.description);
    setPoolTags(pool.tags.join(', '));
    setSelectedPlayerIds([...pool.playerIds]);
    setModalOpen(true);
  };

  const handleSavePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poolName.trim()) return;

    const poolToSave: CustomPool = {
      id: editingPool ? editingPool.id : `pool-${Date.now()}`,
      name: poolName.trim(),
      description: poolDesc.trim() || 'Custom curated cricket player pool',
      creatorName: 'CricketTactician',
      creatorId: 'user-default',
      createdAt: editingPool ? editingPool.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true,
      playerIds: selectedPlayerIds,
      tags: poolTags.split(',').map((t) => t.trim()).filter(Boolean),
      likesCount: editingPool ? editingPool.likesCount : 0,
    };

    storageService.saveCustomPool(poolToSave);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this custom player pool?')) {
      storageService.deleteCustomPool(id);
    }
  };

  const handleDuplicate = (pool: CustomPool) => {
    const copy: CustomPool = {
      ...pool,
      id: `pool-${Date.now()}`,
      name: `${pool.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storageService.saveCustomPool(copy);
  };

  const togglePlayerInPool = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const filteredPoolCandidates = players.filter((p) => {
    if (!playerSearch.trim()) return true;
    const term = playerSearch.toLowerCase();
    return p.fullName.toLowerCase().includes(term) || p.displayName.toLowerCase().includes(term) || p.country.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#20C878] mb-1">
            <Layers className="w-4 h-4" />
            <span>Curated Collections</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Custom Player Pools Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#929BA8] mt-1">
            Build custom player pools for special challenges, mini-tournaments, and targeted Playing XI creation.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-lg shadow-[#20C878]/25 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Player Pool</span>
        </button>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className="p-6 bg-[#121720] border border-white/10 rounded-2xl hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#20C878] uppercase tracking-wider">
                  {pool.playerIds.length} Players Enrolled
                </span>
                <div className="flex items-center gap-1 text-xs text-[#929BA8]">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                  <span>{pool.likesCount}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold font-heading text-white">{pool.name}</h3>
              <p className="text-xs text-[#929BA8] mt-2 leading-relaxed">{pool.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {pool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#181F29] border border-white/5 text-[#929BA8]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(pool)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                >
                  Edit Pool
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(pool)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#929BA8] hover:text-white"
                  title="Duplicate Pool"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pool.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#929BA8] hover:text-rose-400"
                  title="Delete Pool"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <Link
                to={`/builder/custom-pool?poolId=${pool.id}`}
                className="px-3.5 py-1.5 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Build XI</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Pool */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#121720] border border-white/10 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold font-heading text-white">
                {editingPool ? 'Edit Custom Pool' : 'Create New Player Pool'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#929BA8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePool} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[#929BA8] block mb-1">
                  Pool Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IPL 2025 Powerhitters or Spin Sorcerers"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#929BA8] block mb-1">
                  Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Tactical context for this player collection..."
                  value={poolDesc}
                  onChange={(e) => setPoolDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#929BA8] block mb-1">
                  Tags (comma separated):
                </label>
                <input
                  type="text"
                  placeholder="IPL, T20, All-Stars, Pace"
                  value={poolTags}
                  onChange={(e) => setPoolTags(e.target.value)}
                  className="w-full p-2.5 bg-[#181F29] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#20C878]"
                />
              </div>

              {/* Player Multi-Select Tray */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#929BA8]">
                    Select Enrolled Players ({selectedPlayerIds.length} Selected):
                  </label>
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="text-xs bg-[#181F29] text-white px-2 py-1 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-[#181F29] rounded-xl border border-white/5">
                  {filteredPoolCandidates.map((cand) => {
                    const isSelected = selectedPlayerIds.includes(cand.id);
                    return (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => togglePlayerInPool(cand.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#20C878]/20 border border-[#20C878] text-white'
                            : 'bg-[#121720] text-[#929BA8] hover:text-white border border-white/5'
                        }`}
                      >
                        {cand.imageUrl ? (
                          <img
                            src={cand.imageUrl}
                            alt={cand.displayName}
                            className="w-6 h-6 rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#202938] text-[10px] font-bold text-[#20C878]">
                            {cand.displayName.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1 truncate">
                          <span className="font-bold block truncate">{cand.displayName}</span>
                          <span className="text-[10px] text-[#929BA8] block">
                            {cand.primaryRole}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#20C878] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#929BA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#20C878] hover:bg-[#1bb56c] text-[#090B0F] font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Custom Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
