"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Heart,
    TrendingUp,
    CreditCard,
    Calendar,
    Star,
    ChevronRight,
    TrendingDown,
    User
} from "lucide-react";

export function ParentDashboard({ user }: { user: any }) {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPlayers = async () => {
            try {
                // Fetch players linked to this parent
                const response = await api.get(`/users?role=player&parent=${user._id}`);
                setPlayers(response.data);
            } catch (error) {
                console.error("Oyuncular yüklenemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchMyPlayers();
        }
    }, [user._id]);

    if (loading) return <div className="text-white">Yükleniyor...</div>;

    // Use the first player found, or show empty state
    const player = players[0];

    if (!player) return (
        <div className="text-center py-20 text-white">
            <h2 className="text-2xl font-bold mb-4">Henüz kayıtlı oyuncu yok.</h2>
            <p className="opacity-70">Lütfen akademi yöneticinizle iletişime geçin.</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Child Progress Card */}
                <div className="bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 rounded-[2.5rem] border border-white/10 p-10 overflow-hidden relative">
                    <div className="relative z-10 flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-indigo-600/40 border-4 border-white/10 flex items-center justify-center font-black text-2xl text-white">
                            {player.fullName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">{player.fullName}</h3>
                            <p className="text-indigo-300 font-bold text-sm tracking-widest uppercase">
                                {player.playerProfile?.position || 'MEVKİ YOK'} • {player.academy?.name || 'AKADEMİ YOK'}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={14} className="text-yellow-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GÜNCEL RATING</span>
                            </div>
                            <div className="text-4xl font-black text-white">{player.playerProfile?.rating || 0}</div>
                        </div>
                        <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SON DEĞİŞİM</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-400">+1.2</div>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
                        {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map((stat) => (
                            <div key={stat} className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{stat.substring(0, 3)}</div>
                                <div className="text-xl font-black text-white">{player.playerProfile?.stats?.[stat] || 0}</div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] -z-0" />
                </div>

                {/* Quick Actions / Payments */}
                <div className="space-y-6">
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-indigo-500 w-6 h-6" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Aidat Durumu</h3>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">ÖDENDİ</span>
                        </div>
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5">
                            <div>
                                <div className="text-sm font-bold text-white mb-1">Ocak 2026 Aidatı</div>
                                <div className="text-xs text-gray-500 font-medium tracking-tight">Dönem: 01-31 Ocak</div>
                            </div>
                            <div className="text-xl font-black text-white">1,500 ₺</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <QuickButton icon={<Calendar size={20} />} label="Maç Programı" />
                        <QuickButton icon={<Heart size={20} />} label="Sağlık / Beslenme" />
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Son Aktiviteler</h3>
                <div className="space-y-8 relative">
                    <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-white/5" />

                    <ActivityItem
                        icon={<TrendingUp size={16} />}
                        title="Şut İsabeti Artışı"
                        desc="Mert, son antrenmanda şut isabetini %85'e çıkardı!"
                        time="Bugün, 18:45"
                        color="indigo"
                    />
                    <ActivityItem
                        icon={<Star size={16} />}
                        title="Haftanın Oyuncusu Adayı"
                        desc="Koç Fatih Terim, Mert'i 'Gelişim Yıldızı' olarak aday gösterdi."
                        time="Dün, 11:20"
                        color="yellow"
                    />
                </div>
            </div>
        </div>
    );
}

function QuickButton({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-indigo-600/10 hover:border-indigo-500/20 hover:text-indigo-400 transition-all gap-4 group">
            <div className="text-gray-500 group-hover:text-indigo-400 transition-colors">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-wider text-center">{label}</span>
        </button>
    );
}

function ActivityItem({ icon, title, desc, time, color }: { icon: React.ReactNode, title: string, desc: string, time: string, color: string }) {
    const colorClasses: any = {
        indigo: "bg-indigo-500",
        yellow: "bg-yellow-500",
        emerald: "bg-emerald-500"
    };
    return (
        <div className="relative flex gap-8 pl-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-[#050510] ${colorClasses[color] || 'bg-gray-500'} text-white`}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight italic">{title}</h4>
                <p className="text-sm text-gray-500 mb-2 leading-relaxed font-medium">{desc}</p>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{time}</span>
            </div>
        </div>
    );
}
