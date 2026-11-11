import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Trophy, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090B0F] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <div className="flex items-center">
            <span className="text-base font-extrabold font-heading text-white tracking-wide">
              team11
            </span>
          </div>
          <p className="text-xs text-[#929BA8] leading-relaxed">
            The premier cricket tactical lineup workstation. Built specifically for IPL fans, cricket analysts, and tactical enthusiasts across the globe.
          </p>
          <div className="text-[11px] text-[#20C878] bg-[#20C878]/10 border border-[#20C878]/20 p-2.5 rounded-xl font-medium mt-1">
            ⚡ 100% Free & Open Tactical Workbench. No fantasy betting or monetary wagering.
          </div>
        </div>

        {/* Builder Modes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white font-heading">
            Lineup Builder Modes
          </span>
          <div className="flex flex-col gap-1.5 text-xs text-[#929BA8]">
            <Link to="/builder/dream" className="hover:text-[#20C878] transition-colors">
              Dream XI (Global Pool)
            </Link>
            <Link to="/builder/franchise" className="hover:text-[#20C878] transition-colors">
              Franchise Squad XI (CSK, MI, RCB...)
            </Link>
            <Link to="/builder/all-time" className="hover:text-[#20C878] transition-colors">
              All-Time Legends XI
            </Link>
            <Link to="/builder/international" className="hover:text-[#20C878] transition-colors">
              International World Cup XI
            </Link>
            <Link to="/builder/custom-pool" className="hover:text-[#20C878] transition-colors">
              Custom Player Pool XI
            </Link>
            <Link to="/generator" className="hover:text-[#20C878] transition-colors">
              Automatic XI Optimizer
            </Link>
          </div>
        </div>

        {/* Database & Tactical Tools */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white font-heading">
            Tactical & Analytics Tools
          </span>
          <div className="flex flex-col gap-1.5 text-xs text-[#929BA8]">
            <Link to="/players" className="hover:text-[#20C878] transition-colors">
              Centralized Players Database
            </Link>
            <Link to="/teams" className="hover:text-[#20C878] transition-colors">
              Teams & Squads
            </Link>
            <Link to="/competitions" className="hover:text-[#20C878] transition-colors">
              Competitions & Squad Rosters
            </Link>
            <Link to="/compare" className="hover:text-[#20C878] transition-colors">
              Player & Lineup Head-to-Head
            </Link>
            <Link to="/pools" className="hover:text-[#20C878] transition-colors">
              Custom Player Pool Studio
            </Link>
            <Link to="/explore" className="hover:text-[#20C878] transition-colors">
              Community Tactical Gallery
            </Link>
            <Link to="/admin" className="hover:text-[#20C878] transition-colors">
              Supabase Database Schema
            </Link>
          </div>
        </div>

        {/* Tactical Rules & Architecture */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white font-heading">
            Broadcasting Standards
          </span>
          <p className="text-xs text-[#929BA8] leading-relaxed">
            Strict adherence to real cricket competition rules, 4-overseas IPL player caps, wicketkeeper verification, and authentic attribute-driven tactical balance.
          </p>
          <div className="mt-2 text-[11px] text-[#929BA8]">
            Built with React 19, TypeScript, Tailwind CSS, and Supabase PostgreSQL.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#929BA8] gap-4">
        <span>© 2025 team11. All cricket statistics and franchise badges are property of their respective cricket boards.</span>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="hover:text-white transition-colors">
            Admin Schema
          </Link>
          <Link to="/explore" className="hover:text-white transition-colors">
            Trending XIs
          </Link>
        </div>
      </div>
    </footer>
  );
};
