import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save, Trash2, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import {
  deletePlayerImage,
  isManagedPlayerImageUrl,
  uploadCountryFlag,
  uploadPlayerImage,
} from '../services/supabaseClient';
import {
  BattingHand,
  BowlingStyle,
  Player,
  PlayerAttributes,
  PlayerRole,
  PlayerStats,
  PlayerSpecialization,
  TeamEntity,
} from '../types/cricket';

const EMPTY_ATTRIBUTES: PlayerAttributes = {
  technique: 50,
  powerHitting: 50,
  timing: 50,
  shotSelection: 50,
  strikeRotation: 50,
  againstPace: 50,
  againstSpin: 50,
  finishing: 50,
  consistency: 50,
  pace: 50,
  swing: 50,
  seam: 50,
  spin: 50,
  accuracy: 50,
  variations: 50,
  deathBowling: 50,
  powerplayBowling: 50,
  control: 50,
  catching: 50,
  groundFielding: 50,
  throwing: 50,
  reflexes: 50,
  agility: 50,
  wkReflexes: 50,
  wkCatching: 50,
  wkStumping: 50,
  wkGlovework: 50,
  wkPositioning: 50,
  fitness: 50,
  experience: 50,
  leadership: 50,
  pressureHandling: 50,
  versatility: 50,
};

const ATTRIBUTE_GROUPS: {
  title: string;
  fields: { key: keyof PlayerAttributes; label: string }[];
}[] = [
  {
    title: 'Batting',
    fields: [
      { key: 'technique', label: 'Technique' },
      { key: 'powerHitting', label: 'Power hitting' },
      { key: 'timing', label: 'Timing' },
      { key: 'shotSelection', label: 'Shot selection' },
      { key: 'strikeRotation', label: 'Strike rotation' },
      { key: 'againstPace', label: 'Against pace' },
      { key: 'againstSpin', label: 'Against spin' },
      { key: 'finishing', label: 'Finishing' },
      { key: 'consistency', label: 'Consistency' },
    ],
  },
  {
    title: 'Bowling',
    fields: [
      { key: 'pace', label: 'Pace' },
      { key: 'swing', label: 'Swing' },
      { key: 'seam', label: 'Seam' },
      { key: 'spin', label: 'Spin' },
      { key: 'accuracy', label: 'Accuracy' },
      { key: 'variations', label: 'Variations' },
      { key: 'deathBowling', label: 'Death bowling' },
      { key: 'powerplayBowling', label: 'Powerplay bowling' },
      { key: 'control', label: 'Control' },
    ],
  },
  {
    title: 'Fielding & wicketkeeping',
    fields: [
      { key: 'catching', label: 'Catching' },
      { key: 'groundFielding', label: 'Ground fielding' },
      { key: 'throwing', label: 'Throwing' },
      { key: 'reflexes', label: 'Reflexes' },
      { key: 'agility', label: 'Agility' },
      { key: 'wkReflexes', label: 'WK reflexes' },
      { key: 'wkCatching', label: 'WK catching' },
      { key: 'wkStumping', label: 'WK stumping' },
      { key: 'wkGlovework', label: 'WK glovework' },
      { key: 'wkPositioning', label: 'WK positioning' },
    ],
  },
  {
    title: 'General',
    fields: [
      { key: 'fitness', label: 'Fitness' },
      { key: 'experience', label: 'Experience' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'pressureHandling', label: 'Pressure handling' },
      { key: 'versatility', label: 'Versatility' },
    ],
  },
];

const EMPTY_STATS: PlayerStats = {
  matches: 0,
  innings: 0,
  runs: 0,
  highestScore: '0',
  battingAverage: 0,
  strikeRate: 0,
  centuries: 0,
  fifties: 0,
  wickets: 0,
  bowlingAverage: 0,
  economy: 0,
  bestBowling: '0/0',
  fiveWickets: 0,
  catches: 0,
  stumpings: 0,
};

