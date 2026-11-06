import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { storageService } from '../services/storageService';
import { uploadPlayerImage } from '../services/supabaseClient';
import {
  BattingHand,
  BowlingStyle,
  Player,
  PlayerAttributes,
  PlayerRole,
  PlayerStats,
  PlayerSpecialization,
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
  const [form, setForm] = useState<Player>(createEmptyPlayer);
  const [cloudStatus, setCloudStatus] = useState(storageService.getCloudStorageStatus());
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [formError, setFormError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCloudStatus(storageService.getCloudStorageStatus());
      setCatalogVersion((version) => version + 1);
    });
    return unsubscribe;
  }, []);

  const existingPlayer = playerId ? storageService.getPlayerById(playerId) : undefined;

  useEffect(() => {
    if (existingPlayer) setForm({ ...existingPlayer, attributes: { ...EMPTY_ATTRIBUTES, ...existingPlayer.attributes } });
  }, [playerId, catalogVersion]);

  const updateForm = <K extends keyof Player>(key: K, value: Player[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateRating = (key: 'overallRating' | 'T20' | 'ODI' | 'TEST', value: number) => {
    const rating = Math.max(1, Math.min(100, value));
    if (key === 'overallRating') updateForm('overallRating', rating);
    else setForm((current) => ({
      ...current,
      formatRatings: { ...current.formatRatings, [key]: rating },
    }));
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
      stats: existing?.stats ?? form.stats,
      teamsPlayed: existing?.teamsPlayed ?? form.teamsPlayed,
      secondaryRoles: existing?.secondaryRoles ?? form.secondaryRoles,
    };

    storageService.savePlayer(saved);
    navigate('/admin');
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
        <p className="mt-2 text-sm text-[#929BA8]">Enter player details and ratings. Career statistics can be added later.</p>
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
              {uploadMessage && <p role="status" className="mt-3 text-xs text-[#20C878]">{uploadMessage}</p>}
              {!cloudStatus.configured && <p className="mt-2 text-xs text-amber-300">Configure Supabase to enable file uploads.</p>}
              {cloudStatus.configured && !cloudStatus.isAdmin && <p className="mt-2 text-xs text-amber-300">Admin sign-in is required for file uploads.</p>}
            </div>
            {form.imageUrl && <img src={form.imageUrl} alt="Player preview" className="h-28 w-28 rounded-2xl border border-white/10 object-cover" />}
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
