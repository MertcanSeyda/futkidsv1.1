"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LogOut, Home, Users, Calendar, FileText, Activity,
    TrendingUp, Award, Heart, Zap, Shield, Target, ChevronRight,
    Bell, Settings, Menu, X, Lock, Sparkles, MessageSquare, User, Utensils, PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import PlayerCard from "@/components/PlayerCard";
import { Waves } from "@/components/Waves";

interface CoachComment {
    coach: {
        _id: string;
        fullName: string;
    };
    comment: string;
    date: string;
}

interface Student {
    _id: string;
    fullName: string;
    position: string;
    rating: number;
    birthDate?: string;
    height?: number;
    weight?: number;
    academy: {
        _id: string;
        name: string;
    };
    stats: {
        pace: number;
        shooting: number;
        passing: number;
        dribbling: number;
        defending: number;
        physical: number;
    };
    coachComments?: CoachComment[];
}

export default function ParentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);

        // Redirect coaches to coach dashboard
        if (parsedUser.role === 'coach') {
            router.push("/coach");
            return;
        }

        setUser(parsedUser);
        fetchStudents(parsedUser._id);
    }, []);

    const fetchStudents = async (parentId: string) => {
        try {
            const response = await api.get(`/students?parent=${parentId}`);
            console.log("Students data:", response.data);
            setStudents(response.data);
            if (response.data.length > 0) {
                setSelectedStudent(response.data[0]);
            }
        } catch (error) {
            console.error("Öğrenciler yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return "-";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const calculateRating = (stats: any) => {
        const values = Object.values(stats) as number[];
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
                <div className="text-center">
                    <Users className="w-20 h-20 text-gray-700 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Henüz Kayıtlı Oyuncu Yok</h2>
                    <p className="text-gray-500 mb-8">Akademinizle iletişime geçerek oyuncu kaydı yaptırabilirsiniz.</p>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white">
            <Waves lineColor="rgba(99, 102, 241, 0.1)" backgroundColor="#050510" />
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : "-100%" }}
                className="fixed top-0 left-0 h-full w-80 bg-[#0a0a1a]/80 backdrop-blur-2xl border-r border-white/5 z-50 lg:translate-x-0 transition-transform overflow-y-auto"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Award className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">FUTKIDS</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                            {user?.fullName?.charAt(0) || "V"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base truncate text-white">{user?.fullName}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Veli Hesabı</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">OYUNCULARIM</div>
                        {students.map((student) => (
                            <button
                                key={student._id}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full p-4 rounded-2xl text-left transition-all duration-300 group ${selectedStudent?._id === student._id
                                    ? "bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] scale-[1.02]"
                                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                                    }`}
                            >
                                <div className="font-bold text-sm mb-1">{student.fullName}</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold opacity-60 tracking-widest">{student.position}</span>
                                    <span className={`text-xs font-black ${selectedStudent?._id === student._id ? "text-white" : "text-indigo-400"}`}>
                                        {calculateRating(student.stats)} OVR
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    <NavItem icon={<Home />} label="Genel Bakış" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                    <NavItem icon={<Activity />} label="İstatistikler" active={activeTab === "stats"} onClick={() => setActiveTab("stats")} />
                    <NavItem icon={<MessageSquare />} label="Antrenör Notları" active={activeTab === "comments"} onClick={() => setActiveTab("comments")} />
                    <NavItem icon={<Utensils />} label="Beslenme" active={activeTab === "nutrition"} onClick={() => setActiveTab("nutrition")} />
                    <NavItem icon={<PlayCircle />} label="AI Highlights" active={activeTab === "clips"} onClick={() => setActiveTab("clips")} />
                    <NavItem icon={<Calendar />} label="Maç Takvimi" active={activeTab === "matches"} onClick={() => setActiveTab("matches")} />
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Çıkış Yap</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main */}
            <div className="lg:ml-80 min-h-screen">
                <header className="sticky top-0 z-30 bg-[#050510]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-xl">
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold">{selectedStudent?.fullName}</h1>
                                <p className="text-sm text-gray-500 font-medium">{selectedStudent?.academy?.name || "Akademi"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2.5 hover:bg-white/5 rounded-xl">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <button className="p-2.5 hover:bg-white/5 rounded-xl">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto">
                    {activeTab === "overview" && selectedStudent && <OverviewTab student={selectedStudent} calculateAge={calculateAge} calculateRating={calculateRating} setActiveTab={setActiveTab} />}
                    {activeTab === "stats" && selectedStudent && <StatsTab student={selectedStudent} />}
                    {activeTab === "comments" && selectedStudent && <CommentsTab student={selectedStudent} />}
                    {activeTab === "nutrition" && selectedStudent && <ParentNutritionTab student={selectedStudent} />}
                    {activeTab === "clips" && selectedStudent && <ClipsTab student={selectedStudent} />}
                    {activeTab === "matches" && <MatchesTab />}
                </main>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <div className="w-5 h-5">{icon}</div>
            <span>{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    );
}

function OverviewTab({ student, calculateAge, calculateRating, setActiveTab }: any) {
    const overallRating = calculateRating(student.stats);

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
                {/* FIFA Style Player Card */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-shrink-0"
                >
                    <PlayerCard
                        fullName={student.fullName}
                        position={student.position}
                        rating={overallRating}
                        stats={student.stats}
                        academy={student.academy?.name}
                    />
                </motion.div>

                {/* Player Welcome & Quick Stats */}
                <div className="flex-1 space-y-8 w-full">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">GERÇEK BİR YILDIZ GİBİ!</h2>
                        <p className="text-gray-400 text-lg max-w-xl">
                            {student.fullName} bu ay harika bir performans sergiledi. Antrenör notlarına göre disiplini ve teknik becerileri hızla artıyor.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-[30px] p-6 flex items-center gap-4 group hover:bg-white/10 transition-all cursor-default"
                        >
                            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Akademi Sıralaması</div>
                                <div className="text-2xl font-black text-white italic">#4 VR</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-[30px] p-6 flex items-center gap-4 group hover:bg-white/10 transition-all cursor-default"
                        >
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Aylık Gelişim</div>
                                <div className="text-2xl font-black text-emerald-400 italic">+%5.2</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Stats Grid - Compact */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatBox icon={<Zap />} label="PAC" value={student.stats.pace} color="blue" />
                        <StatBox icon={<Target />} label="SHO" value={student.stats.shooting} color="orange" />
                        <StatBox icon={<Users />} label="PAS" value={student.stats.passing} color="green" />
                        <StatBox icon={<Activity />} label="DRI" value={student.stats.dribbling} color="purple" />
                        <StatBox icon={<Shield />} label="DEF" value={student.stats.defending} color="red" />
                        <StatBox icon={<Heart />} label="PHY" value={student.stats.physical} color="pink" />
                    </div>
                </div>
            </div>

            {/* AI Analysis - Premium */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-r from-[#1a1c2e] to-[#0a0a1a] border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl group"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] group-hover:bg-indigo-500/10 transition-all" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Sparkles className="w-12 h-12 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h3 className="text-2xl font-black italic text-white tracking-tighter">AI PERFORMANS ANALİZİ</h3>
                            <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20">PREMİUM</span>
                        </div>
                        <p className="text-gray-400 text-base leading-relaxed max-w-2xl">
                            Maç videolarındaki her hareketi, şut açısını ve koşu temposunu yapay zeka ile analiz edin.
                            Gelişim alanlarını milimetre hassasiyetle keşfedin.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-black text-sm transition-all flex items-center gap-2 shrink-0 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        <Lock className="w-4 h-4" />
                        HEMEN YÜKSELT
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickStatCard title="Bu Ay Gelişim" value="+5.2%" subtitle="Geçen aya göre" trend="up" color="emerald" />
                <QuickStatCard title="Toplam Maç" value="12" subtitle="Bu sezon" color="indigo" />
                <QuickStatCard title="Antrenman" value="24" subtitle="Bu ay" color="purple" />
            </div>

            {/* Recent AI Clips Preview */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">SON VİDEOLAR</h3>
                    <button onClick={() => setActiveTab("clips")} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Tümünü Gör</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group relative aspect-video bg-white/5 rounded-[30px] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="text-sm font-black text-white italic">Ceza Sahası Dışı Gol</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">GOL • 0:15</div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-12 h-12 text-white fill-current shadow-2xl" />
                        </div>
                    </div>
                    <div className="group relative aspect-video bg-white/5 rounded-[30px] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="text-sm font-black text-white italic">Kritik Müdahale</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SAVUNMA • 0:10</div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-12 h-12 text-white fill-current shadow-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Coach Comments */}
            {student.coachComments && student.coachComments.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Son Antrenör Notları</h3>
                        <button
                            onClick={() => { }}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            Tümünü Gör
                        </button>
                    </div>
                    <div className="space-y-3">
                        {student.coachComments.slice(0, 2).map((comment: CoachComment, idx: number) => (
                            <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl">
                                <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{comment.coach?.fullName || "Antrenör"}</span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-gray-500">{new Date(comment.date).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">{comment.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsTab({ student }: { student: Student }) {
    const statsColors: any = {
        pace: "from-blue-500 to-cyan-400",
        shooting: "from-orange-500 to-yellow-400",
        passing: "from-emerald-500 to-teal-400",
        dribbling: "from-purple-500 to-pink-400",
        defending: "from-red-500 to-rose-400",
        physical: "from-pink-500 to-fuchsia-400",
    };

    const statsLabels: any = {
        pace: "HIZ & ÇEVİKLİK",
        shooting: "ŞUT & BİTİRİCİLİK",
        passing: "PAS & VİZYON",
        dribbling: "TOP KONTROLÜ",
        defending: "SAVUNMA BİLGİSİ",
        physical: "FİZİKSEL GÜÇ",
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white">DETAYLI ANALİZ</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Performans Metrikleri</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sadece Görüntüleme</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(student.stats).map(([key, value]) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={key}
                        className="bg-white/5 rounded-[30px] p-8 border border-white/5 group hover:border-white/20 transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{statsLabels[key]}</span>
                                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{key}</h4>
                            </div>
                            <div className="text-4xl font-black text-white italic group-hover:scale-110 transition-transform duration-500">{value}</div>
                        </div>

                        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${value}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${statsColors[key]}`}
                            />
                            {/* Animated pulses */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        </div>

                        <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <span>Başlangıç Seviyesi</span>
                            <span>Profesyonel</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function ClipsTab({ student }: { student: Student }) {
    const mockClips = [
        {
            id: 1,
            title: "Ceza Sahası Dışı Gol",
            date: "2024-01-20",
            duration: "0:15",
            category: "GOL",
            aiNote: "Mükemmel top kontrolü ve şut açısı.",
            thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Kritik Müdahale",
            date: "2024-01-15",
            duration: "0:10",
            category: "SAVUNMA",
            aiNote: "Reaksiyon süresi 0.4s olarak ölçüldü.",
            thumbnail: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Asist Pası",
            date: "2024-01-10",
            duration: "0:12",
            category: "ASİST",
            aiNote: "Vizyon ve pas isabeti %98.",
            thumbnail: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=600&auto=format&fit=crop"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">AI HIGHLIGHTS</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">AI Tarafından Analiz Edilmiş Özel Anlar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockClips.map((clip, idx) => (
                    <motion.div
                        key={clip.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white/5 border border-white/5 rounded-[30px] overflow-hidden hover:border-indigo-500/50 transition-all duration-500"
                    >
                        {/* Thumbnail View */}
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={clip.thumbnail}
                                alt={clip.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent opacity-60" />

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                    <PlayCircle className="w-8 h-8 fill-current" />
                                </div>
                            </div>

                            <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                {clip.category}
                            </div>
                            <div className="absolute bottom-4 right-4 text-xs font-bold text-white/70">
                                {clip.duration}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">{clip.title}</h3>
                                <span className="text-[10px] text-gray-500 font-bold">{new Date(clip.date).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">AI ANALİZİ</span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">
                                    {clip.aiNote}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function CommentsTab({ student }: { student: Student }) {
    const comments = student.coachComments || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">KOÇ GÜNLÜĞÜ</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Gelişim Notları & Teknik Tavsiyeler</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
                    <span className="text-xs font-bold text-indigo-400">{comments.length} TOPLAM NOT</span>
                </div>
            </div>

            {comments.length === 0 ? (
                <div className="bg-white/5 rounded-[40px] p-20 border border-white/5 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-gray-700" />
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em]">Henüz antrenör notu bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment: CoachComment, idx: number) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="bg-white/5 rounded-[30px] p-8 border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex shrink-0 gap-4 md:flex-col items-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="md:text-center">
                                        <div className="text-sm font-black text-white italic uppercase tracking-tighter">{comment.coach?.fullName || "Antrenör"}</div>
                                        <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Teknik Sorumlu</div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-2xl p-6 relative">
                                    <div className="absolute top-4 right-6 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                                        {new Date(comment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <p className="text-gray-300 text-lg leading-relaxed font-medium">"{comment.comment}"</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MatchesTab() {
    const mockMatches = [
        { opponent: "Galatasaray U15", date: "2024-02-15", time: "14:00", location: "Florya Metin Oktay Tesisleri", type: "Lig Maçı", status: "YAKLAŞIYOR" },
        { opponent: "Beşiktaş U15", date: "2024-02-22", time: "11:00", location: "BJK Nevzat Demir Tesisleri", type: "Hazırlık Maçı", status: "YAKLAŞIYOR" }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">FİKSTÜR</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Maç Programı & Sonuçlar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {mockMatches.map((match, idx) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={idx}
                        className="bg-white/5 rounded-[30px] p-8 border border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-full bg-indigo-600/5 -skew-x-12 translate-x-10 group-hover:translate-x-5 transition-transform" />
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white italic">{match.date.split('-')[2]}</div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ŞUBAT</div>
                                </div>
                                <div className="h-12 w-[1px] bg-white/10" />
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{match.type}</div>
                                    <div className="text-2xl font-black text-white italic uppercase tracking-tighter">FK VS {match.opponent}</div>
                                    <div className="text-sm text-gray-500 font-medium">{match.location}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xl font-black text-white italic">{match.time}</div>
                                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{match.status}</div>
                                </div>
                                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                    Detay
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-indigo-300">
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm font-bold uppercase tracking-widest">Google Takvime Ekle</span>
                </div>
                <button className="text-xs font-black uppercase tracking-widest bg-indigo-600 text-white px-4 py-2 rounded-lg">SENKRONİZE ET</button>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value, color }: any) {
    const colorClasses: any = {
        blue: "text-blue-400 bg-blue-400/10",
        orange: "text-orange-400 bg-orange-400/10",
        green: "text-emerald-400 bg-emerald-400/10",
        purple: "text-purple-400 bg-purple-400/10",
        red: "text-red-400 bg-red-400/10",
        pink: "text-pink-400 bg-pink-400/10",
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center group hover:border-white/20 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="text-2xl font-black text-white italic">{value}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}

function QuickStatCard({ title, value, subtitle, trend, color = "indigo" }: any) {
    const colors = {
        indigo: "from-indigo-600/20 to-indigo-500/5",
        emerald: "from-emerald-600/20 to-emerald-500/5",
        purple: "from-purple-600/20 to-purple-500/5",
    };

    const textColors = {
        indigo: "text-indigo-400",
        emerald: "text-emerald-400",
        purple: "text-purple-400",
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-[30px] p-6 border border-white/5 hover:border-white/10 transition-all`}>
            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">{title}</div>
            <div className="flex items-end justify-between">
                <div className={`text-4xl font-black italic ${textColors[color as keyof typeof textColors]}`}>{value}</div>
                {trend && <TrendingUp className={`w-6 h-6 ${textColors[color as keyof typeof textColors]}`} />}
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</div>
        </div>
    );
}

function ParentNutritionTab({ student }: any) {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, [student._id]);

    const fetchPlans = async () => {
        try {
            const response = await api.get(`/nutrition?player=${student._id}`);
            setPlans(response.data);
        } catch (error) {
            console.error("Beslenme programları yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{student.fullName} - Beslenme Programı</h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                    <Utensils className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Henüz beslenme programı oluşturulmamış</p>
                    <p className="text-sm text-gray-600">Antrenörünüz tarafından program oluşturulduğunda burada görüntülenecektir</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {plans.map((plan) => (
                        <div key={plan._id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                                    <p className="text-sm text-gray-400">
                                        {new Date(plan.startDate).toLocaleDateString('tr-TR')} - {new Date(plan.endDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
                                    Aktif
                                </span>
                            </div>
                            {plan.notes && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-amber-200">{plan.notes}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(plan.dailyPlans || {}).map(([day, meals]: [string, any]) => (
                                    <div key={day} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <h4 className="font-semibold mb-3 capitalize text-emerald-400">{day}</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">🌅</span>
                                                <div className="flex-1">
                                                    <div className="text-gray-500 text-xs">Kahvaltı</div>
                                                    <div className="text-white">{meals.breakfast || "-"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">🌞</span>
                                                <div className="flex-1">
                                                    <div className="text-gray-500 text-xs">Öğle</div>
                                                    <div className="text-white">{meals.lunch || "-"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">🌙</span>
                                                <div className="flex-1">
                                                    <div className="text-gray-500 text-xs">Akşam</div>
                                                    <div className="text-white">{meals.dinner || "-"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">🍎</span>
                                                <div className="flex-1">
                                                    <div className="text-gray-500 text-xs">Atıştırmalık</div>
                                                    <div className="text-white">{meals.snacks || "-"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
