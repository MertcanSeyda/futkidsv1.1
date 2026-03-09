"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Footprints, Zap, Crosshair, Swords, Wind, Eye, Flame } from "lucide-react";

interface PlayerStats {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
}

interface PlayerCardSummaryProps {
    fullName: string;
    position: string;
    teamCategory?: string;
    birthDate?: string;
    height?: number;
    weight?: number;
    stats: PlayerStats;
    rating: number;
    photoUrl?: string;
    className?: string;
}

// Color palette options for the card
const cardPalette = [
    { id: "gold", bg: "from-[#c8a800] to-[#8a7500]", border: "#e6c200", text: "#e6c200", label: "Altın" },
    { id: "green", bg: "from-[#1a6b1a] to-[#0d3d0d]", border: "#2ecc40", text: "#2ecc40", label: "Yeşil" },
    { id: "blue", bg: "from-[#1a4d80] to-[#0d2840]", border: "#4da6ff", text: "#4da6ff", label: "Mavi" },
    { id: "red", bg: "from-[#801a1a] to-[#400d0d]", border: "#ff4d4d", text: "#ff4d4d", label: "Kırmızı" },
    { id: "purple", bg: "from-[#5a1a80] to-[#2d0d40]", border: "#b84dff", text: "#b84dff", label: "Mor" },
    { id: "silver", bg: "from-[#7a7a7a] to-[#505050]", border: "#ccc", text: "#ccc", label: "Gümüş" },
    { id: "bronze", bg: "from-[#805030] to-[#503020]", border: "#c08060", text: "#c08060", label: "Bronz" },
];

const calculateAge = (dob?: string) => {
    if (!dob) return "--";
    const diffMs = Date.now() - new Date(dob).getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
};

// Badge definitions with proper Lucide icons
const badges = [
    { id: "block", label: "Blok", icon: Shield, color: "#e6b800" },
    { id: "slide", label: "Kayarak\nMüdahale", icon: Swords, color: "#fff" },
    { id: "sprint", label: "Hızlı\nAdımlar", icon: Zap, color: "#fff" },
    { id: "precision", label: "Hassas\nŞut", icon: Crosshair, color: "#fff" },
    { id: "vision", label: "Vizyon\nPası", icon: Eye, color: "#fff" },
    { id: "power", label: "Güçlü\nŞut", icon: Flame, color: "#fff" },
];

