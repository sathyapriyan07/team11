import React, { useRef, useState, useEffect } from 'react';
import { Player, UserTeam, UserTeamPlayer } from '../../types/cricket';
import { Download, Sparkles, Image as ImageIcon, Palette, Layout, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PosterCanvasProps {
  team: UserTeam;
  allPlayers: Player[];
}

type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';
type ThemeStyle = 'emerald-dark' | 'ipl-gold' | 'cyber-blue' | 'classic-night';

export const PosterCanvas: React.FC<PosterCanvasProps> = ({ team, allPlayers }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('emerald-dark');
  const [showRatings, setShowRatings] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);

  const playersMap = new Map<string, Player>();
  allPlayers.forEach((p) => playersMap.set(p.id, p));

  const resolvedPlayers = team.players
    .map((tp) => ({ ...tp, player: playersMap.get(tp.playerId) }))
    .filter((x): x is UserTeamPlayer & { player: Player } => Boolean(x.player))
    .sort((a, b) => a.battingOrder - b.battingOrder);

  // Canvas dimensions based on aspect ratio
  const getDimensions = (): { width: number; height: number } => {
    switch (aspectRatio) {
      case '1:1':
        return { width: 1080, height: 1080 };
      case '4:5':
        return { width: 1080, height: 1350 };
      case '9:16':
        return { width: 1080, height: 1920 };
      case '16:9':
        return { width: 1920, height: 1080 };
      default:
        return { width: 1080, height: 1080 };
    }
  };

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (themeStyle === 'ipl-gold') {
      bgGradient.addColorStop(0, '#0f0c05');
      bgGradient.addColorStop(0.5, '#1e160a');
      bgGradient.addColorStop(1, '#090805');
    } else if (themeStyle === 'cyber-blue') {
      bgGradient.addColorStop(0, '#06101e');
      bgGradient.addColorStop(0.5, '#0b1c34');
      bgGradient.addColorStop(1, '#050b14');
    } else if (themeStyle === 'classic-night') {
      bgGradient.addColorStop(0, '#07080a');
      bgGradient.addColorStop(0.5, '#12141a');
      bgGradient.addColorStop(1, '#07080a');
    } else {
      // emerald-dark
      bgGradient.addColorStop(0, '#06130d');
      bgGradient.addColorStop(0.5, '#0c2217');
      bgGradient.addColorStop(1, '#050c08');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background mesh/pitch outline
    ctx.strokeStyle = themeStyle === 'ipl-gold' ? 'rgba(249, 205, 5, 0.08)' : 'rgba(32, 200, 120, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width * 0.45, height * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Poster Header: Branding & Title
    const primaryColor =
      themeStyle === 'ipl-gold' ? '#F9CD05' : themeStyle === 'cyber-blue' ? '#3BA7FF' : '#20C878';

    // Top Brand Pill
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 20px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('XI ARENA • OFFICIAL TACTICAL LINEUP', width / 2, 70);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${width > 1200 ? '48px' : '40px'} Montserrat, sans-serif`;
    ctx.fillText(team.title.toUpperCase(), width / 2, 130);

    // Subtitle / Format / Season
    ctx.fillStyle = '#929BA8';
    ctx.font = '600 22px Montserrat, sans-serif';
    const subtext = `${team.format} CRICKET • ${team.mode.toUpperCase()} XI • ${team.season || '2025'}`;
    ctx.fillText(subtext, width / 2, 170);

    // Divider accent line
    const gradLine = ctx.createLinearGradient(width * 0.2, 0, width * 0.8, 0);
    gradLine.addColorStop(0, 'transparent');
    gradLine.addColorStop(0.5, primaryColor);
    gradLine.addColorStop(1, 'transparent');
    ctx.strokeStyle = gradLine;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 195);
    ctx.lineTo(width * 0.8, 195);
    ctx.stroke();

    // 3. Render Playing XI List
    const startY = 240;
    const availableHeight = height - startY - 140;
    const rowHeight = availableHeight / 11;

    resolvedPlayers.slice(0, 11).forEach((item, index) => {
      const y = startY + index * rowHeight;
      const rowCenterY = y + rowHeight / 2;

      // Alternating row subtle backdrop
      if (index % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.roundRect(width * 0.08, y + 4, width * 0.84, rowHeight - 8, 8);
        ctx.fill();
      }

      // Order Number
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 24px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.battingOrder}`, width * 0.11, rowCenterY + 8);

      // Player Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 24px Montserrat, sans-serif';
      ctx.fillText(item.player.displayName, width * 0.17, rowCenterY + 8);

      // Captain / VC / WK Badges
      let badgeX = width * 0.17 + ctx.measureText(item.player.displayName).width + 16;

      if (item.isCaptain) {
        ctx.fillStyle = '#F9CD05';
        ctx.beginPath();
        ctx.roundRect(badgeX, rowCenterY - 12, 34, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 13px Montserrat, sans-serif';
        ctx.fillText(' C ', badgeX + 7, rowCenterY + 4);
        badgeX += 42;
      }

      if (item.isViceCaptain) {
        ctx.fillStyle = '#3BA7FF';
        ctx.beginPath();
        ctx.roundRect(badgeX, rowCenterY - 12, 38, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Montserrat, sans-serif';
        ctx.fillText('VC', badgeX + 8, rowCenterY + 4);
        badgeX += 46;
      }

      if (item.isWicketkeeper) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(badgeX, rowCenterY - 12, 40, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Montserrat, sans-serif';
        ctx.fillText('WK', badgeX + 8, rowCenterY + 4);
      }

      // Role & Specialization
      ctx.fillStyle = '#929BA8';
      ctx.font = '500 18px Montserrat, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.player.specialization || item.player.primaryRole, width * 0.76, rowCenterY + 7);

      // Rating Badge
      if (showRatings) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(width * 0.81, rowCenterY - 16, 52, 30, 8);
        ctx.fill();

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 18px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        const rating =
          team.format === 'ODI'
            ? item.player.formatRatings.ODI
            : team.format === 'TEST'
            ? item.player.formatRatings.TEST
            : item.player.formatRatings.T20;
        ctx.fillText(`${rating || item.player.overallRating}`, width * 0.81 + 26, rowCenterY + 5);
      }
    });

    // 4. Footer Branding & Watermark
    ctx.fillStyle = '#929BA8';
    ctx.font = '500 16px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Built on XI ARENA • Designed for Cricket Aficionados', width / 2, height - 45);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 14px Montserrat, sans-serif';
    ctx.fillText(`Created by ${team.authorName} • www.xiarena.cricket`, width / 2, height - 20);
  };

  useEffect(() => {
    drawPoster();
  }, [aspectRatio, themeStyle, showRatings, team, allPlayers]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    const link = document.createElement('a');
    link.download = `${team.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_playing_xi.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setExportedSuccess(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportedSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Poster Preview Canvas Container */}
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="relative max-w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#090B0F] p-2 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full max-h-[70vh] object-contain rounded-xl shadow-inner"
          />
        </div>
      </div>

      {/* Poster Customization Controls Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-6 bg-[#121720] p-6 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#20C878]" />
            Poster Customizer
          </h3>
          <p className="text-xs text-[#929BA8] mt-1">
            Produce broadcast-ready high resolution graphic posters for Instagram, X, and WhatsApp.
          </p>
        </div>

        {/* Aspect Ratio Options */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#929BA8] flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-[#3BA7FF]" />
            Canvas Aspect Ratio:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: '1:1', label: 'Square (1:1)', desc: '1080x1080 Feed' },
                { id: '4:5', label: 'Portrait (4:5)', desc: '1080x1350 Insta' },
                { id: '9:16', label: 'Story (9:16)', desc: '1080x1920 Status' },
                { id: '16:9', label: 'Banner (16:9)', desc: '1920x1080 Wide' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAspectRatio(item.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  aspectRatio === item.id
                    ? 'border-[#20C878] bg-[#20C878]/10 text-white'
                    : 'border-white/5 bg-[#181F29] text-[#929BA8] hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-[10px] text-[#929BA8] mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Palette */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#929BA8]">
            Atmospheric Stadium Theme:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'emerald-dark', label: 'Emerald Arena', color: '#20C878' },
                { id: 'ipl-gold', label: 'IPL Trophy Gold', color: '#F9CD05' },
                { id: 'cyber-blue', label: 'Electric Blue', color: '#3BA7FF' },
                { id: 'classic-night', label: 'Floodlight Dark', color: '#F5F7FA' },
              ] as const
            ).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeStyle(theme.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  themeStyle === theme.id
                    ? 'border-white/40 bg-[#181F29] text-white shadow-md'
                    : 'border-white/5 bg-[#181F29]/60 text-[#929BA8] hover:bg-[#181F29]'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="truncate">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Ratings */}
        <div className="flex items-center justify-between p-3 bg-[#181F29] rounded-xl border border-white/5">
          <span className="text-xs font-medium text-white">Display Format Ratings Badge</span>
          <input
            type="checkbox"
            checked={showRatings}
            onChange={(e) => setShowRatings(e.target.checked)}
            className="w-4 h-4 accent-[#20C878] rounded cursor-pointer"
          />
        </div>

        {/* Download Action */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#20C878] to-[#1bb56c] hover:brightness-110 active:scale-[0.98] text-[#090B0F] font-bold rounded-xl shadow-lg shadow-[#20C878]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {exportedSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#090B0F]" />
              Poster Saved Successfully!
            </>
          ) : (
            <>
              <Download className="w-5 h-5 text-[#090B0F]" />
              Export High-Res PNG Poster
            </>
          )}
        </button>
      </div>
    </div>
  );
};
