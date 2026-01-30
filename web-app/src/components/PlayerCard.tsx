"use client";

import React from "react";

interface PlayerCardProps {
    fullName: string;
    position: string;
    rating: number;
    stats: {
        pace: number;
        shooting: number;
        passing: number;
        dribbling: number;
        defending: number;
        physical: number;
    };
    academy?: string;
    photoUrl?: string;
}

export default function PlayerCard({
    fullName,
    position,
    rating,
    stats,
    academy,
    photoUrl,
}: PlayerCardProps) {
    return (
        <div className="relative w-full max-w-sm mx-auto transition-transform hover:scale-105 duration-500 will-change-transform perspective-1000">
            {/* Main Card Shape - using clip-path for the shield look */}
            <div
                className="relative aspect-[3/4.2] overflow-hidden bg-[#1a1a1a] shadow-2xl"
                style={{
                    clipPath: "path('M 0 0 H 100% V 75% C 100% 95% 50% 100% 50% 100% C 50% 100% 0 95% 0 75% V 0 Z')"
                }}
            >
                {/* Gold/Premium Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] via-[#f9eeba] to-[#bfa05f]">
                    {/* Texture overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50"></div>
                </div>

                {/* Inner Border/Frame */}
                <div className="absolute inset-2 border-[3px] border-[#8a6e2f] opacity-60 rounded-t-sm"
                    style={{ clipPath: "path('M 0 0 H 100% V 75% C 100% 94% 50% 99% 50% 99% C 50% 99% 0 94% 0 75% V 0 Z')" }}>
                </div>

                {/* Content Container */}
                <div className="relative h-full flex flex-col pt-6 px-5 pb-12 z-10">

                    {/* Header: Rating, Position, Nation/Club (Placeholder) */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-black text-[#1a1a1a] leading-none tracking-tighter drop-shadow-sm">{rating}</span>
                            <span className="text-xl font-bold text-[#1a1a1a] uppercase tracking-wider">{position}</span>

                            {/* Decorative line */}
                            <div className="w-10 h-0.5 bg-[#1a1a1a]/40 my-2"></div>

                            {/* Academy Icon/Logo Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-[#1a1a1a]">ACD</span>
                            </div>
                        </div>

                        {/* Player Image */}
                        <div className="relative w-40 h-40 mt-2 mr-2">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={fullName}
                                    className="w-full h-full object-cover object-top drop-shadow-xl mask-gradient"
                                    style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-8xl font-black text-[#1a1a1a]/20 select-none">
                                        {fullName.charAt(0)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name Section */}
                    <div className="mt-auto mb-4 text-center relative">
                        <h2 className="text-3xl font-black text-[#1a1a1a] uppercase tracking-tighter truncate drop-shadow-sm">
                            {fullName}
                        </h2>
                        <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-[#1a1a1a]/50 to-transparent mx-auto mt-1"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-2 mb-4">
                        <div className="flex items-center justify-between border-r border-[#1a1a1a]/20 pr-4">
                            <span className="text-lg font-black text-[#1a1a1a]">{stats.pace}</span>
                            <span className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-widest">HIZ</span>
                        </div>
                        <div className="flex items-center justify-between pl-4">
                            <span className="text-lg font-black text-[#1a1a1a]">{stats.dribbling}</span>
                            <span className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-widest">DRİ</span>
                        </div>

                        <div className="flex items-center justify-between border-r border-[#1a1a1a]/20 pr-4">
                            <span className="text-lg font-black text-[#1a1a1a]">{stats.shooting}</span>
                            <span className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-widest">ŞUT</span>
                        </div>
                        <div className="flex items-center justify-between pl-4">
                            <span className="text-lg font-black text-[#1a1a1a]">{stats.defending}</span>
                            <span className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-widest">DEF</span>
                        </div>

                        <div className="flex items-center justify-between border-r border-[#1a1a1a]/20 pr-4">
                            <span className="text-lg font-black text-[#1a1a1a]">{stats.passing}</span>
                            <span className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-widest">PAS</span>
                        </div>
                        <div className="flex items-center justify-between pl-4">
                            <span className="text-lg font-black text-[#1a1a1a]">{stats.physical}</span>
                            <span className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-widest">FİZ</span>
                        </div>
                    </div>

                    {/* Bottom Decoration */}
                    <div className="flex justify-center items-center gap-2 mt-2 opacity-60">
                        <div className="w-1 h-1 rounded-full bg-[#1a1a1a]"></div>
                        <div className="w-1 h-1 rounded-full bg-[#1a1a1a]"></div>
                        <div className="w-1 h-1 rounded-full bg-[#1a1a1a]"></div>
                    </div>
                </div>
            </div>

            {/* Glow/Shadow behind the card */}
            <div className="absolute top-4 left-4 right-4 bottom-0 bg-[#d4af37] blur-[60px] opacity-20 -z-10 rounded-full"></div>
        </div>
    );
}