export default function PlayerCardSummary({
    fullName,
    position,
    teamCategory,
    birthDate,
    height,
    weight,
    stats,
    rating,
    photoUrl,
    className,
}: PlayerCardSummaryProps) {
    const [activeTab, setActiveTab] = useState("Özet");
    const [selectedColorId, setSelectedColorId] = useState("gold");
    const tabs = ["Özet", "İstatistikler", "Gelişim"];
    const cardColor = cardPalette.find(c => c.id === selectedColorId) || cardPalette[0];
    const age = calculateAge(birthDate);

    const statLabels: { key: keyof PlayerStats; label: string }[] = [
        { key: "pace", label: "HIZ" },
        { key: "shooting", label: "ŞUT" },
        { key: "passing", label: "PAS" },
        { key: "dribbling", label: "DRI" },
        { key: "defending", label: "DEF" },
        { key: "physical", label: "FİZ" },
    ];

    return (
        <div className={cn("w-full bg-[#1e1e1e] rounded-[10px] border border-[#333] overflow-hidden", className)}>
            {/* Tab Navigation */}
            <div className="flex items-center gap-0 bg-[#161616] border-b border-[#333]">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-3.5 text-[12px] font-bold uppercase tracking-wider transition-all border-b-2",
                            activeTab === tab
                                ? "text-white border-[#00e600] bg-[#1e1e1e]"
                                : "text-[#888] border-transparent hover:text-white hover:bg-white/[0.03]"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* === LEFT: FUT Card + Color Palette === */}
                <div className="col-span-1 lg:col-span-4 p-6 lg:p-8 flex flex-col items-center gap-5">
                    {/* The Card */}
                    <div className={cn(
                        "relative w-[220px] h-[310px] rounded-xl bg-gradient-to-b shadow-2xl overflow-hidden border",
                        cardColor.bg
                    )} style={{ borderColor: cardColor.border + "40" }}>

                        {/* Card Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full"
                                style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)`
                                }}
                            />
                        </div>

                        {/* Rating + Position */}
                        <div className="absolute top-4 left-4 flex flex-col items-center z-10">
                            <span className="text-[40px] font-black text-white leading-none drop-shadow-lg">{rating}</span>
                            <span className="text-[13px] font-bold uppercase tracking-wider mt-0.5" style={{ color: cardColor.text }}>
                                {position}
                            </span>
                        </div>

                        {/* Player Avatar */}
                        <div className="absolute top-4 right-0 w-[140px] h-[160px] flex items-end justify-center z-10">
                            {photoUrl ? (
                                <img src={photoUrl} alt={fullName} className="w-full h-full object-cover object-top rounded" />
                            ) : (
                                <div className="w-[120px] h-[140px] bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
                                    <span className="text-[60px] font-black italic text-white/30">{fullName.charAt(0)}</span>
                                </div>
                            )}
                        </div>

                        {/* Player Name */}
                        <div className="absolute bottom-[90px] left-0 right-0 text-center z-10 px-3">
                            <h3 className="text-white text-[16px] font-black uppercase tracking-wide truncate drop-shadow-md">
                                {fullName}
                            </h3>
                        </div>

                        {/* Base Stats Row */}
                        <div className="absolute bottom-6 left-0 right-0 z-10 px-4">
                            <div className="grid grid-cols-6 gap-1 text-center border-t pt-3" style={{ borderColor: cardColor.border + "30" }}>
                                {statLabels.map(({ key, label }) => (
                                    <div key={key} className="flex flex-col items-center">
                                        <span className="text-[14px] font-black text-white leading-none">{stats[key]}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5" style={{ color: cardColor.text }}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom row: category & rating badge */}
                            <div className="flex items-center justify-between mt-3 px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-white/60">🇹🇷</span>
                                    <span className="text-[9px] font-bold uppercase" style={{ color: cardColor.text }}>
                                        {teamCategory || "U15"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-white/50">4★</span>
                                    <span className="text-[9px] font-bold text-white/50">3★</span>
                                    <span className="bg-white/10 text-[9px] font-black text-white px-1.5 py-0.5 rounded">
                                        {rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Color Palette Selector */}
                    <div className="flex items-center gap-2">
                        {cardPalette.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setSelectedColorId(color.id)}
                                title={color.label}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                                    selectedColorId === color.id
                                        ? "border-white scale-110 shadow-lg"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                )}
                                style={{ backgroundColor: color.border }}
                            />
                        ))}
                    </div>
                </div>

                {/* === RIGHT: Player Info Panel (FUTBIN style) === */}
                <div className="col-span-1 lg:col-span-8 p-6 lg:p-8 lg:pl-0">
                    {/* Top Row: Tags */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 text-[11px] font-bold">
                        <div className="flex items-center gap-1.5 text-[#aaa]">
                            <span className="text-base">🇹🇷</span> Türkiye
                        </div>
                        <div className="flex items-center gap-1.5 text-[#aaa]">
                            <span className="text-base">🏆</span> FUTKIDS Lig
                        </div>
                        <div className="flex items-center gap-1.5 text-[#aaa]">
                            <span className="text-base">⚽</span> FUTKIDS
                        </div>
                        <div className="text-[#e6b800] bg-[#e6b800]/10 px-2 py-0.5 rounded border border-[#e6b800]/20">
                            Gold Rare
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-6 border-t border-b border-[#333] py-5 mb-6">
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">BECERİLER</span>
                            <span className="text-white text-[13px] font-bold flex items-center gap-1">
                                4 <span className="text-[#e6b800]">★</span>
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">ZAYIF AYAK</span>
                            <span className="text-white text-[13px] font-bold flex items-center gap-1">
                                3 <span className="text-[#e6b800]">★</span>
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">BOY</span>
                            <span className="text-white text-[13px] font-bold">{height || "--"}cm</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">AYAK</span>
                            <span className="text-white text-[13px] font-bold">Sağ</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">VÜCUT TİPİ</span>
                            <span className="text-white text-[12px] font-bold">Kondisyonlu & Normal</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">YAŞ</span>
                            <span className="text-white text-[12px] font-bold">{age} Yaşında</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">KATEGORİ</span>
                            <span className="text-white text-[12px] font-bold">{teamCategory || "U15"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#666] text-[9px] font-bold uppercase tracking-wider mb-1">KİLO</span>
                            <span className="text-white text-[12px] font-bold">{weight || "--"} kg</span>
                        </div>
                    </div>

                    {/* Badges Section with Lucide Icons */}
                    <div className="flex flex-wrap gap-6 mb-6">
                        {badges.map((badge) => {
                            const Icon = badge.icon;
                            return (
                                <div key={badge.id} className="flex flex-col items-center cursor-pointer group">
                                    <div className="w-11 h-11 flex items-center justify-center bg-[#222] border border-[#444] rounded-lg rotate-45 mb-2 group-hover:border-[#00e600]/50 group-hover:bg-[#00e600]/5 transition-all">
                                        <Icon className="w-5 h-5 -rotate-45" style={{ color: badge.color }} strokeWidth={2} />
                                    </div>
                                    <span className="text-[9px] font-bold text-center whitespace-pre-line leading-tight" style={{ color: badge.color }}>
                                        {badge.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Playstyles / Roles */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[#00e600] text-[11px] font-bold bg-[#00e600]/10 px-3 py-1.5 rounded border border-[#00e600]/30">
                            {position} Oyuncusu+
                        </span>
                        <span className="text-[#00e600] text-[11px] font-bold bg-[#00e600]/10 px-3 py-1.5 rounded border border-[#00e600]/30">
                            Top Kontrolü+
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Toggle */}
            <div className="flex items-center gap-0 bg-[#161616] border-t border-[#333] px-6">
                <button className="px-5 py-3 text-[11px] font-bold bg-[#00e600] text-black rounded-t-md -mb-px">
                    Oyuncu İstatistikleri
                </button>
                <button className="px-5 py-3 text-[11px] font-bold text-[#888] hover:text-white transition-colors">
                    Gelişim Takibi
                </button>
            </div>
        </div>
    );
}
