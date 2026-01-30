"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LogOut, Users, Award, MessageSquare, BarChart3, Bell, Settings, Menu, X,
    Plus, Edit, Save, ChevronRight, User, Filter, Search, CreditCard,
    Utensils, Sparkles, Video, TrendingUp, UserPlus, Mail, Phone, DollarSign, Trash2, Presentation
} from "lucide-react";
import api from "@/lib/api";
import PlayerCard from "@/components/PlayerCard";
import TacticsBoard from "@/components/TacticsBoard";
import StatCarousel from "@/components/StatCarousel";
import PremiumStatCard from "@/components/PremiumStatCard";

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
        const values = Object.values(stats) as number[];
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
                    <p className="text-gray-500 mb-8">Akademinizde henüz oyuncu bulunmuyor.</p>
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
            {/* Sidebar - Always Visible */}
            <aside className="fixed top-0 left-0 h-full w-80 bg-[#0a0a1a] border-r border-white/5 z-50 overflow-y-auto">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Award className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">FUTKIDS</span>
                    </div>
                </div>

                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                            {user?.fullName?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base truncate text-white">{user?.fullName}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Antrenör</div>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    <NavItem icon={<Users />} label="Oyuncular" active={activeTab === "players"} onClick={() => setActiveTab("players")} />
                    <NavItem icon={<UserPlus />} label="Veliler" active={activeTab === "parents"} onClick={() => setActiveTab("parents")} />
                    <NavItem icon={<BarChart3 />} label="İstatistikler" active={activeTab === "stats"} onClick={() => setActiveTab("stats")} />
                    <NavItem icon={<MessageSquare />} label="Notlar" active={activeTab === "comments"} onClick={() => setActiveTab("comments")} />
                    <NavItem icon={<Utensils />} label="Beslenme" active={activeTab === "nutrition"} onClick={() => setActiveTab("nutrition")} />
                    <NavItem icon={<Presentation />} label="Taktik Tahtası" active={activeTab === "tactics"} onClick={() => setActiveTab("tactics")} />
                    <NavItem icon={<Video />} label="AI Analiz" active={activeTab === "ai"} onClick={() => setActiveTab("ai")} />
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
            </aside>

            {/* Main */}
            <div className="ml-80 min-h-screen">
                <header className="sticky top-0 z-30 bg-[#050510]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-xl font-bold">Antrenör Paneli</h1>
                            <p className="text-sm text-gray-500 font-medium">{filteredStudents.length} Oyuncu</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2.5 hover:bg-white/5 rounded-xl">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 hover:bg-white/5 rounded-xl">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto">
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
                    {activeTab === "stats" && selectedStudent && (
                        <StatsTab
                            student={selectedStudent}
                            editMode={editMode}
                            setEditMode={setEditMode}
                            editedStats={editedStats}
                            handleStatChange={handleStatChange}
                            handleSaveStats={handleSaveStats}
                            saving={saving}
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
                        <TacticsTab />
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


function PlayersTab({
    students, selectedStudent, setSelectedStudent, calculateAge, calculateRating,
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, categories,
    setShowCardModal, user, onRefresh
}: any) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [parents, setParents] = useState<any[]>([]);
    const [loadingParents, setLoadingParents] = useState(false);

    // New Player Form State
    const [newPlayer, setNewPlayer] = useState({
        id: "", // Add ID for edit mode
        fullName: "",
        position: "ST",
        birthDate: "",
        height: "",
        weight: "",
        teamCategory: "",
        parent: "" // Parent ID
    });

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
            if (!newPlayer.fullName || !newPlayer.birthDate || !newPlayer.position) {
                alert("Lütfen zorunlu alanları doldurun (Ad Soyad, Doğum Tarihi, Pozisyon).");
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
            setNewPlayer({ id: "", fullName: "", position: "ST", birthDate: "", height: "", weight: "", teamCategory: "", parent: "" });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Oyuncu işlemi başarısız:", error);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    const handleDeletePlayer = async (playerId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection
        if (window.confirm("Bu oyuncuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            try {
                await api.delete(`/students/${playerId}`);
                if (onRefresh) onRefresh();

                // If deleted player was selected, deselect
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Oyuncular</h2>
                    <div className="text-sm text-gray-500">{students.length} Oyuncu</div>
                </div>
                <button
                    onClick={() => {
                        fetchParentsForDropdown();
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    Oyuncu Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Oyuncu ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                    <option value="all" className="bg-[#0a0a1a] text-white">Tüm Kategoriler</option>
                    {categories.map((cat: string) => (
                        <option key={cat} value={cat} className="bg-[#0a0a1a] text-white">{cat}</option>
                    ))}
                </select>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student: Student) => (
                    <div
                        key={student._id}
                        className={`p-6 rounded-2xl border transition-all relative group ${selectedStudent?._id === student._id
                            ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                    >
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNewPlayer({
                                        id: student._id,
                                        fullName: student.fullName,
                                        position: student.position,
                                        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : "",
                                        height: student.height?.toString() || "",
                                        weight: student.weight?.toString() || "",
                                        teamCategory: student.teamCategory || "",
                                        parent: student.parent?._id || student.parent || ""
                                    });
                                    fetchParentsForDropdown();
                                    setShowAddModal(true);
                                }}
                                className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg"
                                title="Oyuncuyu Düzenle"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => handleDeletePlayer(student._id, e)}
                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg"
                                title="Oyuncuyu Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start justify-between mb-4 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{student.fullName}</h3>
                                <p className={`text-sm ${selectedStudent?._id === student._id ? "text-indigo-200" : "text-gray-400"}`}>
                                    {student.position} • {student.teamCategory || "N/A"}
                                </p>
                            </div>
                            <div className="text-right mr-8">
                                <div className="text-3xl font-bold">{calculateRating(student.stats)}</div>
                                <div className={`text-xs ${selectedStudent?._id === student._id ? "text-indigo-200" : "text-gray-400"}`}>OVR</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-4 text-sm mb-4 ${selectedStudent?._id === student._id ? "text-indigo-200" : "text-gray-400"}`}>
                            <span>{calculateAge(student.birthDate)} yaş</span>
                            {student.height && <span>{student.height} cm</span>}
                            {student.weight && <span>{student.weight} kg</span>}
                        </div>
                        <button
                            onClick={() => {
                                setSelectedStudent(student);
                                setShowCardModal(true);
                            }}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${selectedStudent?._id === student._id ? "bg-white/20 hover:bg-white/30" : "bg-white/10 hover:bg-white/20"}`}
                        >
                            <CreditCard className="w-4 h-4" />
                            Kartı Gör
                        </button>
                    </div>
                ))}

                {/* Empty State / Add Button */}
                {students.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Gösterilecek oyuncu bulunamadı</p>
                        <button
                            onClick={() => {
                                fetchParentsForDropdown();
                                setShowAddModal(true);
                            }}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold inline-flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Oyuncu Ekle
                        </button>
                    </div>
                )}
            </div>

            {/* Add Player Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-[#0a0a1a] rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">{newPlayer.id ? "Oyuncuyu Düzenle" : "Yeni Oyuncu Ekle"}</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2">Ad Soyad *</label>
                                <input
                                    type="text"
                                    value={newPlayer.fullName}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, fullName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Oyuncu Adı Soyadı"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Doğum Tarihi *</label>
                                <input
                                    type="date"
                                    value={newPlayer.birthDate}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, birthDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Pozisyon *</label>
                                <select
                                    value={newPlayer.position}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="GK" className="bg-[#0a0a1a] text-white">GK (Kaleci)</option>
                                    <option value="CB" className="bg-[#0a0a1a] text-white">CB (Stoper)</option>
                                    <option value="LB" className="bg-[#0a0a1a] text-white">LB (Sol Bek)</option>
                                    <option value="RB" className="bg-[#0a0a1a] text-white">RB (Sağ Bek)</option>
                                    <option value="CM" className="bg-[#0a0a1a] text-white">CM (Orta Saha)</option>
                                    <option value="CDM" className="bg-[#0a0a1a] text-white">CDM (Ön Libero)</option>
                                    <option value="CAM" className="bg-[#0a0a1a] text-white">CAM (Ofansif Orta Saha)</option>
                                    <option value="LW" className="bg-[#0a0a1a] text-white">LW (Sol Kanat)</option>
                                    <option value="RW" className="bg-[#0a0a1a] text-white">RW (Sağ Kanat)</option>
                                    <option value="ST" className="bg-[#0a0a1a] text-white">ST (Forvet)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Kategori</label>
                                <select
                                    value={newPlayer.teamCategory}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, teamCategory: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="" className="bg-[#0a0a1a] text-white">Seçiniz</option>
                                    {categories.map((cat: string) => (
                                        <option key={cat} value={cat} className="bg-[#0a0a1a] text-white">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Veli</label>
                                <select
                                    value={newPlayer.parent}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, parent: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    disabled={loadingParents}
                                >
                                    <option value="" className="bg-[#0a0a1a] text-white">Veli Seçiniz</option>
                                    {parents.map((p: any) => (
                                        <option key={p._id} value={p._id} className="bg-[#0a0a1a] text-white">{p.fullName}</option>
                                    ))}
                                </select>
                                {loadingParents && <span className="text-xs text-indigo-400">Veliler yükleniyor...</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Boy (cm)</label>
                                <input
                                    type="number"
                                    value={newPlayer.height}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="175"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Kilo (kg)</label>
                                <input
                                    type="number"
                                    value={newPlayer.weight}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="70"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAddPlayer}
                                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function StatsTab({ student, editMode, setEditMode, editedStats, handleStatChange, handleSaveStats, saving, calculateRating }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{student.fullName} - İstatistikler</h2>
                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all"
                    >
                        <Edit className="w-4 h-4" />
                        Düzenle
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSaveStats}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-center">
                <div className="text-sm font-semibold text-white/70 uppercase mb-2">Overall Rating</div>
                <div className="text-6xl font-bold text-white">{calculateRating(editedStats)}</div>
                <div className="text-sm text-white/70 mt-2">6 özellik ortalaması</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(editedStats).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-gray-400 uppercase">{key}</span>
                            {editMode ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={value}
                                    onChange={(e) => handleStatChange(key, parseInt(e.target.value) || 0)}
                                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center font-bold"
                                />
                            ) : (
                                <span className="text-2xl font-bold">{value}</span>
                            )}
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                style={{ width: `${value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CommentsTab({ student, newComment, setNewComment, handleAddComment, saving, user }: any) {
    const comments = student.coachComments || [];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{student.fullName} - Notlar</h2>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">Yeni Not Ekle</h3>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Oyuncu hakkında notunuzu yazın..."
                    className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-indigo-500"
                />
                <button
                    onClick={handleAddComment}
                    disabled={saving || !newComment.trim()}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    {saving ? "Ekleniyor..." : "Not Ekle"}
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold">Tüm Notlar ({comments.length})</h3>
                {comments.length === 0 ? (
                    <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">Henüz not bulunmuyor</p>
                    </div>
                ) : (
                    comments.map((comment: any, idx: number) => (
                        <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-white">{comment.coach?.fullName || user.fullName}</span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(comment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{comment.comment}</p>
                                </div>
                            </div>
                        </div>
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
            alert("Beslenme programı oluşturuldu!");
        } catch (error) {
            console.error("Program oluşturulamadı:", error);
            alert("Hata oluştu!");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{student.fullName} - Beslenme Programı</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Program Oluştur
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                    <Utensils className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Henüz beslenme programı oluşturulmamış</p>
                    <p className="text-sm text-gray-600">Oyuncunuz için özel beslenme programı oluşturabilirsiniz</p>
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
                            </div>
                            {plan.notes && (
                                <p className="text-gray-300 mb-4">{plan.notes}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(plan.dailyPlans || {}).map(([day, meals]: [string, any]) => (
                                    <div key={day} className="bg-white/5 rounded-xl p-4">
                                        <h4 className="font-semibold mb-2 capitalize">{day}</h4>
                                        <div className="space-y-1 text-sm text-gray-400">
                                            <p>🌅 Kahvaltı: {meals.breakfast || "-"}</p>
                                            <p>🌞 Öğle: {meals.lunch || "-"}</p>
                                            <p>🌙 Akşam: {meals.dinner || "-"}</p>
                                            <p>🍎 Atıştırmalık: {meals.snacks || "-"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Plan Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0a0a1a] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-6">Yeni Beslenme Programı</h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Program Adı</label>
                                <input
                                    type="text"
                                    value={newPlan.title}
                                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Örn: Ocak Ayı Beslenme Programı"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        value={newPlan.startDate}
                                        onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        value={newPlan.endDate}
                                        onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Notlar</label>
                                <textarea
                                    value={newPlan.notes}
                                    onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-emerald-500"
                                    placeholder="Genel notlar..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {Object.keys(newPlan.dailyPlans).map((day) => (
                                <div key={day} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="font-semibold mb-3 capitalize">{day}</h4>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Kahvaltı"
                                            value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].breakfast}
                                            onChange={(e) => setNewPlan({
                                                ...newPlan,
                                                dailyPlans: {
                                                    ...newPlan.dailyPlans,
                                                    [day]: { ...newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans], breakfast: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Öğle Yemeği"
                                            value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].lunch}
                                            onChange={(e) => setNewPlan({
                                                ...newPlan,
                                                dailyPlans: {
                                                    ...newPlan.dailyPlans,
                                                    [day]: { ...newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans], lunch: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Akşam Yemeği"
                                            value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].dinner}
                                            onChange={(e) => setNewPlan({
                                                ...newPlan,
                                                dailyPlans: {
                                                    ...newPlan.dailyPlans,
                                                    [day]: { ...newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans], dinner: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Atıştırmalıklar"
                                            value={newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans].snacks}
                                            onChange={(e) => setNewPlan({
                                                ...newPlan,
                                                dailyPlans: {
                                                    ...newPlan.dailyPlans,
                                                    [day]: { ...newPlan.dailyPlans[day as keyof typeof newPlan.dailyPlans], snacks: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreatePlan}
                                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-all"
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AITab({ student }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{student.fullName} - AI Performans Analizi</h2>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-8 h-8 text-amber-400" />
                        <h3 className="text-2xl font-bold text-white">AI Video Analizi</h3>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full uppercase">Premium</span>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Yapay zeka destekli video analizi ile oyuncunuzun teknik becerilerini, vücut dilini, pozisyon alma yeteneğini ve gelişim alanlarını detaylı inceleyin.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Video className="w-5 h-5 text-amber-400" />
                                <span className="font-semibold">Video Yükle</span>
                            </div>
                            <p className="text-sm text-gray-400">Maç veya antrenman videosu yükleyin</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                                <span className="font-semibold">Detaylı Rapor</span>
                            </div>
                            <p className="text-sm text-gray-400">AI destekli performans raporu alın</p>
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg">
                        Premium'a Yükselt
                    </button>
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

    // Add Parent Form State
    const [newParent, setNewParent] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "" // Optional
    });

    useEffect(() => {
        if (user && user.academy) {
            fetchParents();
        }
    }, [user]);

    const fetchParents = async () => {
        try {
            const academyId = user.academy._id || user.academy;
            // Fetch all parents belonging to the academy from users endpoint
            const response = await api.get(`/users?role=parent&academy=${academyId}`);
            let fetchedParents = response.data;

            // Map children from the students list to each parent
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
            fetchParents(); // Refresh list
            alert("Veli başarıyla eklendi!");
        } catch (error) {
            console.error("Veli eklenemedi:", error);
            alert("Veli eklenirken bir hata oluştu.");
        }
    };

    const handleDeleteParent = async (parentId: string) => {
        if (window.confirm("Bu veliyi silmek istediğinizden emin misiniz?")) {
            try {
                await api.delete(`/users/${parentId}`);
                fetchParents();
                alert("Veli silindi.");
            } catch (error) {
                console.error("Veli silinemedi:", error);
                alert("Silme işlemi başarısız.");
            }
        }
    };

    const handleSendMessage = async () => {
        if (!selectedParent) return;

        // Placeholder for SMS/Email integration
        alert(`${messageType === 'sms' ? 'SMS' : 'Email'} gönderme özelliği yakında aktif olacak!\n\nAlıcı: ${selectedParent.fullName}\n${messageType === 'email' ? `Konu: ${message.subject}\n` : ''}Mesaj: ${message.body}`);
        setShowMessageModal(false);
        setMessage({ subject: "", body: "" });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Veli Yönetimi</h2>
                    <div className="text-sm text-gray-500">{parents.length} Veli</div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    Veli Ekle
                </button>
            </div>

            {parents.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                    <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Henüz kayıtlı veli bulunmuyor</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        İlk Veliyi Ekle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {parents.map((parent) => (
                        <div key={parent._id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all relative group">
                            <button
                                onClick={() => handleDeleteParent(parent._id)}
                                className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Veliyi Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
                                        {parent.fullName?.charAt(0) || "V"}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{parent.fullName}</h3>
                                        <p className="text-sm text-gray-400">{parent.students?.length || 0} Çocuk</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                {parent.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300">{parent.email}</span>
                                    </div>
                                )}
                                {parent.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300">{parent.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Children List */}
                            {parent.students && parent.students.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Çocukları</div>
                                    <div className="space-y-1">
                                        {parent.students.map((student: any) => (
                                            <div key={student._id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                                                <span className="text-sm">{student.fullName}</span>
                                                <span className="text-xs text-gray-500">{student.position}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedParent(parent);
                                        setMessageType('email');
                                        setShowMessageModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-sm transition-all"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedParent(parent);
                                        setMessageType('sms');
                                        setShowMessageModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-sm transition-all"
                                >
                                    <Phone className="w-4 h-4" />
                                    SMS
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Parent Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-[#0a0a1a] rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Yeni Veli Ekle</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={newParent.fullName}
                                    onChange={(e) => setNewParent({ ...newParent, fullName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Veli Adı Soyadı"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newParent.email}
                                    onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Telefon</label>
                                <input
                                    type="text"
                                    value={newParent.phone}
                                    onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="+90 555 ..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Şifre (İsteğe Bağlı)</label>
                                <input
                                    type="password"
                                    value={newParent.password}
                                    onChange={(e) => setNewParent({ ...newParent, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Boş bırakılırsa otomatik oluşturulur"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAddParent}
                                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && selectedParent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowMessageModal(false)}>
                    <div className="bg-[#0a0a1a] rounded-2xl p-6 max-w-2xl w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-6">
                            {messageType === 'sms' ? 'SMS' : 'Email'} Gönder - {selectedParent.fullName}
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                {messageType === 'email' ? (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        <span>{selectedParent.email}</span>
                                    </>
                                ) : (
                                    <>
                                        <Phone className="w-4 h-4" />
                                        <span>{selectedParent.phone}</span>
                                    </>
                                )}
                            </div>

                            {messageType === 'email' && (
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Konu</label>
                                    <input
                                        type="text"
                                        value={message.subject}
                                        onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Email konusu..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold mb-2">Mesaj</label>
                                <textarea
                                    value={message.body}
                                    onChange={(e) => setMessage({ ...message, body: e.target.value })}
                                    className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-blue-500"
                                    placeholder={messageType === 'sms' ? "SMS mesajınız..." : "Email içeriği..."}
                                />
                                {messageType === 'sms' && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        {message.body.length} / 160 karakter
                                    </div>
                                )}
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-sm text-amber-200">
                                    <strong>Not:</strong> {messageType === 'sms' ? 'SMS' : 'Email'} gönderme özelliği yakında aktif olacak.
                                    Bu bir önizleme ekranıdır.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition-all"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.body.trim() || (messageType === 'email' && !message.subject.trim())}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all disabled:opacity-50"
                            >
                                Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function TacticsTab() {
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
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tactics Board - Takes 2/3 space on large screens */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Presentation className="text-indigo-500" />
                        Taktik Tahtası
                    </h2>
                    <div className="bg-[#0a0a1a] rounded-[40px] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/5 blur-[100px] -z-10"></div>
                        <TacticsBoard />
                    </div>
                </div>

                {/* Sidebar Stats Carousel - Takes 1/3 space */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" />
                        Highlights
                    </h2>
                    <div className="bg-gradient-to-b from-white/5 to-transparent rounded-[40px] border border-white/10 p-0 flex-1 flex items-center justify-center overflow-hidden min-h-[600px]">
                        <StatCarousel items={mixedItems} />
                    </div>
                </div>
            </div>
        </div>
    );
}