const STAT_FIELDS: { key: keyof PlayerStats; label: string; type: 'number' | 'text' | 'calculated' }[] = [
  { key: 'matches', label: 'Matches', type: 'number' },
  { key: 'innings', label: 'Innings', type: 'number' },
  { key: 'runs', label: 'Runs', type: 'number' },
  { key: 'highestScore', label: 'Highest score', type: 'text' },
  { key: 'battingAverage', label: 'Batting average (auto)', type: 'calculated' },
  { key: 'strikeRate', label: 'Strike rate', type: 'number' },
  { key: 'centuries', label: 'Centuries', type: 'number' },
  { key: 'fifties', label: 'Fifties', type: 'number' },
  { key: 'wickets', label: 'Wickets', type: 'number' },
  { key: 'bowlingAverage', label: 'Bowling average', type: 'number' },
  { key: 'economy', label: 'Economy', type: 'number' },
  { key: 'bestBowling', label: 'Best bowling', type: 'text' },
  { key: 'fiveWickets', label: 'Five-wicket hauls', type: 'number' },
  { key: 'catches', label: 'Catches', type: 'number' },
  { key: 'stumpings', label: 'Stumpings', type: 'number' },
];

type StatsFormat = 'T20' | 'ODI' | 'TEST' | 'IPL';

function withCalculatedBattingAverage(stats: PlayerStats): PlayerStats {
  const dismissals = stats.innings || stats.matches;
  return {
    ...stats,
    battingAverage: dismissals > 0 ? Number((stats.runs / dismissals).toFixed(2)) : 0,
  };
}

function createEmptyPlayer(): Player {
  return {
    id: '',
    fullName: '',
    displayName: '',
    country: '',
    nationality: '',
    imageUrl: '',
    primaryRole: 'Batter',
    secondaryRoles: [],
    specialization: 'Top-order batter',
    battingHand: 'Right-hand bat',
    bowlingStyle: 'None',
    careerStatus: 'Active',
    bio: '',
    overallRating: 50,
    formatRatings: { T20: 50, ODI: 50, TEST: 50 },
    attributes: { ...EMPTY_ATTRIBUTES },
    stats: {
      T20: { ...EMPTY_STATS },
      ODI: { ...EMPTY_STATS },
      TEST: { ...EMPTY_STATS },
    },
    teamsPlayed: [],
    isOverseasIPL: false,
  };
}

const inputClass =
  'mt-1 w-full rounded-xl border border-white/10 bg-[#181F29] p-3 text-sm text-white focus:border-[#20C878] focus:outline-none';
const labelClass = 'block text-xs font-semibold text-[#929BA8]';

