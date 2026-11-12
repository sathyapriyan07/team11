import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Crown,
  Flag,
  Image as ImageIcon,
  Layers3,
  Play,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  Users,
  WandSparkles,
} from 'lucide-react';
import { CricketFieldSvg } from '../components/cricket-field/CricketFieldSvg';
import { storageService, type CloudStorageStatus } from '../services/storageService';
import { generateAutomatedXI } from '../engines/teamGenerator';
import { Player, TeamEntity, UserTeam, UserTeamPlayer } from '../types/cricket';

type PlayerPoolTab = 'Featured' | 'IPL' | 'International' | 'Legends' | 'Recently added';

const builderModes = [
  {
    id: 'dream',
    title: 'Dream XI',
    category: 'OPEN PLAYER POOL',
    description: 'Bring the game’s best together. Build across leagues, eras and countries.',
    route: '/builder/dream',
    icon: Sparkles,
    featured: true,
    number: '01',
  },
  {
    id: 'franchise',
    title: 'Franchise XI',
    category: 'OFFICIAL SQUADS',
    description: 'Pick from franchise squads with season-aware eligibility and overseas rules.',
    route: '/builder/franchise',
    icon: Trophy,
    featured: true,
    number: '02',
  },
  {
    id: 'all-time',
    title: 'All-Time XI',
    category: 'ACROSS GENERATIONS',
    description: 'Put legendary careers side by side and settle the all-time debate.',
    route: '/builder/all-time',
    icon: Shield,
    featured: false,
    number: '03',
  },
  {
    id: 'international',
    title: 'International XI',
    category: 'NATIONAL TEAMS',
    description: 'Create a national side for the format and competition you care about.',
    route: '/builder/international',
    icon: Flag,
    featured: false,
    number: '04',
  },
  {
    id: 'custom-pool',
    title: 'Custom Pool XI',
    category: 'YOUR PLAYER LIST',
    description: 'Build from a pool you curated or discovered in the community.',
    route: '/builder/custom-pool',
    icon: Layers3,
    featured: false,
    number: '05',
  },
  {
    id: 'auto',
    title: 'Auto-Generated XI',
    category: 'TACTICAL ENGINE',
    description: 'Generate a balanced side using player ratings and lineup constraints.',
    route: '/generator',
    icon: WandSparkles,
    featured: false,
    number: '06',
  },
] as const;

const playerPoolTabs: PlayerPoolTab[] = [
  'Featured',
  'IPL',
  'International',
  'Legends',
  'Recently added',
];

interface HomePlayerCardProps {
  player: Player;
  teamName?: string;
  competitionName?: string;
}

