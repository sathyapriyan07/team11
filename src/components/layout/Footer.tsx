import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const builderLinks = [
  { label: 'Dream XI', path: '/builder/dream' },
  { label: 'Franchise XI', path: '/builder/franchise' },
  { label: 'All-Time XI', path: '/builder/all-time' },
  { label: 'International XI', path: '/builder/international' },
  { label: 'Custom Pool XI', path: '/builder/custom-pool' },
  { label: 'Auto-Generated XI', path: '/generator' },
];

export const Footer: React.FC = () => (
  <footer className="border-t border-[#262A32] bg-[#090A0D] px-4 pb-8 pt-12 sm:px-6 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B7BBC4]">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#454B56] bg-[#171A20] font-heading text-xs font-bold text-[#D4D7DC]">XI</span>
          <span className="font-heading text-lg font-semibold tracking-[-0.04em] text-[#F5F5F6]">team11</span>
        </Link>
        <p className="mt-4 max-w-xs text-xs leading-5 text-[#858B96]">
          A thoughtful workspace for building, analyzing and sharing cricket Playing XIs.
        </p>
        <Link
          to="/builder/dream"
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C3C7CE] transition hover:text-white"
        >
          Start building <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div>
        <h2 className="text-[10px] font-semibold tracking-[0.16em] text-[#D4D6DB]">BUILDER MODES</h2>
        <ul className="mt-4 space-y-2.5">
          {builderLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="text-xs text-[#858B96] transition hover:text-[#F5F5F6]">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-[10px] font-semibold tracking-[0.16em] text-[#D4D6DB]">EXPLORE</h2>
        <ul className="mt-4 space-y-2.5">
          {[
            { label: 'Players', path: '/players' },
            { label: 'Teams', path: '/teams' },
            { label: 'Competitions', path: '/competitions' },
            { label: 'Custom Pools', path: '/pools' },
            { label: 'Community Lineups', path: '/explore' },
            { label: 'My Teams', path: '/my-teams' },
          ].map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="text-xs text-[#858B96] transition hover:text-[#F5F5F6]">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-[10px] font-semibold tracking-[0.16em] text-[#D4D6DB]">TEAM11</h2>
        <ul className="mt-4 space-y-2.5">
          <li>
            <Link to="/#how-it-works" className="text-xs text-[#858B96] transition hover:text-[#F5F5F6]">
              About
            </Link>
          </li>
          <li>
            <span aria-disabled="true" title="Privacy information is not available in this app yet" className="cursor-not-allowed text-xs text-[#5F6570]">
              Privacy
            </span>
          </li>
          <li>
            <span aria-disabled="true" title="Terms are not available in this app yet" className="cursor-not-allowed text-xs text-[#5F6570]">
              Terms
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-[#262A32] pt-5 text-[10px] text-[#737984] sm:flex-row sm:items-center sm:justify-between">
      <span>© {new Date().getFullYear()} Team11. All rights reserved.</span>
      <span>Built for the love of cricket.</span>
    </div>
  </footer>
);
