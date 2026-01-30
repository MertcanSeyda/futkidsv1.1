"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PlayerFIFAProps {
    name: string;
    rating: number;
    position: string;
    stats: {
        pac: number;
        sho: number;
        pas: number;
        dri: number;
        def: number;
        phy: number;
    };
    imageUrl?: string;
}

export const PlayerFIFA = ({ name, rating, position, stats, imageUrl }: PlayerFIFAProps) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            className="relative w-72 h-[450px] shadow-2xl transition-all duration-300 group cursor-pointer"
        >
            {/* Card Background / Texture (TOTY Style Glow) */}
            <div className="absolute inset-0 bg-gradient-to-br from-ea-blue via-ea-cyan to-ea-navy rounded-[2rem] p-[1px] overflow-hidden">
                <div className="absolute inset-0 bg-[#020617] rounded-[2rem] overflow-hidden">
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.2),transparent_70%)]" />
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-ea-blue/10 to-transparent" />
                </div>
            </div>

            {/* Decorative Borders */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border border-ea-cyan/20 rounded-[1.5rem] pointer-events-none" />

            {/* Rating and Position */}
            <div className="absolute top-10 left-8 z-10 flex flex-col items-center">
                <span className="text-5xl font-black text-ea-gold drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)] italic leading-none">
                    {rating}
                </span>
                <span className="text-xl font-bold text-white uppercase tracking-widest mt-1">
                    {position}
                </span>
            </div>

            {/* Player Image (Placeholder if empty) */}
            <div className="absolute top-12 left-0 right-0 h-64 flex justify-center items-end overflow-hidden">
                {imageUrl ? (
                    <Image src={imageUrl} alt={name} width={256} height={256} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-48 h-48 bg-gradient-to-t from-ea-cyan/20 to-transparent rounded-full blur-2xl absolute -bottom-10" />
                )}
                {/* Simple Player Silhouette if no image */}
                {!imageUrl && (
                    <div className="w-56 h-72 bg-neutral-800/50 rounded-b-full flex items-end justify-center">
                        <div className="text-6xl mb-10 opacity-20">⚽</div>
                    </div>
                )}
            </div>

            {/* Name Section */}
            <div className="absolute top-72 left-0 right-0 z-20 flex flex-col items-center">
                <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-ea-cyan to-transparent mb-2" />
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
                    {name}
                </h3>
                <div className="w-4/5 h-[1px] bg-gradient-to-r from-transparent via-ea-cyan to-transparent mt-2" />
            </div>

            {/* Stats Section */}
            <div className="absolute bottom-10 left-0 right-0 px-6 grid grid-cols-2 gap-x-6 gap-y-1">
                <StatRow label="PAC" value={stats.pac} />
                <StatRow label="DRI" value={stats.dri} />
                <StatRow label="SHO" value={stats.sho} />
                <StatRow label="DEF" value={stats.def} />
                <StatRow label="PAS" value={stats.pas} />
                <StatRow label="PHY" value={stats.phy} />
            </div>

            {/* Team/Nation (Dummy icons) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 items-center opacity-60">
                <div className="w-5 h-3 bg-red-600 rounded-sm" /> {/* Nation */}
                <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]">FK</div> {/* Club */}
            </div>
        </motion.div>
    );
};

const StatRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-baseline gap-2">
        <span className="text-ea-gold font-bold text-lg leading-none">{value}</span>
        <span className="text-white/60 font-semibold text-xs tracking-tighter">{label}</span>
    </div>
);
