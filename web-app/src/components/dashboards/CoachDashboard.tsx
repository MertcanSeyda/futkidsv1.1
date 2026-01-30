"use client";

import React from "react";
import {
    Users,
    ClipboardList,
    TrendingUp,
    MessageSquare,
    PlusCircle,
    Clock,
    ChevronRight
} from "lucide-react";

export function CoachDashboard({ user }: { user: any }) {
    return (
        <div className="space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Aktif Oyuncular"
                    value="18"
                    change="+2 bu hafta"
                    icon={<Users className="text-indigo-400" />}
                />
                <StatCard
                    title="Sıradaki Maç"
                    value="Cmt, 14:00"
                    change="Hazırlık Maçı"
                    icon={<PlusCircle className="text-emerald-400" />}
                />
                <StatCard
                    title="Ortalama Rating"
                    value="74.2"
                    change="%5 artış"
                    icon={<TrendingUp className="text-yellow-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Teams List / Player Focus */}
                <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="text-indigo-500 w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Oyuncu Takibi</h3>
                        </div>
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">TÜMÜ</button>
                    </div>

                    <div className="space-y-4">
                        <PlayerRow name="Arda Güler" position="CAM" rating={92} status="Gelişimde" />
                        <PlayerRow name="Kaan Ünal" position="LW" rating={91} status="Maç Hazır" />
                        <PlayerRow name="Mert Küçük" position="ST" rating={85} status="Yorgun" />
                        <PlayerRow name="Can Yıldız" position="GK" rating={78} status="Sakat" />
                    </div>
                </div>

                {/* Schedule & Notes */}
                <div className="space-y-6">
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="text-emerald-400 w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Antrenman Programı</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">BUGÜN</div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">Top Kontrolü ve Pas</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">17:30 - Saha 1</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 opacity-60">
                                <div className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-lg text-xs font-bold">YARIN</div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white shadow-2xl">Bitiricilik Çalışması</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">10:00 - Saha 2</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="text-indigo-400 w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">Hızlı Not Al</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 font-medium">Bir sonraki maç için taktiksel planlarını yazmayı unutma.</p>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
                            placeholder="Taktiksel notun..."
                            rows={3}
                        ></textarea>
                        <button className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/20">KAYDET</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">{icon}</div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h4>
            </div>
            <div className="text-4xl font-black text-white tracking-tighter mb-1">{value}</div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{change}</div>
        </div>
    );
}

function PlayerRow({ name, position, rating, status }: { name: string, position: string, rating: number, status: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400">{name.charAt(0)}</div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{name}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-bold tracking-widest">{position}</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{status}</div>
            </div>
            <div className="text-xl font-black text-indigo-500 pr-2">{rating}</div>
            <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-colors" />
        </div>
    )
}