export const AdminPlayerFormPage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flagFileInputRef = useRef<HTMLInputElement>(null);
  const skipPlayerReloadRef = useRef(false);
  const [form, setForm] = useState<Player>(createEmptyPlayer);
  const [availableTeams, setAvailableTeams] = useState<TeamEntity[]>(() => storageService.getTeams());
  const [cloudStatus, setCloudStatus] = useState(storageService.getCloudStorageStatus());
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [formError, setFormError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [flagUploadMessage, setFlagUploadMessage] = useState('');
  const [uploadingFlag, setUploadingFlag] = useState(false);
  const [statsFormat, setStatsFormat] = useState<StatsFormat>('T20');

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCloudStatus(storageService.getCloudStorageStatus());
      setAvailableTeams(storageService.getTeams());
      setCatalogVersion((version) => version + 1);
    });
    return unsubscribe;
  }, []);

  const existingPlayer = playerId ? storageService.getPlayerById(playerId) : undefined;

  useEffect(() => {
    if (existingPlayer) {
      if (skipPlayerReloadRef.current) {
        skipPlayerReloadRef.current = false;
        return;
      }
      setForm({
        ...existingPlayer,
        attributes: { ...EMPTY_ATTRIBUTES, ...existingPlayer.attributes },
        stats: {
          T20: withCalculatedBattingAverage({ ...EMPTY_STATS, ...existingPlayer.stats.T20 }),
          ODI: withCalculatedBattingAverage({ ...EMPTY_STATS, ...existingPlayer.stats.ODI }),
          TEST: withCalculatedBattingAverage({ ...EMPTY_STATS, ...existingPlayer.stats.TEST }),
          ...(existingPlayer.stats.IPL
            ? { IPL: withCalculatedBattingAverage({ ...EMPTY_STATS, ...existingPlayer.stats.IPL }) }
            : {}),
        },
      });
    }
  }, [playerId, catalogVersion]);

  const updateForm = <K extends keyof Player>(key: K, value: Player[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePlayerTeam = (teamId: string) => {
    setForm((current) => ({
      ...current,
      teamsPlayed: current.teamsPlayed.includes(teamId)
        ? current.teamsPlayed.filter((id) => id !== teamId)
        : [...current.teamsPlayed, teamId],
    }));
  };

  const updateRating = (key: 'overallRating' | 'T20' | 'ODI' | 'TEST', value: number) => {
    const rating = Math.max(1, Math.min(100, value));
    if (key === 'overallRating') updateForm('overallRating', rating);
    else setForm((current) => ({
      ...current,
      formatRatings: { ...current.formatRatings, [key]: rating },
    }));
  };

  const updatePlayerStats = <K extends keyof PlayerStats>(
    formatKey: StatsFormat,
    key: K,
    value: PlayerStats[K],
  ) => {
    setForm((current) => {
      const currentStats = current.stats[formatKey] ?? { ...EMPTY_STATS };
      const updatedStats = { ...currentStats, [key]: value } as PlayerStats;
      return {
        ...current,
        stats: {
          ...current.stats,
          [formatKey]: withCalculatedBattingAverage(updatedStats),
        },
      };
    });
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setUploadMessage('');
    if (!cloudStatus.configured) {
      setUploadMessage('Configure Supabase URL and anon key to upload images.');
      return;
    }
    if (!cloudStatus.isAdmin) {
      setUploadMessage('Sign in as an authorized admin on the Admin page before uploading.');
      return;
    }

    setUploading(true);
    try {
      updateForm('imageUrl', await uploadPlayerImage(file));
      setUploadMessage('Image uploaded. Save the player to keep this image.');
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFlagUpload = async (file?: File) => {
    if (!file) return;
    setFlagUploadMessage('');
    if (!cloudStatus.configured) {
      setFlagUploadMessage('Configure Supabase URL and anon key to upload images.');
      return;
    }
    if (!cloudStatus.isAdmin) {
      setFlagUploadMessage('Sign in as an authorized admin on the Admin page before uploading.');
      return;
    }

    setUploadingFlag(true);
    try {
      updateForm('countryFlagUrl', await uploadCountryFlag(file));
      setFlagUploadMessage('Flag uploaded. Save the player to keep this image.');
    } catch (error) {
      setFlagUploadMessage(error instanceof Error ? error.message : 'Flag upload failed.');
    } finally {
      setUploadingFlag(false);
      if (flagFileInputRef.current) flagFileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (field: 'imageUrl' | 'countryFlagUrl', label: string) => {
    updateForm(field, '');
    if (field === 'imageUrl') setUploadMessage(`${label} removed from the form. Save the player to apply.`);
    else setFlagUploadMessage(`${label} removed from the form. Save the player to apply.`);
  };

  const handleDeleteUploadedImage = async (
    field: 'imageUrl' | 'countryFlagUrl',
    label: string,
  ) => {
    const imageUrl = form[field];
    if (!imageUrl || !isManagedPlayerImageUrl(imageUrl)) return;
    if (!window.confirm(`Permanently delete this ${label.toLowerCase()} from the app’s image storage? This cannot be undone.`)) {
      return;
    }
    if (!cloudStatus.configured || !cloudStatus.isAdmin) {
      const message = 'Sign in as an authorized admin with Supabase configured before deleting uploaded files.';
      if (field === 'imageUrl') setUploadMessage(message);
      else setFlagUploadMessage(message);
      return;
    }

    if (field === 'imageUrl') setUploading(true);
    else setUploadingFlag(true);
    try {
      await deletePlayerImage(imageUrl);

      const savedPlayer = playerId ? storageService.getPlayerById(playerId) : undefined;
      if (savedPlayer?.[field] === imageUrl) {
        skipPlayerReloadRef.current = true;
        storageService.savePlayer({ ...savedPlayer, [field]: '' });
      }
      setForm((current) => ({ ...current, [field]: '' }));
      const message = `${label} permanently deleted from storage.`;
      if (field === 'imageUrl') setUploadMessage(message);
      else setFlagUploadMessage(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} deletion failed.`;
      if (field === 'imageUrl') setUploadMessage(message);
      else setFlagUploadMessage(message);
    } finally {
      if (field === 'imageUrl') setUploading(false);
      else setUploadingFlag(false);
    }
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (cloudStatus.configured && !cloudStatus.isAdmin) {
      setFormError('Sign in as an authorized admin on the Admin page before saving.');
      return;
    }
    if (!form.fullName.trim() || !form.country.trim()) {
      setFormError('Player name and country are required.');
      return;
    }

    const existing = playerId ? storageService.getPlayerById(playerId) : undefined;
    const saved: Player = {
      ...form,
      id: playerId ?? `p-${crypto.randomUUID()}`,
      fullName: form.fullName.trim(),
      displayName: form.displayName.trim() || form.fullName.trim().split(' ').slice(0, 2).join(' '),
      country: form.country.trim(),
      nationality: form.nationality.trim() || form.country.trim(),
      bio: form.bio.trim(),
      stats: form.stats,
      teamsPlayed: form.teamsPlayed,
      secondaryRoles: existing?.secondaryRoles ?? form.secondaryRoles,
    };

    storageService.savePlayer(saved);
    navigate('/admin', { state: { adminTab: 'players' } });
  };

  if (playerId && !existingPlayer && cloudStatus.state === 'loading') {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-[#929BA8]">Loading player…</div>;
  }

  if (playerId && !existingPlayer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p role="alert" className="text-rose-400">Player not found.</p>
        <Link to="/admin" className="mt-4 inline-flex text-sm text-[#20C878]">Back to admin</Link>
      </div>
    );
  }

  if (cloudStatus.configured && !cloudStatus.isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-[#121720] p-6">
          <h1 className="text-xl font-bold text-white">Admin sign-in required</h1>
          <p className="mt-2 text-sm text-[#929BA8]">Sign in on the Admin page before creating or editing players.</p>
          <Link to="/admin" className="mt-5 inline-flex rounded-xl bg-[#20C878] px-4 py-2 text-sm font-bold text-[#090B0F]">
            Go to Admin
          </Link>
        </div>
      </div>
    );
  }

  const specializations: PlayerSpecialization[] = [
    'Opening batter',
    'Top-order batter',
    'Middle-order batter',
    'Finisher',
    'Pace bowler',
    'Swing bowler',
    'Fast-medium bowler',
    'Leg-spinner',
    'Off-spinner',
    'Left-arm orthodox',
    'Wrist spinner',
  ];
  const bowlingStyles: BowlingStyle[] = [
    'Right-arm fast',
    'Right-arm fast-medium',
    'Right-arm medium',
    'Left-arm fast',
    'Left-arm fast-medium',
    'Right-arm off-break',
    'Right-arm leg-break',
    'Left-arm orthodox',
    'Left-arm wrist-spin',
    'None',
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/admin" className="mb-5 inline-flex items-center gap-2 text-sm text-[#929BA8] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#20C878]">Player Registry</p>
        <h1 className="mt-1 text-3xl font-extrabold text-white">{playerId ? 'Edit Player' : 'Add Player'}</h1>
        <p className="mt-2 text-sm text-[#929BA8]">Manage player details, ratings, images, and career statistics.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
          <h2 className="mb-5 text-lg font-bold text-white">Player details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className={labelClass}>Full name
              <input required value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>Display name
              <input value={form.displayName} onChange={(e) => updateForm('displayName', e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>Country
              <input required value={form.country} onChange={(e) => { updateForm('country', e.target.value); updateForm('nationality', e.target.value); }} className={inputClass} />
            </label>
            <label className={labelClass}>Nationality
              <input value={form.nationality} onChange={(e) => updateForm('nationality', e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>Date of birth
              <input type="date" value={form.dob ?? ''} onChange={(e) => updateForm('dob', e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>Career status
              <select value={form.careerStatus} onChange={(e) => updateForm('careerStatus', e.target.value as Player['careerStatus'])} className={inputClass}>
                <option>Active</option><option>Retired</option><option>Legend</option>
              </select>
            </label>
            <label className={labelClass}>Primary role
              <select value={form.primaryRole} onChange={(e) => updateForm('primaryRole', e.target.value as PlayerRole)} className={inputClass}>
                <option>Wicketkeeper</option><option>Batter</option><option>All-rounder</option><option>Bowler</option>
              </select>
            </label>
            <label className={labelClass}>Specialization
              <select value={form.specialization} onChange={(e) => updateForm('specialization', e.target.value as PlayerSpecialization)} className={inputClass}>
                {specializations.map((specialization) => <option key={specialization}>{specialization}</option>)}
              </select>
            </label>
            <label className={labelClass}>Batting hand
              <select value={form.battingHand} onChange={(e) => updateForm('battingHand', e.target.value as BattingHand)} className={inputClass}>
                <option>Right-hand bat</option><option>Left-hand bat</option>
              </select>
            </label>
            <label className={labelClass}>Bowling style
              <select value={form.bowlingStyle} onChange={(e) => updateForm('bowlingStyle', e.target.value as BowlingStyle)} className={inputClass}>
                {bowlingStyles.map((style) => <option key={style}>{style}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 self-end pb-2 text-sm text-white">
              <input type="checkbox" checked={Boolean(form.isOverseasIPL)} onChange={(e) => updateForm('isOverseasIPL', e.target.checked)} className="h-4 w-4 accent-[#20C878]" />
              Overseas player for IPL rules
            </label>
            <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>Bio
              <textarea rows={3} value={form.bio} onChange={(e) => updateForm('bio', e.target.value)} className={inputClass} />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
          <h2 className="mb-2 text-lg font-bold text-white">Associated teams &amp; franchises</h2>
          <p className="mb-5 text-xs text-[#929BA8]">Select the teams and national sides this player has represented. These appear on the player profile.</p>
          {availableTeams.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableTeams.map((team) => (
                <label key={team.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#181F29] p-3 text-sm text-white transition-colors hover:border-[#20C878]/50">
                  <input
                    type="checkbox"
                    checked={form.teamsPlayed.includes(team.id)}
                    onChange={() => togglePlayerTeam(team.id)}
                    className="h-4 w-4 accent-[#20C878]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{team.name}</span>
                    <span className="block text-xs text-[#929BA8]">{team.type} · {team.code}</span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-[#929BA8]">
              No teams are available. Add teams in the Admin team management section first.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
          <h2 className="mb-5 text-lg font-bold text-white">Player image</h2>
          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div>
              <label className={labelClass}>Image URL
                <input type="url" value={form.imageUrl} onChange={(e) => updateForm('imageUrl', e.target.value)} className={inputClass} />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => void handleImageUpload(e.target.files?.[0])} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!cloudStatus.configured || !cloudStatus.isAdmin || uploading} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                  <ImagePlus className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Choose image file'}
                </button>
                <span className="text-xs text-[#929BA8]">JPEG, PNG, WebP, or GIF · up to 5 MB</span>
              </div>
              {form.imageUrl && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleRemoveImage('imageUrl', 'Player image')} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-[#C0C7D1] hover:bg-white/10">
                    <X className="h-3.5 w-3.5" /> Remove image
                  </button>
                  {isManagedPlayerImageUrl(form.imageUrl) && (
                    <button type="button" onClick={() => void handleDeleteUploadedImage('imageUrl', 'Player image')} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete uploaded file
                    </button>
                  )}
                </div>
              )}
              {uploadMessage && <p role="status" className="mt-3 text-xs text-[#20C878]">{uploadMessage}</p>}
              {!cloudStatus.configured && <p className="mt-2 text-xs text-amber-300">Configure Supabase to enable file uploads.</p>}
              {cloudStatus.configured && !cloudStatus.isAdmin && <p className="mt-2 text-xs text-amber-300">Admin sign-in is required for file uploads.</p>}
            </div>
            {form.imageUrl && <img src={form.imageUrl} alt="Player preview" className="h-28 w-28 rounded-2xl border border-white/10 object-cover" />}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
          <h2 className="mb-2 text-lg font-bold text-white">Country / nationality flag</h2>
          <p className="mb-5 text-xs text-[#929BA8]">Upload the flag associated with this player’s country or nationality.</p>
          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div>
              <label className={labelClass}>Flag image URL
                <input type="url" value={form.countryFlagUrl ?? ''} onChange={(e) => updateForm('countryFlagUrl', e.target.value)} className={inputClass} />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input ref={flagFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => void handleFlagUpload(e.target.files?.[0])} />
                <button type="button" onClick={() => flagFileInputRef.current?.click()} disabled={!cloudStatus.configured || !cloudStatus.isAdmin || uploadingFlag} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                  <ImagePlus className="h-4 w-4" /> {uploadingFlag ? 'Uploading…' : 'Choose flag image'}
                </button>
                <span className="text-xs text-[#929BA8]">JPEG, PNG, WebP, or GIF · up to 5 MB</span>
              </div>
              {form.countryFlagUrl && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleRemoveImage('countryFlagUrl', 'Country flag')} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-[#C0C7D1] hover:bg-white/10">
                    <X className="h-3.5 w-3.5" /> Remove flag
                  </button>
                  {isManagedPlayerImageUrl(form.countryFlagUrl) && (
                    <button type="button" onClick={() => void handleDeleteUploadedImage('countryFlagUrl', 'Country flag')} disabled={uploadingFlag} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete uploaded file
                    </button>
                  )}
                </div>
              )}
              {flagUploadMessage && <p role="status" className="mt-3 text-xs text-[#20C878]">{flagUploadMessage}</p>}
              {!cloudStatus.configured && <p className="mt-2 text-xs text-amber-300">Configure Supabase to enable file uploads.</p>}
              {cloudStatus.configured && !cloudStatus.isAdmin && <p className="mt-2 text-xs text-amber-300">Admin sign-in is required for file uploads.</p>}
            </div>
            {form.countryFlagUrl && <img src={form.countryFlagUrl} alt="Country flag preview" className="h-12 w-20 self-start rounded border border-white/10 object-cover" />}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
          <h2 className="mb-5 text-lg font-bold text-white">Overall and format ratings</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ['overallRating', 'Overall'],
              ['T20', 'T20'],
              ['ODI', 'ODI'],
              ['TEST', 'Test'],
            ] as const).map(([key, label]) => (
              <label key={key} className={labelClass}>{label} rating (1–100)
                <input type="number" min={1} max={100} required value={key === 'overallRating' ? form.overallRating : form.formatRatings[key]} onChange={(e) => updateRating(key, Number(e.target.value))} className={inputClass} />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Career statistics</h2>
            <p className="mt-1 text-xs text-[#929BA8]">Enter the player’s career totals for each format. Decimal values are supported for averages, strike rate, and economy.</p>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {(['T20', 'ODI', 'TEST', 'IPL'] as const).map((formatKey) => (
              <button
                key={formatKey}
                type="button"
                onClick={() => setStatsFormat(formatKey)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  statsFormat === formatKey
                    ? 'bg-[#20C878] text-[#090B0F]'
                    : 'bg-[#181F29] text-[#929BA8] hover:text-white'
                }`}
              >
                {formatKey}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STAT_FIELDS.map(({ key, label, type }) => (
              <label key={key} className={labelClass}>
                {label}
                <input
                  type={type === 'text' ? 'text' : 'number'}
                  min={type === 'number' ? 0 : undefined}
                  step={type === 'number' ? 'any' : undefined}
                  readOnly={type === 'calculated'}
                  value={form.stats[statsFormat]?.[key] ?? EMPTY_STATS[key]}
                  onChange={(event) => {
                    if (type === 'number') {
                      updatePlayerStats(statsFormat, key, Number(event.target.value));
                    } else if (type === 'text') {
                      updatePlayerStats(statsFormat, key, event.target.value);
                    }
                  }}
                  className={`${inputClass} ${type === 'calculated' ? 'cursor-not-allowed opacity-75' : ''}`}
                />
              </label>
            ))}
          </div>
        </section>

        {ATTRIBUTE_GROUPS.map((group) => (
          <section key={group.title} className="rounded-3xl border border-white/10 bg-[#121720] p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-white">{group.title} ratings</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {group.fields.map(({ key, label }) => (
                <label key={key} className={labelClass}>{label} (1–100)
                  <input type="number" min={1} max={100} required value={form.attributes[key] ?? 50} onChange={(e) => setForm((current) => ({
                    ...current,
                    attributes: { ...current.attributes, [key]: Math.max(1, Math.min(100, Number(e.target.value))) },
                  }))} className={inputClass} />
                </label>
              ))}
            </div>
          </section>
        ))}

        {formError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{formError}</p>}
        <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-white/10 bg-[#090B0F]/95 p-3 backdrop-blur">
          <Link to="/admin" className="rounded-xl px-4 py-3 text-sm font-semibold text-[#929BA8] hover:text-white">Cancel</Link>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#20C878] px-5 py-3 text-sm font-bold text-[#090B0F] hover:bg-[#1bb56c]">
            <Save className="h-4 w-4" /> Save player
          </button>
        </div>
      </form>
    </div>
  );
};
