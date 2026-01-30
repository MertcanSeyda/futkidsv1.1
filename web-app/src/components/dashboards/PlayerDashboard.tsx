"use client";

import React from "react";
import {
    Zap,
    Target,
    Activity,
    MessageSquare,
    Trophy,
    Calendar,
    PlayCircle
} from "lucide-react";
import { PlayerFIFA } from "@/components/PlayerFIFA";

export function PlayerDashboard({ user }: { user: any }) {
    const profile = user.playerProfile || {};
    const stats = profile.stats || {
        pac: 85,
        sho: 78,
        pas: 82,
        dri: 88,
        def: 45,
        phy: 70
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12">
                {/* FIFA Card */}
                <div className="flex justify-center">
                    <PlayerFIFA
                        name={user.fullName}
                        rating={profile.rating || 0}
                        position={profile.position || "N/A"}
                        stats={stats}
                    />
                </div>

                {/* Stats & Info Grid */}
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BentoCard
                            icon={<Trophy className="text-yellow-500" />}
                            title="Başarılar"
                            content="Haftanın oyuncusu seçildin! Son maçta 2 gol 1 asist ile damga vurdun."
                            footer="10 Başarı Kilidi Açıldı"
                        />
                        <BentoCard
                            icon={<MessageSquare className="text-indigo-400" />}
                            title="Koç Notu"
                            content={profile.coachNotes?.[0]?.note || "Harika bir gelişim gösteriyorsun. Şut tekniğin üzerine biraz daha odaklanmalısın."}
                            footer="2 Gün Önce"
                        />
                        <BentoCard
                            icon={<Calendar className="text-emerald-400" />}
                            title="Sıradaki Antrenman"
                            content="Pazartesi Saat 17:30 - Taktiksel Çalışma ve Şut Pratiği"
                            footer="Kadıköy Sahası"
                        />
                        <BentoCard
                            icon={<Activity className="text-red-400" />}
                            title="Beslenme Planı"
                            content={profile.nutritionPlan || "Maç günü öncesi karbonhidrat yüklemesi. Bol su tüketmeyi unutma."}
                            footer="Güncel Plan"
                        />
                    </div>

                    {/* Performance Radar Placeholder or Latest Video */}
                    <div className="bg-white/5 rounded-[2rem] border border-white/5 p-8 overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <PlayCircle className="text-indigo-500 w-6 h-6" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Son Antrenman Analizi</h3>
                            </div>
                            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">TÜMÜNÜ GÖR</button>
                        </div>

                        <div className="aspect-video rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:border-indigo-500/30 transition-all">
                            <PlayCircle size={64} className="text-white/20 group-hover:text-indigo-500 group-hover:scale-110 transition-all cursor-pointer" />
                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold">ANALİZ: %92 DOĞRULUK</div>
                                <div className="bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold shadow-lg">AI ANALİZİ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BentoCard({ icon, title, content, footer }: { icon: React.ReactNode, title: string, content: string, footer: string }) {
    return (
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    {icon}
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight text-white/80">{title}</h4>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{content}</p>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{footer}</div>
        </div>
    );
}
