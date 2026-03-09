"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LogOut, Users, Award, MessageSquare, BarChart3, Bell, Settings, Menu, X,
    Plus, Edit, Save, ChevronRight, User, Filter, Search, CreditCard,
    Utensils, Sparkles, Video, TrendingUp, UserPlus, Mail, Phone, DollarSign, Trash2, Presentation, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import PlayerCard from "@/components/PlayerCard";
import TacticsBoard from "@/components/TacticsBoard";
import StatCarousel from "@/components/StatCarousel";
import PremiumStatCard from "@/components/PremiumStatCard";
import { PlayerDetailedStats, StatCategory, CoachNote } from "@/components/PlayerDetailedStats";
import PlayerCardSummary from "@/components/PlayerCardSummary";

// Helper to calculate category from birth date (U9 to U19)
const calculateCategoryFromDate = (dateString: string): string => {
    if (!dateString) return "";
    
    // Create UTC date strictly from the YYYY-MM-DD input
    const [year, month, day] = dateString.split('-');
    const birthDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    if (isNaN(birthDate.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age <= 9) return "U9";
    if (age === 10) return "U10";
    if (age === 11) return "U11";
    if (age === 12) return "U12";
    if (age === 13) return "U13";
    if (age === 14) return "U14";
    if (age === 15) return "U15";
    if (age === 16) return "U16";
    if (age === 17) return "U17";
    if (age === 18) return "U18";
    if (age >= 19) return "U19";
    
    return "";
};

interface Student {
    _id: string;
    fullName: string;
    position: string;
    rating: number;
    birthDate?: string;
    height?: number;
    weight?: number;
    teamCategory?: string;
    photoUrl?: string;
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
    coachComments?: any[];
    parent?: any;
}

export default function CoachDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("players");
    const [editMode, setEditMode] = useState(false);
    const [editedStats, setEditedStats] = useState<any>(null);
    const [newComment, setNewComment] = useState("");
    const [saving, setSaving] = useState(false);

    // New states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showCardModal, setShowCardModal] = useState(false);
    const [showNutritionModal, setShowNutritionModal] = useState(false);
    const [statModalPlayer, setStatModalPlayer] = useState<Student | null>(null);
    const [showStatDetailModal, setShowStatDetailModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (parsedUser.role !== 'coach') {
            router.push("/dashboard");
            return;
        }

        fetchStudents(parsedUser.academy);
    }, []);

    useEffect(() => {
        // Filter students
        let filtered = students;

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter(s => s.teamCategory === categoryFilter);
        }

        setFilteredStudents(filtered);
    }, [students, searchTerm, categoryFilter]);

    const fetchStudents = async (academyId: string) => {
        try {
            const response = await api.get(`/students?academy=${academyId}`);
            setStudents(response.data);
            setFilteredStudents(response.data);
            if (response.data.length > 0) {
                setSelectedStudent(response.data[0]);
                setEditedStats(response.data[0].stats);
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
        if (!stats) return 0;
        const values = Object.values(stats) as number[];
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    };

    const handleSaveStats = async () => {
        if (!selectedStudent || !editedStats) return;

        setSaving(true);
        try {
            await api.put(`/students/${selectedStudent._id}`, {
                stats: editedStats
            });

            await fetchStudents(user.academy);
            setEditMode(false);
            alert("İstatistikler güncellendi!");
        } catch (error) {
            console.error("İstatistikler güncellenemedi:", error);
            alert("Hata oluştu!");
        } finally {
            setSaving(false);
        }
    };

    const handleAddComment = async () => {
        if (!selectedStudent || !newComment.trim()) return;

        setSaving(true);
        try {
            const currentComments = selectedStudent.coachComments || [];
            await api.put(`/students/${selectedStudent._id}`, {
                coachComments: [
                    ...currentComments,
                    {
                        coach: user._id,
                        comment: newComment,
                        date: new Date()
                    }
                ]
            });

            setNewComment("");
            await fetchStudents(user.academy);
            alert("Yorum eklendi!");
        } catch (error) {
            console.error("Yorum eklenemedi:", error);
            alert("Hata oluştu!");
        } finally {
            setSaving(false);
        }
    };

    const handleStatChange = (stat: string, value: number) => {
        setEditedStats({
            ...editedStats,
            [stat]: Math.max(0, Math.min(99, value))
        });
    };

    const categories = ["U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19"];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000000] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/20/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <Users className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Sporcu Bulunamadı</h2>
                    <p className="text-gray-500 mb-10 text-sm leading-relaxed">Akademinizde henüz kayıtlı sporcu yok. Analizlere başlamak için ilk takımınızı veya oyuncularınızı ekleyin.</p>
                    <button
                        onClick={handleLogout}
                        className="w-full px-8 py-4 bg-white/10 text-white hover:bg-white/10 transition-all font-semibold rounded-2xl shadow-lg shadow-white/20"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        );
    }

    const navigationItems = [
        { id: "players", label: "Kadro & Oyuncular", icon: <Users className="w-4 h-4" /> },
        { id: "stats", label: "Analiz Stüdyosu", icon: <BarChart3 className="w-4 h-4" /> },
        { id: "parents", label: "Veliler", icon: <UserPlus className="w-4 h-4" /> },
        { id: "tactics", label: "Taktik Tahtası", icon: <Presentation className="w-4 h-4" /> },
        { id: "comments", label: "Notlar", icon: <MessageSquare className="w-4 h-4" /> },
        { id: "nutrition", label: "Beslenme", icon: <Utensils className="w-4 h-4" /> },
        { id: "ai", label: "AI Analiz", icon: <Sparkles className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-[#000000] text-[#E0E0E0] font-sans selection:bg-white/10/30">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-[60] bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-10 py-4">
                <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4 lg:gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 bg-white/10 rounded-lg lg:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            <Award className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <span className="text-sm lg:text-lg font-black tracking-tighter text-white uppercase italic">FUTKIDS <span className="hidden sm:inline text-gray-400/80 font-medium lowercase">analytics</span></span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? "bg-white/10 text-white shadow-lg shadow-white/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Profile & Actions */}
                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-white leading-none">{user?.fullName}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Antrenör</span>
                        </div>
                        <button className="p-2 lg:p-2.5 bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all rounded-lg lg:rounded-xl">
                            <Bell className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 lg:p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all rounded-lg lg:rounded-xl"
                            title="Çıkış Yap"
                        >
                            <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu (Scrollable) */}
                <div className="lg:hidden flex items-center gap-1 mt-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === item.id ? "bg-white/10 text-white" : "text-gray-400 bg-white/5"
                                }`}
                        >
                            <span className="w-3 h-3 text-current">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content Wrapper */}
            <div className="min-h-[calc(100vh-130px)] lg:min-h-[calc(100vh-74px)]">
                <main className="p-4 lg:p-10 max-w-[1700px] mx-auto">
                    {activeTab === "players" && (
                        <PlayersTab
                            students={filteredStudents}
                            selectedStudent={selectedStudent}
                            setSelectedStudent={(s: Student) => {
                                setSelectedStudent(s);
                                setEditedStats(s.stats);
                            }}
                            calculateAge={calculateAge}
                            calculateRating={calculateRating}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={setCategoryFilter}
                            categories={categories}
                            setShowCardModal={setShowCardModal}
                            user={user}
                            onRefresh={() => fetchStudents(user.academy)}
                        />
                    )}
                    {activeTab === "parents" && (
                        <ParentsTab user={user} students={students} />
                    )}
                    {activeTab === "stats" && (
                        <StatsTab
                            students={filteredStudents}
                            onSelectPlayer={(s: Student) => {
                                setStatModalPlayer(s);
                                setShowStatDetailModal(true);
                            }}
                            calculateRating={calculateRating}
                        />
                    )}
                    {activeTab === "comments" && selectedStudent && (
                        <CommentsTab
                            student={selectedStudent}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            handleAddComment={handleAddComment}
                            saving={saving}
                            user={user}
                        />
                    )}
                    {activeTab === "nutrition" && selectedStudent && (
                        <NutritionTab student={selectedStudent} />
                    )}
                    {activeTab === "tactics" && (
                        <TacticsTab
                            students={students}
                        />
                    )}
                    {activeTab === "ai" && selectedStudent && (
                        <AITab student={selectedStudent} />
                    )}
                </main>
            </div>

            {/* Player Card Modal */}
            {showCardModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowCardModal(false)}>
                    <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <PlayerCard
                            fullName={selectedStudent.fullName}
                            position={selectedStudent.position}
                            rating={calculateRating(selectedStudent.stats)}
                            stats={selectedStudent.stats}
                            academy={selectedStudent.academy?.name}
                            photoUrl={selectedStudent.photoUrl}
                        />
                        <button
                            onClick={() => setShowCardModal(false)}
                            className="mt-4 w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* Stat Detail Modal */}
            {showStatDetailModal && statModalPlayer && (
                <StatDetailModal
                    student={statModalPlayer}
                    onClose={() => setShowStatDetailModal(false)}
                    calculateRating={calculateRating}
                />
            )}
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm tracking-tight ${active ? "bg-gray-900 text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            <div className={`transition-colors ${active ? "text-white" : "text-gray-400 group-hover:text-gray-900"}`}>{icon}</div>
            <span className="flex-1 text-left">{label}</span>
        </button>
    );
}


function PlayersTab({
    students, selectedStudent, setSelectedStudent, calculateAge, calculateRating,
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, categories,
    setShowCardModal, user, onRefresh
}: any) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [parents, setParents] = useState<any[]>([]);
    const [loadingParents, setLoadingParents] = useState(false);

    const formatStatsForDetailed = (stats: any): StatCategory[] => {
        const s = stats || { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 };
        return [
            {
                label: "HIZ",
                baseValue: s.pace,
                subStats: [
                    { name: "Hızlanma", value: Math.max(0, s.pace - 2) },
                    { name: "Sprint Hızı", value: Math.min(99, s.pace + 2) }
                ]
            },
            {
                label: "ŞUT",
                baseValue: s.shooting,
                subStats: [
                    { name: "Bitiricilik", value: s.shooting },
                    { name: "Şut Gücü", value: Math.min(99, s.shooting + 4) }
                ]
            },
            {
                label: "PAS",
                baseValue: s.passing,
                subStats: [
                    { name: "Kısa Pas", value: s.passing },
                    { name: "Uzun Pas", value: Math.max(0, s.passing - 3) }
                ]
            },
            {
                label: "TOP SÜRME",
                baseValue: s.dribbling,
                subStats: [
                    { name: "Çeviklik", value: s.dribbling },
                    { name: "Top Kontrolü", value: Math.min(99, s.dribbling + 2) }
                ]
            },
            {
                label: "SAVUNMA",
                baseValue: s.defending,
                subStats: [
                    { name: "Top Kesme", value: s.defending },
                    { name: "Ayakta Müdahale", value: Math.min(99, s.defending + 1) }
                ]
            },
            {
                label: "FİZİK",
                baseValue: s.physical,
                subStats: [
                    { name: "Dayanıklılık", value: s.physical },
                    { name: "Güç", value: Math.max(0, s.physical - 3) }
                ]
            }
        ];
    };

    const initialPlayerState = {
        id: "",
        fullName: "",
        email: "",
        phone: "",
        position: "ST",
        birthDate: "",
        height: "",
        weight: "",
        teamCategory: "",
        parent: "",
        stats: {
            pace: 50,
            shooting: 50,
            passing: 50,
            dribbling: 50,
            defending: 50,
            physical: 50
        }
    };

    // New Player Form State
    const [newPlayer, setNewPlayer] = useState(initialPlayerState);

    const fetchParentsForDropdown = async () => {
        if (loadingParents) return;
        setLoadingParents(true);
        try {
            const academyId = user.academy._id || user.academy;
            const response = await api.get(`/users?role=parent&academy=${academyId}`);
            setParents(response.data);
        } catch (error) {
            console.error("Veliler yüklenemedi:", error);
        } finally {
            setLoadingParents(false);
        }
    };

    const handleAddPlayer = async () => {
        try {
            if (!newPlayer.fullName || !newPlayer.position) {
                alert("Lütfen zorunlu alanları doldurun (Ad Soyad, Mevki).");
                return;
            }

            const academyId = user.academy._id || user.academy;

            const payload: any = {
                fullName: newPlayer.fullName,
                position: newPlayer.position,
                birthDate: newPlayer.birthDate,
                teamCategory: newPlayer.teamCategory,
                academy: academyId,
                parent: newPlayer.parent || undefined
            };

            // Convert types
            if (newPlayer.height) payload.height = Number(newPlayer.height);
            if (newPlayer.weight) payload.weight = Number(newPlayer.weight);

            if (newPlayer.id) {
                // Update
                // Preserve stats/rating? Usually backend handles partial update or we should send them if they exist
                // For now assuming backend updates payload fields
                await api.put(`/students/${newPlayer.id}`, payload);
                alert("Oyuncu başarıyla güncellendi!");
            } else {
                // Create
                const defaultStats = {
                    pace: 50,
                    shooting: 50,
                    passing: 50,
                    dribbling: 50,
                    defending: 50,
                    physical: 50
                };
                payload.stats = defaultStats;
                payload.rating = 50;

                await api.post('/students', payload);
                alert("Oyuncu başarıyla eklendi!");
            }

            setShowAddModal(false);
            setNewPlayer(initialPlayerState);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Oyuncu işlemi başarısız:", error);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    const handleEditClick = (student: Student) => {
        setNewPlayer({
            id: student._id,
            fullName: student.fullName,
            email: (student as any).email || "",
            phone: (student as any).phone || "",
            position: student.position,
            birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : "",
            height: student.height?.toString() || "",
            weight: student.weight?.toString() || "",
            teamCategory: student.teamCategory || "",
            parent: (student as any).parent?._id || (student as any).parent || "",
            stats: (student as any).stats || {
                pace: 50,
                shooting: 50,
                passing: 50,
                dribbling: 50,
                defending: 50,
                physical: 50
            }
        });
        fetchParentsForDropdown();
        setShowAddModal(true);
    };

    const handleDeletePlayer = async (playerId: string) => {
        if (window.confirm("Bu oyuncuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            try {
                await api.delete(`/students/${playerId}`);
                if (onRefresh) onRefresh();

                if (selectedStudent?._id === playerId) {
                    setSelectedStudent(null);
                }

                alert("Oyuncu silindi.");
            } catch (error) {
                console.error("Oyuncu silinemedi:", error);
                alert("Silme işlemi başarısız.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">PERSONEL <span className="text-gray-400">REHBERİ</span></h2>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-2">{students.length} SPORCU KAYITLI</div>
                </div>
                <button
                    onClick={() => {
                        fetchParentsForDropdown();
                        setShowAddModal(true);
                    }}
                    className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-gray-200 hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] shadow-2xl"
                >
                    <UserPlus className="w-4 h-4" />
                    YENİ SPORCU KAYDET
                </button>
            </div>

            {/* === SPLIT LAYOUT: Left = Player Details, Right = Player List Sidebar === */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT SIDE: Selected Player Details */}
                <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-4">
                    {selectedStudent ? (
                        <>
                            {/* FUTBIN Upper Section: Player Card + Info */}
                            <PlayerCardSummary
                                fullName={selectedStudent.fullName}
                                position={selectedStudent.position}
                                teamCategory={selectedStudent.teamCategory}
                                birthDate={selectedStudent.birthDate}
                                height={selectedStudent.height}
                                weight={selectedStudent.weight}
                                stats={selectedStudent.stats}
                                rating={calculateRating(selectedStudent.stats)}
                                photoUrl={selectedStudent.photoUrl}
                            />

                            {/* FUTBIN Lower Section: Detailed Stats */}
                            <PlayerDetailedStats
                                stats={formatStatsForDetailed(selectedStudent.stats)}
                                traits={[]}
                                playerInfo={selectedStudent}
                                initialNotes={selectedStudent.coachComments?.map((c: any) => ({
                                    id: c._id || Math.random().toString(),
                                    text: c.comment,
                                    date: new Date(c.date),
                                    author: c.coach?.fullName || "Koç"
                                })) || []}
                                onSaveNote={async (noteText: string) => {
                                    try {
                                        const updated = await api.post(`/students/${selectedStudent._id}/comments`, {
                                            coachId: user._id,
                                            comment: noteText,
                                        });
                                        setSelectedStudent(updated.data);
                                    } catch (error) {
                                        console.error("Not eklenemedi:", error);
                                    }
                                }}
                                onUpdateNote={async (noteId: string, newText: string) => {
                                    try {
                                        const updated = await api.put(`/students/${selectedStudent._id}/comments/${noteId}`, {
                                            comment: newText,
                                        });
                                        setSelectedStudent(updated.data);
                                    } catch (error) {
                                        console.error("Not güncellenemedi:", error);
                                    }
                                }}
                                onDeleteNote={async (noteId: string) => {
                                    try {
                                        const updated = await api.delete(`/students/${selectedStudent._id}/comments/${noteId}`);
                                        setSelectedStudent(updated.data);
                                    } catch (error) {
                                        console.error("Not silinemedi:", error);
                                    }
                                }}
                                playstyles={selectedStudent.playstyles || []}
                                onAddPlaystyle={async (title: string, description: string) => {
                                    try {
                                        const updated = await api.post(`/students/${selectedStudent._id}/playstyles`, { title, description });
                                        setSelectedStudent(updated.data);
                                    } catch (error) {
                                        console.error("Oyun stili eklenemedi:", error);
                                    }
                                }}
                                onDeletePlaystyle={async (playstyleId: string) => {
                                    try {
                                        const updated = await api.delete(`/students/${selectedStudent._id}/playstyles/${playstyleId}`);
                                        setSelectedStudent(updated.data);
                                    } catch (error) {
                                        console.error("Oyun stili silinemedi:", error);
                                    }
                                }}
                                onTogglePlaystyle={async (playstyleId: string, active: boolean) => {
                                    try {
                                        const updated = await api.put(`/students/${selectedStudent._id}/playstyles/${playstyleId}`, { active });
                                        setSelectedStudent(updated.data);
                                    } catch (error) {
                                        console.error("Oyun stili güncellenemedi:", error);
                                    }
                                }}
                            />
                        </>
                    ) : (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-8 min-h-[500px]">
                            {/* AI Dashboard Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">FUTKIDS <span className="text-gray-400">AI Analiz</span></h3>
                                    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Performans Takip Merkezi</p>
                                </div>
                                <div className="px-4 py-2 bg-white/10/10 border border-white/20/20 rounded-xl">
                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">AI Destekli</span>
                                </div>
                            </div>

                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                    <div className="text-2xl font-black text-emerald-400 italic">{students.length}</div>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Toplam Sporcu</div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                    <div className="text-2xl font-black text-blue-400 italic">
                                        {students.length > 0 ? Math.round(students.reduce((sum: number, s: Student) => sum + calculateRating(s.stats), 0) / students.length) : 0}
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Ort. Reyting</div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                    <div className="text-2xl font-black text-amber-400 italic">
                                        {students.length > 0 ? Math.max(...students.map((s: Student) => calculateRating(s.stats))) : 0}
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">En Yüksek</div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                    <div className="text-2xl font-black text-purple-400 italic">
                                        {new Set(students.map((s: Student) => s.teamCategory || 'U15')).size}
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Kategori</div>
                                </div>
                            </div>

                            {/* Feature Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-indigo-600/10 to-transparent border border-white/20/10 rounded-2xl p-5 group hover:border-white/20/30 transition-all cursor-pointer">
                                    <div className="w-10 h-10 bg-white/10/20 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    </div>
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-wider mb-1">Performans Raporu</h4>
                                    <p className="text-gray-500 text-[10px] leading-relaxed">AI destekli detaylı performans analizi ve gelişim raporu oluşturun.</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/10 rounded-2xl p-5 group hover:border-emerald-500/30 transition-all cursor-pointer">
                                    <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-wider mb-1">Gelişim Takibi</h4>
                                    <p className="text-gray-500 text-[10px] leading-relaxed">Haftalık ve aylık performans değişimlerini takip edin.</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-500/10 rounded-2xl p-5 group hover:border-amber-500/30 transition-all cursor-pointer">
                                    <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </div>
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-wider mb-1">AI Öneriler</h4>
                                    <p className="text-gray-500 text-[10px] leading-relaxed">Oyunculara özel antrenman ve gelişim önerileri alın.</p>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="text-center py-6 border-t border-white/5">
                                <Users className="w-10 h-10 text-gray-700 mx-auto mb-3 opacity-30" />
                                <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[11px]">Detaylı analiz için sağ taraftan bir sporcu seçin</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: Player Selection Sidebar */}
                <div className="col-span-1 lg:col-span-4 xl:col-span-3">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl sticky top-6">
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-white/5 bg-black/20">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-3">Kadro Listesi</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Sporcu ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-white/5 rounded-xl text-white placeholder:text-gray-600 focus:border-white/20/50 focus:outline-none transition-all text-[11px] font-bold"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full mt-2 px-3 py-2 bg-black/30 border border-white/5 rounded-xl text-white font-black text-[9px] uppercase tracking-widest focus:border-white/20/50 focus:outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="all">TÜM KATEGORİLER</option>
                                {categories.map((cat: string) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Player List */}
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {students.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Sporcu bulunamadı</p>
                                </div>
                            ) : (
                                students.map((student: Student) => {
                                    const rating = calculateRating(student.stats);
                                    const isSelected = selectedStudent?._id === student._id;
                                    const ratingColor = rating >= 80 ? 'text-emerald-400' : rating >= 70 ? 'text-blue-400' : rating >= 60 ? 'text-amber-400' : 'text-gray-400';
                                    return (
                                        <div
                                            key={student._id}
                                            onClick={() => setSelectedStudent(student)}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2 ${
                                                isSelected
                                                    ? 'bg-white/10/10 border-l-indigo-500'
                                                    : 'border-l-transparent hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black italic border transition-all flex-shrink-0 ${
                                                isSelected 
                                                    ? 'bg-white/10/20 border-white/20/50 text-gray-400' 
                                                    : 'bg-[#111111] border-white/10 text-white'
                                            }`}>
                                                {student.fullName.charAt(0)}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-bold text-[12px] truncate transition-colors ${isSelected ? 'text-gray-400' : 'text-white'}`}>
                                                    {student.fullName}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">{student.position}</span>
                                                    <span className="text-[9px] text-gray-600">•</span>
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">{student.teamCategory || 'U15'}</span>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className={`text-lg font-black italic tracking-tighter flex-shrink-0 ${ratingColor}`}>
                                                {rating}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleEditClick(student)}
                                                    className="p-1.5 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                    title="DÜZENLE"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlayer(student._id)}
                                                    className="p-1.5 bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="SİL"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Inline Registration/Edit Form */}
                        {showAddModal && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border-b border-white/5"
                            >
                                {/* Background Image container for the form */}
                                <div 
                                    className="p-5 relative"
                                    style={{
                                        backgroundImage: 'url(/pitch-bg.jpg)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {/* Overlay to make white form readable on top of background */}
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

                                    {/* Actual form container */}
                                    <div className="relative bg-white/95 backdrop-blur-xl border border-white p-6 rounded-2xl shadow-xl">
                                        {/* Form Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4 text-gray-700" />
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                                                    {newPlayer.id ? "Profil Düzenle" : "Yeni Kayıt"}
                                                </h4>
                                            </div>
                                            <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm">
                                                <X className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>

                                    {/* Form Fields */}
                                    <div className="space-y-3">
                                        {/* Ad Soyad */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">AD SOYAD *</label>
                                            <input
                                                type="text"
                                                value={newPlayer.fullName}
                                                onChange={(e) => setNewPlayer({ ...newPlayer, fullName: e.target.value })}
                                                placeholder="Sporcu Adı Soyadı"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all placeholder:text-gray-400"
                                            />
                                        </div>

                                        {/* E-posta */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">E-POSTA <span className="font-normal">(isteğe bağlı)</span></label>
                                            <input
                                                type="email"
                                                value={newPlayer.email}
                                                onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                                                placeholder="ornek@mail.com"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all placeholder:text-gray-400"
                                            />
                                        </div>

                                        {/* Mevki + Kategori */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">MEVKİ *</label>
                                                <select
                                                    value={newPlayer.position}
                                                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-all appearance-none cursor-pointer"
                                                >
                                                    {["GK","CB","LB","RB","CM","CDM","CAM","LW","RW","ST"].map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">KATEGORİ</label>
                                                <select
                                                    value={newPlayer.teamCategory}
                                                    onChange={(e) => setNewPlayer({ ...newPlayer, teamCategory: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {["U9","U10","U11","U12","U13","U14","U15","U16","U17","U18","U19"].map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Doğum Tarihi */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">DOĞUM TARİHİ <span className="font-normal">(isteğe bağlı)</span></label>
                                            <input
                                                type="date"
                                                value={newPlayer.birthDate}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    const newCategory = calculateCategoryFromDate(date);
                                                    setNewPlayer({ 
                                                        ...newPlayer, 
                                                        birthDate: date,
                                                        ...(newCategory ? { teamCategory: newCategory } : {})
                                                    });
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-800 transition-all shadow-sm"
                                            />
                                        </div>

                                        {/* Boy + Kilo */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">BOY (cm)</label>
                                                <input
                                                    type="number"
                                                    value={newPlayer.height}
                                                    onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                                                    placeholder="-"
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-all placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">KİLO (kg)</label>
                                                <input
                                                    type="number"
                                                    value={newPlayer.weight}
                                                    onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                                                    placeholder="-"
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-all placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Veli Telefon */}
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">VELİ TELEFON <span className="font-normal">(isteğe bağlı)</span></label>
                                            <input
                                                type="tel"
                                                value={newPlayer.phone}
                                                onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                                                placeholder="05XX XXX XX XX"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-all placeholder:text-gray-400"
                                            />
                                        </div>

                                        {/* Veli Dropdown */}
                                        {parents.length > 0 && (
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">KAYITLI VELİ</label>
                                                <select
                                                    value={newPlayer.parent}
                                                    onChange={(e) => setNewPlayer({ ...newPlayer, parent: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-800 transition-all appearance-none cursor-pointer shadow-sm"
                                                >
                                                    <option value="">Veli Seçin...</option>
                                                    {parents.map((p: any) => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-6">
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={handleAddPlayer}
                                            className="flex-1 px-4 py-3.5 bg-gray-900 text-white hover:bg-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            {newPlayer.id ? "Güncelle" : "Kaydet"}
                                        </button>
                                    </div>
                                </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {students.length === 0 && (
                <div className="py-32 text-center bg-[#0a0a0a] border border-white/5 rounded-[32px]">
                    <Users className="w-16 h-16 text-gray-700 mx-auto mb-6 opacity-20" />
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-sm">Veri Girişi Bekleniyor</p>
                </div>
            )}


        </div>
    );
}

// Sub-components for better organization
function StatCell({ value }: { value: number }) {
    const colorClass = value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-amber-400' : 'text-gray-400';
    return (
        <td className="px-6 py-5 text-center">
            <span className={`text-sm font-black italic shadow-sm ${colorClass}`}>{value}</span>
        </td>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
            />
        </div>
    );
}

function SelectField({ label, value, options, onChange, optionLabels }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
            >
                {options.map((opt: string, idx: number) => (
                    <option key={opt || 'empty-' + idx} value={opt}>
                        {optionLabels ? optionLabels[idx] : (opt || 'Seçiniz...')}
                    </option>
                ))}
            </select>
        </div>
    );
}


function StatsTab({ students, onSelectPlayer, calculateRating }: any) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const playersPerPage = 20;

    const categories = ["U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19"];

    const categoryData = categories.map(cat => {
        const catPlayers = students.filter((s: Student) => s.teamCategory === cat);
        const avgOVR = catPlayers.length > 0
            ? Math.round(catPlayers.reduce((acc: number, s: Student) => acc + calculateRating(s.stats), 0) / catPlayers.length)
            : 0;
        return { name: cat, count: catPlayers.length, avgOVR };
    }).filter(c => c.count > 0);

    const filteredPlayers = selectedCategory
        ? students.filter((s: Student) => s.teamCategory === selectedCategory)
        : [];

    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
    const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

    if (!selectedCategory) {
        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">TAKIM <span className="text-gray-400">ÖZETİ</span></h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Yaş kategorilerine göre genel performans analizi</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {categoryData.length === 0 ? (
                        <div className="col-span-full py-32 text-center bg-[#0a0a0a] border border-white/5 rounded-[40px]">
                            <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm italic">VERİ AKIŞI BEKLENİYOR</p>
                        </div>
                    ) : (
                        categoryData.map((cat) => (
                            <motion.div
                                key={cat.name}
                                whileHover={{ y: -10, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
                                onClick={() => {
                                    setSelectedCategory(cat.name);
                                    setCurrentPage(1);
                                }}
                                className="group bg-[#0a0a0a] border border-white/5 p-8 lg:p-10 rounded-[40px] transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10/5 blur-3xl -z-10 group-hover:bg-white/10/10 transition-colors"></div>

                                <div className="flex items-center justify-between mb-8 lg:mb-12">
                                    <div className="w-16 h-16 bg-[#111111] border border-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white italic shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                                        {cat.name}
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                                        AKTİF
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Kadro Boyutu</span>
                                            <span className="text-3xl font-black text-white italic">{cat.count}</span>
                                        </div>
                                        <div className="text-right flex flex-col">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Ort. Reyting</span>
                                            <span className="text-3xl font-black text-white italic border-b-4 border-white/20/20 leading-none">{cat.avgOVR}</span>
                                        </div>
                                    </div>

                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.avgOVR}%` }}
                                            className="h-full bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">DETAYLI ANALİZİ GÖR</span>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Comparison Section */}
                <div className="mt-20 bg-[#0a0a0a] border border-white/5 rounded-[50px] p-16 shadow-2xl overflow-hidden relative border-t-4 border-white/10/30">
                    <div className="max-w-xl relative z-10">
                        <h3 className="text-4xl font-black text-white tracking-tight mb-4 leading-none uppercase italic">KATEGORİ <span className="text-gray-400">KIYASLAMASI</span></h3>
                        <p className="text-lg text-gray-500 font-bold mb-12 italic leading-relaxed">
                            Takımlarınızı teknik disiplinlere göre karşılaştırın ve gelişim fırsatlarını belirleyin.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all">KIYASLAMAYI BAŞLAT</button>
                            <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">VERİLERİ DIŞA AKTAR</button>
                        </div>
                    </div>

                    <div className="absolute right-[-5%] top-[-5%] opacity-5 pointer-events-none transform rotate-12">
                        <BarChart3 className="w-[600px] h-[600px] text-white" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all flex items-center justify-center group shadow-2xl"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180 transition-transform group-hover:-translate-x-1" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase italic leading-none">{selectedCategory} <span className="text-gray-400">AKADEMİSİ</span></h2>
                        <p className="text-sm text-gray-500 font-bold mt-2 uppercase tracking-widest">Aktif Kadro / {filteredPlayers.length} Analiz Edilen Sporcu</p>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2 bg-black/20 border border-white/5 p-2 rounded-2xl">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl disabled:opacity-10 transition-all"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <div className="px-8 text-xs font-black text-white tracking-[0.2em] italic uppercase">
                            SAYFA {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl disabled:opacity-10 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
                {currentPlayers.map((student: Student) => (
                    <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}
                        onClick={() => onSelectPlayer(student)}
                        className="bg-[#0a0a0a] border border-white/5 p-6 lg:p-8 group transition-all cursor-pointer relative rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 bg-[#111111] border border-white/10 flex items-center justify-center font-black text-xl text-white italic rounded-2xl group-hover:bg-white/10 group-hover:rotate-6 transition-all shadow-2xl">
                                {student.fullName.charAt(0)}
                            </div>
                            <div className="text-right bg-black/20 border border-white/5 px-4 py-2 rounded-2xl group-hover:bg-white/10 transition-all">
                                <div className="text-2xl font-black text-white italic tracking-tighter leading-none">
                                    {calculateRating(student.stats)}
                                </div>
                                <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1 group-hover:text-white/40">REYTING</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white leading-none truncate group-hover:text-gray-400 transition-colors uppercase italic">
                                {student.fullName}
                            </h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 bg-white/5 inline-block px-2 py-1 rounded-lg">
                                {student.position}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-2">
                            {Object.entries(student.stats).slice(0, 3).map(([key, val]: [string, any]) => (
                                <div key={key} className="flex flex-col">
                                    <span className="text-sm font-black text-white border-b-2 border-white/20/10 italic leading-none mb-1">{val}</span>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{key === 'pace' ? 'HIZ' : key === 'shooting' ? 'ŞUT' : 'PAS'}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function StatDetailModal({ student, onClose, calculateRating }: any) {
    const mockSeasonStats = [
        { label: "OYNANAN MAÇ", value: 14, icon: <Award className="w-4 h-4 text-emerald-400" /> },
        { label: "TOPLAM DAKİKA", value: "1.120", icon: <TrendingUp className="w-4 h-4 text-gray-400" /> },
        { label: "SKOR KATKISI", value: 13, icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
        { label: "ANALİZ SKORU", value: 8.2, icon: <BarChart3 className="w-4 h-4 text-blue-400" /> },
    ];

    return (
        <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 lg:p-10 animate-in fade-in zoom-in duration-300" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0a0a0a] w-full max-w-[1500px] h-full lg:h-[85vh] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row relative rounded-3xl lg:rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 lg:top-8 lg:right-8 w-10 h-10 lg:w-12 lg:h-12 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl lg:rounded-2xl transition-all z-50 flex items-center justify-center shadow-2xl">
                    <X className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>

                {/* Left Side: Profile Information */}
                <div className="w-full lg:w-[32%] bg-[#0D0E25] p-10 lg:p-14 flex flex-col border-r border-white/5 overflow-y-auto custom-scrollbar">
                    <div className="mb-12">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white italic shadow-2xl">
                                {student.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">PROGRESİF KAYIT</span>
                                <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase italic">{student.fullName}</h2>
                            </div>
                        </div>

                        <div className="flex flex-col mb-10">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">PERFORMANS ENDEKSİ</span>
                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl lg:text-8xl font-black text-white italic tracking-tighter leading-none shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                    {calculateRating(student.stats)}
                                </span>
                                <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">+2.4% Artış</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="px-5 py-2.5 bg-white/10 text-white text-[10px] font-black tracking-widest uppercase rounded-xl shadow-lg shadow-white/20">{student.position}</span>
                            <span className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black tracking-widest uppercase rounded-xl">{student.teamCategory || "U15"} KADROSU</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <ProfileRowVeo label="AKADEMİ_KAYNAĞI" value={student.academy?.name || "FUTKIDS"} />
                        <ProfileRowVeo label="GELİŞİM_DURUMU" value="POTANSİYEL_YÜKSEK" />
                        <ProfileRowVeo label="ANALİZ_PERİYODU" value="2024_Q1" />
                        <ProfileRowVeo label="VERİ_DOĞRULAMA" value="ONAYLANDI" />
                    </div>

                    <div className="mt-12">
                        <button className="w-full py-5 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:shadow-2xl transition-all">
                            STUDIO RAPORU OLUŞTUR
                        </button>
                    </div>
                </div>

                {/* Right Side: Analytics & Matrix */}
                <div className="flex-1 p-10 lg:p-14 overflow-y-auto bg-[#0a0a0a] custom-scrollbar">
                    <div className="space-y-12">
                        {/* Summary Modules */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mockSeasonStats.map((stat, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] group hover:bg-white/[0.04] hover:-translate-y-1 transition-all">
                                    <div className="w-12 h-12 bg-white/10/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10/20 group-hover:scale-110 group-hover:rotate-3 transition-all text-gray-400">
                                        {stat.icon}
                                    </div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-2xl font-black text-white italic leading-none">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            {/* Performance Radar Placeholder */}
                            <div className="bg-[#0D0E25] border border-white/5 rounded-[40px] p-10 shadow-2xl flex flex-col">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">TEKNİK ANALİZ MATRİSİ</h3>
                                    <BarChart3 className="w-5 h-5 text-gray-700" />
                                </div>
                                <div className="flex-1 flex flex-wrap gap-5 items-center justify-center p-6">
                                    {Object.entries(student.stats).map(([key, value]: [string, any]) => (
                                        <div key={key} className="flex flex-col items-center bg-white/5 border border-white/5 px-8 py-5 rounded-3xl min-w-[130px] group hover:bg-white/10 transition-all">
                                            <span className="text-[9px] font-black text-gray-500 group-hover:text-white/40 uppercase mb-1">{key === 'pace' ? 'HIZ' : key === 'shooting' ? 'ŞUT' : key === 'passing' ? 'PAS' : key === 'dribbling' ? 'DRI' : key === 'defending' ? 'DEF' : 'FIZ'}</span>
                                            <span className="text-2xl font-black text-white italic">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Observations & Progress */}
                            <div className="space-y-10">
                                <div className="bg-[#0D0E25] border border-white/5 rounded-[40px] p-10 shadow-2xl">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">GÖZLEM NOTLARI</h3>
                                    <div className="space-y-6">
                                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                                            <p className="text-xs font-bold text-emerald-400 italic leading-relaxed">
                                                "Mükemmel toparlanma hızı ve saha içi farkındalık."
                                            </p>
                                        </div>
                                        <div className="p-6 bg-white/10/5 border border-white/20/10 rounded-3xl">
                                            <p className="text-xs font-bold text-gray-400 italic leading-relaxed">
                                                "Son bölgede karar verme kalitesi yaş grubunun üzerinde."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0D0E25] border border-white/5 rounded-[40px] p-10 shadow-2xl">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">GELİŞİM GRAFİĞİ</h3>
                                        <TrendingUp className="w-4 h-4 text-gray-700" />
                                    </div>
                                    <div className="flex items-end gap-3 h-24">
                                        {[4, 6, 8, 5, 9, 8].map((v, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${v * 10}%` }}
                                                className={`flex-1 rounded-t-xl ${i === 5 ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-white/5'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-8">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">SON 6 MAÇ PERFORMANSI</span>
                                        <span className="text-xs font-black text-emerald-400 italic">+12% ARTIŞ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ProfileRowVeo({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between w-full py-5 border-b border-white/5">
            <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase">{label}</span>
            <span className="text-xs font-black text-white italic uppercase truncate ml-4">{value}</span>
        </div>
    );
}

function ProfileRowBw({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between w-full py-6 border-b-2 border-black/10">
            <span className="text-xs font-black text-black/30 tracking-widest uppercase">{label}</span>
            <span className="text-lg font-black text-black italic uppercase">{value}</span>
        </div>
    );
}

function ProfileRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between w-full py-4 border-b border-white/5">
            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">{label}</span>
            <span className="text-sm font-black text-white italic uppercase">{value}</span>
        </div>
    );
}

function CommentsTab({ student, newComment, setNewComment, handleAddComment, saving, user }: any) {
    const comments = student.coachComments || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">ANTRENÖR <span className="text-gray-400">NOTLARI</span></h2>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Gelişim takibi ve özel gözlemler</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all group-hover:bg-white/10/10" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">YENİ GÖZLEM EKLE</h3>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Sporcu teknik kapasitesi, fiziksel durumu veya mental gelişimi hakkında notunuzu buraya yazın..."
                    className="w-full h-40 px-8 py-6 bg-black/20 border border-white/5 rounded-[32px] text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-white/20/50 focus:bg-black/40 transition-all font-bold text-sm italic shadow-inner"
                />
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleAddComment}
                        disabled={saving || !newComment.trim()}
                        className="group flex items-center gap-4 px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] disabled:opacity-30"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        {saving ? "KAYDEDİLİYOR..." : "NOTU SİSTEME İŞLE"}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">GEÇMİŞ KAYITLAR ({comments.length})</h3>
                </div>
                {comments.length === 0 ? (
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-20 text-center shadow-2xl">
                        <MessageSquare className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                        <p className="text-gray-600 font-black uppercase tracking-widest text-xs italic">Henüz bir veri girişi yapılmamış</p>
                    </div>
                ) : (
                    comments.map((comment: any, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-8 lg:p-10 hover:border-white/20/20 transition-all group"
                        >
                            <div className="flex gap-8">
                                <div className="w-16 h-16 bg-[#111111] rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-2xl group-hover:bg-white/10 transition-all">
                                    <User className="w-7 h-7 text-gray-400 group-hover:text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-white italic uppercase tracking-tight">{comment.coach?.fullName || user.fullName}</span>
                                            <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                {new Date(comment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 font-bold italic leading-relaxed text-sm bg-black/10 p-6 rounded-2xl border border-white/[0.02]">
                                        "{comment.comment}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

function NutritionTab({ student }: any) {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPlan, setNewPlan] = useState({
        title: "",
        startDate: "",
        endDate: "",
        dailyPlans: {
            monday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
            tuesday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
            wednesday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
            thursday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
            friday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
            saturday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
            sunday: { breakfast: "", lunch: "", dinner: "", snacks: "" },
        },
        notes: ""
    });

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

    const handleCreatePlan = async () => {
        try {
            await api.post('/nutrition', {
                ...newPlan,
                player: student._id
            });
            setShowModal(false);
            fetchPlans();
        } catch (error) {
            console.error("Program oluşturulamadı:", error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">BESLENME <span className="text-emerald-500">PROGRAMI</span></h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Performans odaklı diyet yönetimi</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full lg:w-auto group flex items-center justify-center gap-4 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] shadow-2xl"
                >
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    YENİ PROGRAM OLUŞTUR
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-24 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
                        <Utensils className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-white font-black uppercase tracking-[0.3em] text-sm mb-4 italic">VERİ BULUNAMADI</p>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Sporcu için henüz aktif bir beslenme planı oluşturulmamış</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10">
                    {plans.map((plan) => (
                        <div key={plan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-all group-hover:bg-emerald-600/10" />

                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 pb-8 border-b border-white/5">
                                    <div className="text-center lg:text-left">
                                        <h3 className="text-2xl font-black text-white italic tracking-tight uppercase mb-4 lg:mb-2">{plan.title}</h3>
                                        <div className="flex items-center justify-center lg:justify-start gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                <Calendar className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    {new Date(plan.startDate).toLocaleDateString('tr-TR')} - {new Date(plan.endDate).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {plan.notes && (
                                        <div className="w-full lg:max-w-md bg-black/20 p-6 rounded-3xl border border-white/5 italic text-sm text-gray-400 font-bold text-center lg:text-left">
                                            "{plan.notes}"
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {Object.entries(plan.dailyPlans || {}).map(([day, meals]: [string, any], idx: number) => (
                                        <motion.div
                                            key={day}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-black/20 border border-white/5 rounded-[32px] p-8 hover:border-emerald-500/20 transition-all hover:-translate-y-2 group/card"
                                        >
                                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8 border-b border-emerald-500/10 pb-4 inline-block">{day}</h4>
                                            <div className="space-y-6">
                                                <MealItem label="KAHVALTI" content={meals.breakfast} icon="🌅" />
                                                <MealItem label="ÖĞLE YEMEĞİ" content={meals.lunch} icon="🌞" />
                                                <MealItem label="AKŞAM YEMEĞİ" content={meals.dinner} icon="🌙" />
                                                <MealItem label="ARA ÖĞÜN" content={meals.snacks} icon="🍎" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 lg:p-10" onClick={() => setShowModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#050614] border border-white/10 rounded-3xl lg:rounded-[50px] p-6 lg:p-16 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">PROGRAM <span className="text-emerald-500">MİMARI</span></h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">Sporcu için en iyisini tasarlayın</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all text-gray-500 hover:text-red-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">PROGRAMIN ADI</label>
                                <input
                                    type="text"
                                    value={newPlan.title}
                                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                    className="w-full px-10 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:border-emerald-500 transition-all focus:bg-white/10 font-black italic uppercase tracking-tighter"
                                    placeholder="Örn: OCAK AYI GÜÇ PROGRAMI"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">BAŞLANGIÇ</label>
                                    <input
                                        type="date"
                                        value={newPlan.startDate}
                                        onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                                        className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">BİTİŞ</label>
                                    <input
                                        type="date"
                                        value={newPlan.endDate}
                                        onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                                        className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                            {Object.keys(newPlan.dailyPlans).map((day) => (
                                <div key={day} className="bg-white/5 rounded-[40px] p-8 border border-white/5 space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 border-b border-emerald-500/10 pb-4">{day}</h4>
                                    <DailyMealInput day={day} label="KAHVALTI" value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].breakfast} onChange={(v: string) => updateDailyPlan(day, 'breakfast', v)} />
                                    <DailyMealInput day={day} label="ÖĞLE" value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].lunch} onChange={(v: string) => updateDailyPlan(day, 'lunch', v)} />
                                    <DailyMealInput day={day} label="AKŞAM" value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].dinner} onChange={(v: string) => updateDailyPlan(day, 'dinner', v)} />
                                    <DailyMealInput day={day} label="ARA ÖĞÜN" value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].snacks} onChange={(v: string) => updateDailyPlan(day, 'snacks', v)} />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-6 pt-12 border-t border-white/5">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-6 bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">İPTAL ET</button>
                            <button onClick={handleCreatePlan} className="flex-[2] py-6 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-500 hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all">SİSTEME KAYDET VE YAYINLA</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );

    function updateDailyPlan(day: string, meal: string, value: string) {
        setNewPlan({
            ...newPlan,
            dailyPlans: {
                ...newPlan.dailyPlans,
                [day]: { ...newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans], [meal]: value }
            }
        });
    }
}

function MealItem({ label, content, icon }: any) {
    return (
        <div className="space-y-2">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">{label}</span>
            <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/[0.03] flex items-center gap-3">
                <span className="text-xl grayscale group-hover/card:grayscale-0 transition-all">{icon}</span>
                <span className="text-xs font-bold text-gray-400 italic truncate">{content || "Planlanmadı"}</span>
            </div>
        </div>
    );
}

function DailyMealInput({ label, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:border-emerald-500 transition-all"
                placeholder="..."
            />
        </div>
    );
}

function AITab({ student }: any) {
    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">AI <span className="text-amber-500">ANALİZ</span> MERKEZİ</h2>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Yapay zeka destekli performans öngörüleri</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[50px] p-12 lg:p-20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[150px] rounded-full -mr-64 -mt-64 transition-all group-hover:bg-amber-600/10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 blur-[100px] rounded-full -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                    <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center mb-10 border border-amber-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        <Sparkles className="w-12 h-12 text-amber-400" />
                    </div>

                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6">AI VİDEO <span className="text-amber-500">ANALİTİĞİ</span></h3>
                    <p className="text-gray-400 font-bold italic leading-relaxed text-lg mb-12">
                        Gelişmiş bilgisayarlı görü algoritmalarımız ile oyuncunun saha içi dizilimini, sprint hızlarını ve teknik hatalarını saniyeler içinde raporlayın.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                        <div className="bg-black/40 border border-white/5 p-8 rounded-[32px] hover:border-amber-500/30 transition-all text-left group/box">
                            <Video className="w-8 h-8 text-amber-400 mb-6 group-hover/box:rotate-12 transition-transform" />
                            <h4 className="text-white font-black uppercase tracking-widest mb-2 italic">VERİ GİRİŞİ</h4>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Maç veya antrenman görüntülerini sisteme yükleyin</p>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-8 rounded-[32px] hover:border-amber-500/30 transition-all text-left group/box">
                            <TrendingUp className="w-8 h-8 text-amber-400 mb-6 group-hover/box:scale-110 transition-transform" />
                            <h4 className="text-white font-black uppercase tracking-widest mb-2 italic">DERİN ANALİZ</h4>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Yapay zeka tarafından hazırlanan gelişim rotasını takip edin</p>
                        </div>
                    </div>

                    <button className="group relative px-12 py-6 bg-amber-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-amber-500 hover:shadow-[0_20px_60px_rgba(245,158,11,0.35)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        PREMIUM'A YÜKSELT VE KEŞFET
                    </button>
                    <p className="mt-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">FUTKIDS PREMIUM ÜYELİK GEREKTİRİR</p>
                </div>
            </div>
        </div>
    );
}


function ParentsTab({ user, students }: any) {
    const [parents, setParents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedParent, setSelectedParent] = useState<any>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [messageType, setMessageType] = useState<'sms' | 'email'>('email');
    const [message, setMessage] = useState({ subject: "", body: "" });

    const [newParent, setNewParent] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: ""
    });

    useEffect(() => {
        if (user && user.academy) {
            fetchParents();
        }
    }, [user]);

    const fetchParents = async () => {
        try {
            const academyId = user.academy._id || user.academy;
            const response = await api.get(`/users?role=parent&academy=${academyId}`);
            let fetchedParents = response.data;

            fetchedParents = fetchedParents.map((parent: any) => {
                const childrens = students.filter((s: any) =>
                    (s.parent && (s.parent._id === parent._id || s.parent === parent._id))
                );
                return { ...parent, students: childrens };
            });

            setParents(fetchedParents);
        } catch (error) {
            console.error("Veliler yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddParent = async () => {
        try {
            if (!newParent.fullName || !newParent.email) {
                alert("Lütfen ad soyad ve email alanlarını doldurun.");
                return;
            }

            const academyId = user.academy._id || user.academy;
            await api.post('/users', {
                ...newParent,
                role: 'parent',
                academy: academyId
            });

            setShowAddModal(false);
            setNewParent({ fullName: "", email: "", phone: "", password: "" });
            fetchParents();
            alert("Veli başarıyla eklendi!");
        } catch (error) {
            console.error("Veli eklenemedi:", error);
        }
    };

    const handleDeleteParent = async (parentId: string) => {
        if (window.confirm("Bu veliyi silmek istediğinizden emin misiniz?")) {
            try {
                await api.delete(`/users/${parentId}`);
                fetchParents();
            } catch (error) {
                console.error("Veli silinemedi:", error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!selectedParent) return;
        alert(`${messageType === 'sms' ? 'SMS' : 'Email'} gönderildi! (Simülasyon)`);
        setShowMessageModal(false);
        setMessage({ subject: "", body: "" });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">VELİ <span className="text-blue-500">REHBERİ</span></h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">İletişim ve aile yönetimi</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)] shadow-2xl"
                >
                    <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                    YENİ VELİ KAYDET
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : parents.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-24 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-blue-500/20">
                        <Users className="w-12 h-12 text-blue-500" />
                    </div>
                    <p className="text-white font-black uppercase tracking-[0.3em] text-sm mb-4 italic">VELİ KAYDI YOK</p>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Sistemde henüz kayıtlı bir veli bulunmamaktadır</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {parents.map((parent, idx) => (
                        <motion.div
                            key={parent._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 hover:border-blue-500/20 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all" />

                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black text-white italic shadow-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                    {parent.fullName?.charAt(0) || "V"}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{parent.fullName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{parent.students?.length || 0} SPORCU VELİSİ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 relative z-10">
                                <ContactLine icon={<Mail className="w-3.5 h-3.5" />} text={parent.email} type="EMAIL" />
                                <ContactLine icon={<Phone className="w-3.5 h-3.5" />} text={parent.phone} type="TELEFON" />
                            </div>

                            {parent.students?.length > 0 && (
                                <div className="mb-8 p-4 bg-black/20 rounded-2xl border border-white/5 relative z-10">
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1 mb-2 block">BAĞLI SPORCULAR</span>
                                    <div className="flex flex-wrap gap-2">
                                        {parent.students.map((s: any) => (
                                            <span key={s._id} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold text-gray-400 border border-white/5">
                                                {s.fullName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 relative z-10">
                                <ParentButton icon={<Mail />} label="E-POSTA" color="blue" onClick={() => { setSelectedParent(parent); setMessageType('email'); setShowMessageModal(true); }} />
                                <ParentButton icon={<Phone />} label="SMS" color="emerald" onClick={() => { setSelectedParent(parent); setMessageType('sms'); setShowMessageModal(true); }} />
                                <button
                                    onClick={() => handleDeleteParent(parent._id)}
                                    className="p-4 bg-white/5 text-gray-600 hover:text-red-500 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Parent Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 lg:p-10" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#050614] border border-white/10 rounded-[50px] p-8 lg:p-16 max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">VELİ <span className="text-blue-500">KAYIT</span></h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">Sisteme yeni bir veli ekleyin</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all text-gray-500 hover:text-red-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <InputField label="AD SOYAD" value={newParent.fullName} onChange={(val: string) => setNewParent({ ...newParent, fullName: val })} placeholder="Veli Adı Soyadı" />
                            <InputField label="E-POSTA" value={newParent.email} onChange={(val: string) => setNewParent({ ...newParent, email: val })} placeholder="veli@ornek.com" />
                            <InputField label="TELEFON" value={newParent.phone} onChange={(val: string) => setNewParent({ ...newParent, phone: val })} placeholder="05XX XXX XX XX" />
                            <InputField label="ŞİFRE" value={newParent.password} onChange={(val: string) => setNewParent({ ...newParent, password: val })} placeholder="Giriş şifresi (İsteğe bağlı)" type="password" />
                        </div>

                        <div className="flex gap-6 mt-12">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">İPTAL</button>
                            <button onClick={handleAddParent} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all">VELİYİ KAYDET</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && selectedParent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 lg:p-10" onClick={() => setShowMessageModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#050614] border border-white/10 rounded-[50px] p-8 lg:p-16 max-w-4xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{messageType === 'sms' ? 'SMS' : 'E-POSTA'} <span className="text-blue-500">MERKEZİ</span></h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">{selectedParent.fullName} ile iletişim kurun</p>
                            </div>
                            <button onClick={() => setShowMessageModal(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all text-gray-500 hover:text-red-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {messageType === 'email' && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">KONU</label>
                                    <input
                                        type="text"
                                        value={message.subject}
                                        onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[24px] text-white focus:border-blue-500 transition-all font-bold italic"
                                        placeholder="Mesaj konusu..."
                                    />
                                </div>
                            )}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">MESAJ İÇERİĞİ</label>
                                <textarea
                                    value={message.body}
                                    onChange={(e) => setMessage({ ...message, body: e.target.value })}
                                    className="w-full h-48 px-8 py-6 bg-white/5 border border-white/10 rounded-[32px] text-white focus:border-blue-500 transition-all font-bold italic resize-none"
                                    placeholder="Mesajınızı buraya yazın..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-6 mt-12">
                            <button onClick={() => setShowMessageModal(false)} className="flex-1 py-5 bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">İPTAL</button>
                            <button onClick={handleSendMessage} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all">GÖNDER</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function ContactLine({ icon, text, type }: any) {
    return (
        <div className="flex items-center gap-4 group/line">
            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover/line:text-blue-400 transition-colors">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-700 uppercase">{type}</span>
                <span className="text-sm font-bold text-gray-400 tracking-tight">{text || "Belirtilmedi"}</span>
            </div>
        </div>
    );
}

function ParentButton({ icon, label, color, onClick }: any) {
    const colorClasses = color === 'blue' ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white';
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-white/20 ${colorClasses}`}
        >
            <span className="w-4 h-4">{icon}</span>
            {label}
        </button>
    );
}


function TacticsTab({ students }: { students: Student[] }) {
    const mixedItems = [
        <PlayerCard
            key="p1"
            fullName="Mert Küçük"
            position="ST"
            rating={88}
            stats={{ pace: 92, shooting: 85, passing: 78, dribbling: 88, defending: 40, physical: 75 }}
            academy="FUTKIDS"
        />,
        <PremiumStatCard
            key="s1"
            title="Hız Canavarı"
            value={94}
            subtitle="Hız"
            iconType="speed"
            color="#f59e0b"
        />,
        <PlayerCard
            key="p2"
            fullName="Arda Güler"
            position="CAM"
            rating={90}
            stats={{ pace: 82, shooting: 84, passing: 91, dribbling: 93, defending: 45, physical: 68 }}
            academy="REAL MADRID"
        />,
        <PremiumStatCard
            key="s2"
            title="Pas Ustası"
            value={91}
            subtitle="Pas"
            iconType="pass"
            color="#3b82f6"
        />,
        <PlayerCard
            key="p3"
            fullName="Ferdi Kadıoğlu"
            position="LB"
            rating={85}
            stats={{ pace: 88, shooting: 72, passing: 83, dribbling: 86, defending: 81, physical: 79 }}
            academy="FENERBAHCE"
        />,
        <PremiumStatCard
            key="s3"
            title="Şut Gücü"
            value={89}
            subtitle="Şut"
            iconType="shoot"
            color="#ef4444"
        />
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">TAKTAK <span className="text-gray-400">MERKEZİ</span></h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Diziliş ve stratejik planlama</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="bg-[#0a0a0a] rounded-3xl lg:rounded-[50px] p-6 lg:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10/5 blur-[120px] -z-10 group-hover:bg-white/10/10 transition-all"></div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10/10 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/20/20">
                                <Presentation className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-black text-white italic uppercase tracking-tight">ANA DİZİLİŞ</h3>
                        </div>
                        <div className="bg-black/20 rounded-2xl lg:rounded-[40px] p-4 lg:p-10 border border-white/5 shadow-inner overflow-x-auto scrollbar-hide">
                            <div className="min-w-[600px] lg:min-w-0">
                                <TacticsBoard students={students} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    <div className="bg-[#0a0a0a] rounded-[50px] border border-white/5 p-8 flex-1 flex flex-col relative overflow-hidden group shadow-2xl">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -z-10 group-hover:bg-emerald-600/10 transition-all"></div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">ÖNE ÇIKANLAR</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-[500px]">
                            <StatCarousel items={mixedItems} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