const HomePlayerCard: React.FC<HomePlayerCardProps> = ({
  player,
  teamName,
  competitionName,
}) => {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <article className="group w-[min(76vw,248px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#262A32] bg-[#111318] transition duration-300 hover:-translate-y-1 hover:border-[#555B66] sm:w-[248px]">
      <Link
        to={`/players/${player.id}`}
        aria-label={`View ${player.displayName}'s profile`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
      >
        <div className="relative aspect-[4/4.3] overflow-hidden bg-[#171A20]">
          {player.imageUrl && !imageUnavailable ? (
            <img
              src={player.imageUrl}
              alt={player.displayName}
              loading="lazy"
              decoding="async"
              onError={() => setImageUnavailable(true)}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_25%,#343944_0,#171A20_58%)] text-6xl font-semibold text-white/20">
              {player.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-black/5" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {player.countryFlagUrl && (
              <img src={player.countryFlagUrl} alt="" className="h-3.5 w-5 object-contain" loading="lazy" />
            )}
            <span className="rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur">
              {player.country}
            </span>
          </div>
          <span className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
            {player.overallRating} rating
          </span>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-semibold text-[#F5F5F6] group-hover:text-white">
                {player.displayName}
              </h3>
              <p className="mt-1 text-xs text-[#858B96]">{player.primaryRole}</p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#858B96] transition-transform group-hover:translate-x-1 group-hover:text-[#B7BBC4]" />
          </div>
          <p className="min-h-4 truncate text-[11px] text-[#858B96]">
            {[teamName, competitionName].filter(Boolean).join(' · ') || 'Team details not listed'}
          </p>
        </div>
      </Link>
    </article>
  );
};

interface TeamPreviewProps {
  team: UserTeam;
  playersById: Map<string, Player>;
}

const TeamPreview: React.FC<TeamPreviewProps> = ({ team, playersById }) => {
  const previewPlayers = team.players
    .map(({ playerId }) => playersById.get(playerId))
    .filter((player): player is Player => Boolean(player))
    .slice(0, 5);

  return (
    <div className="flex items-center -space-x-2.5" aria-label={`${previewPlayers.length} player portraits`}>
      {previewPlayers.map((player) => (
        <div
          key={player.id}
          className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#111318] bg-[#262A32]"
          title={player.displayName}
        >
          {player.imageUrl ? (
            <img src={player.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
          ) : (
            <span className="grid h-full place-items-center text-xs font-semibold text-white/70">
              {player.displayName.slice(0, 1)}
            </span>
          )}
        </div>
      ))}
      {team.players.length > previewPlayers.length && (
        <span className="ml-1 rounded-full border border-[#262A32] bg-[#171A20] px-2 py-1 text-[10px] text-[#B7BBC4]">
          +{team.players.length - previewPlayers.length}
        </span>
      )}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [teams, setTeams] = useState<TeamEntity[]>([]);
  const [competitions, setCompetitions] = useState(storageService.getCompetitions());
  const [cloudStatus, setCloudStatus] = useState<CloudStorageStatus>(storageService.getCloudStorageStatus());
  const [activePoolTab, setActivePoolTab] = useState<PlayerPoolTab>('Featured');
  const [isLoading, setIsLoading] = useState(cloudStatus.state === 'loading');

  useEffect(() => {
    const refreshData = () => {
      setPlayers(storageService.getPlayers());
      setUserTeams(storageService.getUserTeams());
      setTeams(storageService.getTeams());
      setCompetitions(storageService.getCompetitions());
      const nextStatus = storageService.getCloudStorageStatus();
      setCloudStatus(nextStatus);
      setIsLoading(nextStatus.state === 'loading');
    };

    refreshData();
    return storageService.subscribe(refreshData);
  }, []);

  const playersById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );
  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  );
  const competitionsById = useMemo(
    () => new Map(competitions.map((competition) => [competition.id, competition])),
    [competitions],
  );
  const savedTeams = useMemo(
    () => [...userTeams].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [userTeams],
  );
  const communityTeams = useMemo(
    () => savedTeams.filter((team) => team.isPublic && team.status === 'published').slice(0, 3),
    [savedTeams],
  );
  const fieldTeam = savedTeams.find((team) => team.players.length > 0);

  const generatedPreview = useMemo(
    () => (players.length > 0
      ? generateAutomatedXI(players, { strategy: 'balanced', format: 'T20' }).players
      : []),
    [players],
  );
  const heroTeam = savedTeams.find((team) => team.players.length > 0);
  const heroPlayers = (heroTeam?.players ?? generatedPreview)
    .map((member) => ({ member, player: playersById.get(member.playerId) }))
    .filter((entry): entry is { member: UserTeamPlayer; player: Player } => Boolean(entry.player));
  const heroRoles = heroPlayers.reduce<Record<string, number>>((result, { player }) => {
    result[player.primaryRole] = (result[player.primaryRole] || 0) + 1;
    return result;
  }, {});

  const playerPools = useMemo(() => {
    const franchiseIds = new Set(teams.filter((team) => team.type === 'Franchise').map((team) => team.id));
    const nationalIds = new Set(teams.filter((team) => team.type === 'National').map((team) => team.id));
    const recentPlayers = [...players]
      .filter((player) => player.createdAt)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 10);

    return {
      Featured: [...players].sort((a, b) => b.overallRating - a.overallRating).slice(0, 10),
      IPL: players.filter((player) =>
        player.isOverseasIPL || player.teamsPlayed.some((teamId) => franchiseIds.has(teamId)),
      ).slice(0, 10),
      International: players.filter((player) =>
        player.teamsPlayed.some((teamId) => nationalIds.has(teamId)),
      ).slice(0, 10),
      Legends: players.filter((player) => player.careerStatus === 'Legend').slice(0, 10),
      'Recently added': recentPlayers,
    } satisfies Record<PlayerPoolTab, Player[]>;
  }, [players, teams]);

  const visiblePool = playerPools[activePoolTab];
  const featuredTeam = (team: UserTeam) => {
    const associatedTeam = teamsById.get(team.teamId || team.franchiseId || '');
    const competition = competitionsById.get(
      team.competitionId || associatedTeam?.competitionId || '',
    );
    return {
      competition: competition?.name,
      teamName: associatedTeam?.name,
    };
  };
  const editorRoute = fieldTeam
    ? `/builder/${fieldTeam.mode}?id=${fieldTeam.id}`
    : '/builder/dream';
  const fieldPlayers: UserTeamPlayer[] = fieldTeam
    ? fieldTeam.players.map((member) => {
        const placement = fieldTeam.fieldPlacements?.find((item) => item.playerId === member.playerId);
        return placement ? { ...member, fieldingPosition: placement.position } : member;
      })
    : generatedPreview;
  const wicketkeeper = fieldPlayers.find((member) => member.isWicketkeeper);
  const bowler = fieldPlayers.find((member) =>
    playersById.get(member.playerId)?.primaryRole === 'Bowler',
  );
  const fieldTeamName = fieldTeam?.title || (generatedPreview.length ? 'Balanced player-pool preview' : 'Your field preview');

  const playerPoolStatus = isLoading
    ? 'Loading players from the catalog…'
    : cloudStatus.state === 'error'
    ? 'The shared catalog could not be refreshed. Showing the data available on this device.'
    : `Explore ${players.length} player${players.length === 1 ? '' : 's'} in the catalog`;

  return (
    <div className="overflow-hidden bg-[#090A0D] text-[#F5F5F6]">
      <section
        className="relative border-b border-[#262A32]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 78% 36%, rgba(116,126,145,.18), transparent 35%), radial-gradient(ellipse at 12% 0%, rgba(92,100,115,.14), transparent 42%)',
        }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:px-8 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#343943] bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#B7BBC4] sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7BBC4]" />
              THE ULTIMATE CRICKET LINEUP BUILDER
            </div>
            <h1 className="max-w-xl font-heading text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.045em] text-[#F5F5F6] sm:text-5xl lg:text-[3.55rem]">
              Build Your Ultimate <span className="text-[#B7BBC4]">Cricket XI.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#A0A5AE] sm:text-base sm:leading-7">
              Pick your players, shape a balanced side and bring every decision onto the field.
              One thoughtful workspace for cricket fans, selectors and strategists.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/builder/dream"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B7BBC4] px-5 py-3 text-sm font-semibold text-[#111318] transition hover:bg-[#D5D8DE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Create Your XI
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/players"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#343943] bg-white/[0.025] px-5 py-3 text-sm font-medium text-[#E2E4E8] transition hover:border-[#626875] hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
              >
                <Users className="h-4 w-4 text-[#AEB3BC]" />
                Explore Players
              </Link>
              <Link
                to="/generator"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#A0A5AE] transition hover:text-[#F5F5F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
              >
                <WandSparkles className="h-4 w-4" />
                Generate Best XI
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[#858B96]">
              <span className="inline-flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#B7BBC4]" />
                Competition-aware rules
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#B7BBC4]" />
                Tactical field view
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(169,177,192,.14),transparent_68%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.65rem] border border-[#343943] bg-[#111318]/95 p-4 shadow-2xl shadow-black/40 sm:p-5">
              <div
                className="absolute inset-0 opacity-60"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
                }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.18em] text-[#858B96]">PLAYING XI PREVIEW</p>
                    <h2 className="mt-1 font-heading text-lg font-semibold text-[#F5F5F6]">
                      {heroTeam?.title || 'Build a side that fits your game'}
                    </h2>
                  </div>
                  <span className="rounded-full border border-[#414752] bg-[#171A20] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7BBC4]">
                    {heroTeam?.format || 'T20'}
                  </span>
                </div>

                <div className="relative mt-5 min-h-[245px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_50%_105%,#333A43_0%,#20252D_42%,#15181E_75%)] sm:min-h-[280px]">
                  <div className="absolute inset-x-[11%] bottom-[-37%] aspect-square rounded-full border border-white/10" />
                  <div className="absolute inset-x-[20%] bottom-[-26%] aspect-square rounded-full border border-white/[0.08]" />
                  <div className="absolute inset-x-[30%] bottom-[-15%] aspect-square rounded-full border border-white/[0.07]" />
                  <div className="absolute left-1/2 top-[18%] h-[51%] w-[18%] -translate-x-1/2 rounded-[45%] border border-white/10 bg-white/[0.025]" />
                  <div className="absolute left-1/2 top-[43%] h-[16%] w-[12%] -translate-x-1/2 rounded-sm border border-white/10 bg-white/[0.045]" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

                  {heroPlayers.length > 0 ? (
                    <div className="absolute inset-0">
                      {heroPlayers.slice(0, 9).map(({ member, player }, index) => {
                        const angle = (index / Math.min(heroPlayers.length, 9)) * Math.PI * 2 - Math.PI / 2;
                        const x = 50 + Math.cos(angle) * 35;
                        const y = 53 + Math.sin(angle) * 35;
                        const designation = member.isCaptain
                          ? 'C'
                          : member.isViceCaptain
                          ? 'VC'
                          : null;

                        return (
                          <div
                            key={player.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${x}%`, top: `${y}%` }}
                          >
                            <div className="relative h-9 w-9 overflow-visible rounded-full border border-white/50 bg-[#414752] shadow-lg shadow-black/40 sm:h-11 sm:w-11">
                              {player.imageUrl ? (
                                <img
                                  src={player.imageUrl}
                                  alt={player.displayName}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  fetchPriority={index === 0 ? 'high' : 'auto'}
                                  decoding="async"
                                  className="h-full w-full rounded-full object-cover object-top"
                                />
                              ) : (
                                <span className="grid h-full place-items-center rounded-full text-xs font-semibold text-white/80">
                                  {player.displayName.slice(0, 1)}
                                </span>
                              )}
                              {designation && (
                                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border border-[#111318] bg-[#D9DCE2] px-1 text-[8px] font-bold text-[#111318]">
                                  {designation}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
                          <Users className="h-5 w-5 text-[#B7BBC4]" />
                        </div>
                        <p className="mt-3 text-xs font-medium text-white/80">Your player pool will appear here</p>
                        <p className="mt-1 text-[10px] text-white/50">Add players to preview your XI</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold tracking-[0.16em] text-white/55">SQUAD STATUS</p>
                      <p className="mt-1 font-heading text-lg font-semibold text-white">
                        {heroPlayers.length} <span className="text-sm font-normal text-white/55">players selected</span>
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-black/35 px-2.5 py-1.5 text-[9px] font-medium text-white/75 backdrop-blur">
                      <Play className="h-3 w-3 fill-current" />
                      TACTICAL VIEW
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    ['BAT', heroRoles.Batter || 0],
                    ['WK', heroRoles.Wicketkeeper || 0],
                    ['AR', heroRoles['All-rounder'] || 0],
                    ['BOWL', heroRoles.Bowler || 0],
                  ].map(([label, count]) => (
                    <div key={label} className="rounded-xl border border-[#262A32] bg-[#171A20]/80 px-2 py-2.5 text-center">
                      <p className="font-heading text-base font-semibold text-[#E3E5E9]">{count}</p>
                      <p className="mt-0.5 text-[8px] font-semibold tracking-[0.12em] text-[#858B96]">{label}</p>
                    </div>
                  ))}
                </div>

                {heroPlayers.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroPlayers
                      .filter(({ member }) => member.isCaptain || member.isViceCaptain)
                      .map(({ member, player }) => (
                        <span
                          key={player.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#343943] bg-white/[0.035] px-2.5 py-1 text-[10px] text-[#B7BBC4]"
                        >
                          <Crown className="h-3 w-3" />
                          {member.isCaptain ? 'C' : 'VC'} · {player.displayName}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Team11 at a glance" className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          { label: 'BUILDER MODES', value: builderModes.length, icon: SlidersHorizontal },
          { label: 'PLAYERS PER XI', value: 11, icon: Users },
          { label: 'COMPETITIONS', value: competitions.length, icon: Trophy },
          { label: 'SAVED LINEUPS', value: savedTeams.length, icon: Layers3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-[#262A32] bg-[#111318] px-4 py-4 sm:px-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#343943] bg-[#171A20] text-[#B7BBC4]">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-xl font-semibold text-[#F5F5F6]">{value}</p>
              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.14em] text-[#858B96]">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="builder-modes" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB3BC]">PICK YOUR FORMAT</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#F5F5F6] sm:text-3xl">
              One game. Six ways to build.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#858B96]">
            Start with an open pool, stay inside a squad or let the lineup engine find a balance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {builderModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.id}
                to={mode.route}
                className={`group relative isolate flex min-h-[226px] flex-col overflow-hidden rounded-2xl border border-[#262A32] bg-[#111318] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#626875] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4] ${
                  mode.featured ? 'sm:col-span-1 lg:col-span-2 lg:min-h-[258px] lg:p-7' : ''
                }`}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 opacity-90 transition duration-500 group-hover:opacity-100"
                  style={{
                    backgroundImage: mode.featured
                      ? 'radial-gradient(ellipse at 85% 20%, rgba(183,187,196,.16), transparent 40%), linear-gradient(135deg, #171A20, #111318 72%)'
                      : 'radial-gradient(ellipse at 95% 0%, rgba(183,187,196,.09), transparent 42%)',
                  }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#C2C6CE]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded-full border border-[#343943] px-2.5 py-1 text-[8px] font-semibold tracking-[0.13em] text-[#858B96]">
                    {mode.category}
                  </span>
                </div>
                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-[#F5F5F6]">{mode.title}</h3>
                      <p className="mt-1.5 max-w-md text-xs leading-5 text-[#858B96]">{mode.description}</p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#343943] text-[#B7BBC4] transition group-hover:border-[#7B818D] group-hover:bg-[#B7BBC4] group-hover:text-[#111318]">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:-rotate-45" />
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className="absolute right-5 top-16 font-heading text-5xl font-semibold text-white/[0.035]">
                  {mode.number}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#262A32] bg-[#0D0F13]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-12 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB3BC]">THE GAME, FROM EVERY ANGLE</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#F5F5F6] sm:text-3xl">
              A lineup is more than eleven names.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#858B96]">
              See your selected side on the ground, with positions mapped to a cricket field and key roles called out.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg border border-[#262A32] bg-[#171A20] px-3 py-2 text-xs text-[#B7BBC4]">Fielding positions</span>
              <span className="rounded-lg border border-[#262A32] bg-[#171A20] px-3 py-2 text-xs text-[#B7BBC4]">Wicketkeeper & bowler</span>
              <span className="rounded-lg border border-[#262A32] bg-[#171A20] px-3 py-2 text-xs text-[#B7BBC4]">Captaincy roles</span>
            </div>
            <Link
              to={editorRoute}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#B7BBC4] px-4 py-2.5 text-sm font-semibold text-[#111318] transition hover:bg-[#D5D8DE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
            >
              {fieldTeam ? 'Open Field Editor' : 'Try Field Editor'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!fieldTeam && players.length === 0 && (
              <p className="mt-3 flex max-w-sm items-start gap-2 text-xs leading-5 text-[#858B96]">
                <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Add players to your catalog to see them in the field preview.
              </p>
            )}
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-[1fr_190px]">
            <div className="min-w-0 rounded-2xl border border-[#262A32] bg-[#111318] p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#E6E7EA]">{fieldTeamName}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#858B96]">
                    {fieldTeam?.season || fieldTeam?.format || 'T20'} · {fieldPlayers.length} players
                  </p>
                </div>
                <Target className="h-4 w-4 shrink-0 text-[#AEB3BC]" />
              </div>
              <CricketFieldSvg teamPlayers={fieldPlayers} allPlayers={players} editable={false} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {[
                {
                  label: 'WICKETKEEPER',
                  player: wicketkeeper ? playersById.get(wicketkeeper.playerId) : undefined,
                  icon: Shield,
                },
                {
                  label: 'BOWLER',
                  player: bowler ? playersById.get(bowler.playerId) : undefined,
                  icon: Target,
                },
              ].map(({ label, player, icon: Icon }) => (
                <div key={label} className="flex min-h-[90px] items-center gap-3 rounded-2xl border border-[#262A32] bg-[#111318] p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#343943] bg-[#171A20]">
                    {player?.imageUrl ? (
                      <img src={player.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                    ) : (
                      <Icon className="h-4 w-4 text-[#AEB3BC]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-semibold tracking-[0.14em] text-[#858B96]">{label}</p>
                    <p className="mt-1 truncate text-xs font-medium text-[#E6E7EA]">
                      {player?.displayName || 'Not assigned'}
                    </p>
                  </div>
                </div>
              ))}
              <div className="col-span-2 rounded-2xl border border-[#262A32] bg-[#111318] p-3 md:col-span-1">
                <p className="text-[8px] font-semibold tracking-[0.14em] text-[#858B96]">FIELD POSITIONS</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {fieldPlayers.slice(0, 5).map((member) => {
                    const player = playersById.get(member.playerId);
                    return (
                      <span key={member.playerId} className="rounded-md bg-[#171A20] px-2 py-1 text-[9px] text-[#B7BBC4]">
                        {member.fieldingPosition || (member.isWicketkeeper ? 'Wicketkeeper' : player?.primaryRole || 'Fielder')}
                      </span>
                    );
                  })}
                  {fieldPlayers.length === 0 && <span className="text-[10px] text-[#858B96]">No players assigned yet</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="players-pool" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB3BC]">MEET THE PLAYER POOL</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#F5F5F6] sm:text-3xl">
              Find the players who fit.
            </h2>
            <p className="mt-2 text-sm text-[#858B96]">{playerPoolStatus}</p>
          </div>
          <Link
            to="/players"
            className="inline-flex min-h-10 items-center gap-2 self-start text-sm font-medium text-[#C3C7CE] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4] sm:self-auto"
          >
            Explore all players <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter player pool">
          {playerPoolTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activePoolTab === tab}
              onClick={() => setActivePoolTab(tab)}
              className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4] ${
                activePoolTab === tab
                  ? 'border-[#B7BBC4] bg-[#B7BBC4] text-[#111318]'
                  : 'border-[#343943] bg-[#111318] text-[#A0A5AE] hover:border-[#555B66] hover:text-[#F5F5F6]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {visiblePool.length > 0 ? (
          <div
            role="tabpanel"
            aria-label={`${activePoolTab} players`}
            className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-4"
          >
            {visiblePool.map((player) => {
              const team = player.teamsPlayed.map((teamId) => teamsById.get(teamId)).find(Boolean);
              const competitionName = team ? competitionsById.get(team.competitionId)?.name : undefined;
              return (
                <HomePlayerCard
                  key={player.id}
                  player={player}
                  teamName={team?.shortName || team?.name}
                  competitionName={competitionName}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[#343943] bg-[#111318] px-5 py-10 text-center">
            <Users className="mx-auto h-5 w-5 text-[#858B96]" />
            <p className="mt-3 text-sm font-medium text-[#D4D6DB]">
              {isLoading ? 'Loading the player pool' : `No ${activePoolTab.toLowerCase()} players in the current catalog`}
            </p>
            <p className="mt-1 text-xs text-[#858B96]">
              {activePoolTab === 'Recently added'
                ? 'Newly added player profiles will appear here.'
                : 'Try another player group or browse the full catalog.'}
            </p>
            <Link to="/players" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C3C7CE] hover:text-white">
              Browse players <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      <section id="community-lineups" className="border-y border-[#262A32] bg-[#0D0F13]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB3BC]">FROM THE COMMUNITY</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#F5F5F6] sm:text-3xl">
                Made by cricket minds.
              </h2>
              <p className="mt-2 text-sm text-[#858B96]">Discover public lineups shared from the Team11 workspace.</p>
            </div>
            <Link
              to="/explore"
              className="inline-flex min-h-10 items-center gap-2 self-start text-sm font-medium text-[#C3C7CE] hover:text-white sm:self-auto"
            >
              Explore community <Compass className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-3" aria-label="Loading community teams">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-52 animate-pulse rounded-2xl border border-[#262A32] bg-[#111318]" />
              ))}
            </div>
          ) : communityTeams.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {communityTeams.map((team) => {
                const details = featuredTeam(team);
                return (
                  <article key={team.id} className="flex min-w-0 flex-col rounded-2xl border border-[#262A32] bg-[#111318] p-5 transition hover:border-[#4A505B]">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-[#343943] bg-[#171A20] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7BBC4]">
                        {team.mode.replace('-', ' ')} · {team.format}
                      </span>
                      <span className="text-right text-[10px] text-[#858B96]">{team.season || 'Season not set'}</span>
                    </div>
                    <h3 className="mt-5 truncate font-heading text-lg font-semibold text-[#F5F5F6]">{team.title}</h3>
                    <p className="mt-1 truncate text-xs text-[#858B96]">
                      {details.competition || 'Competition not specified'} · by {team.authorName}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <TeamPreview team={team} playersById={playersById} />
                      <span className="shrink-0 text-xs text-[#A0A5AE]">{team.players.length} players</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#262A32] pt-4 mt-5">
                      <Link
                        to={`/builder/${team.mode}?id=${team.id}`}
                        className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#E3E5E9] hover:text-white"
                      >
                        View Team <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        to={`/poster?id=${team.id}`}
                        aria-label={`Create a poster for ${team.title}`}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#343943] px-3 text-xs text-[#AEB3BC] transition hover:bg-white/[0.05] hover:text-white"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Create Poster
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#343943] bg-[#111318] px-5 py-10 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-[#343943] bg-[#171A20] text-[#B7BBC4]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-[#E7E8EB]">
                Your first community XI could be next.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#858B96]">
                Create a lineup, then publish it from your workspace to share it with other cricket fans.
              </p>
              <Link
                to="/builder/dream"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#B7BBC4] px-4 py-2 text-xs font-semibold text-[#111318] hover:bg-[#D5D8DE]"
              >
                Create your first XI <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB3BC]">A CLEAR WAY TO YOUR XI</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#F5F5F6] sm:text-3xl">
            From first pick to final call.
          </h2>
        </div>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Choose Your Players',
              description: 'Explore the player pool and find the names that fit your approach.',
              icon: Users,
            },
            {
              step: '02',
              title: 'Build Your XI',
              description: 'Set your batting order, captaincy and roles in the right builder mode.',
              icon: SlidersHorizontal,
            },
            {
              step: '03',
              title: 'Analyze & Share',
              description: 'Validate the lineup, review the field and share a team poster.',
              icon: BarChart3,
            },
          ].map(({ step, title, description, icon: Icon }) => (
            <article key={step} className="rounded-2xl border border-[#262A32] bg-[#111318] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#343943] bg-[#171A20] text-[#B7BBC4]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-heading text-sm font-medium text-[#656B75]">{step}</span>
              </div>
              <h3 className="mt-6 font-heading text-base font-semibold text-[#F5F5F6]">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#858B96]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#3A3F49] bg-[#171A20] px-6 py-10 text-center sm:px-10 sm:py-14">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(183,187,196,.18),transparent_58%)]" />
          <div className="relative">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AEB3BC]">MAKE YOUR CALL</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#F5F5F6] sm:text-4xl">
              Your Dream XI Starts Here.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#A0A5AE]">
              Explore players, create combinations and build your ultimate cricket team.
            </p>
            <Link
              to="/builder/dream"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#B7BBC4] px-5 py-3 text-sm font-semibold text-[#111318] transition hover:bg-[#D5D8DE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7BBC4]"
            >
              Create Your Playing XI <ArrowDownRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
