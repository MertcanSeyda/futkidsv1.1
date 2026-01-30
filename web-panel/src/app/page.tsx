"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCircle,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Moon,
  Sun,
  Plus,
  Edit,
  Trash2,
  Activity,
  ClipboardList,
  Sparkles,
  ChevronRight,
  Video,
} from "lucide-react";
import api from "@/lib/api";

type View = "dashboard" | "academies" | "players" | "coaches" | "parents" | "matches" | "payments" | "attendance" | "analysis";

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [academies, setAcademies] = useState([]);
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [parents, setParents] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auth Check
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Initial Data Fetch based on Role
    if (parsedUser.role === 'admin') {
      fetchAcademies();
    } else if (parsedUser.role === 'owner' || parsedUser.role === 'coach') {
      // Owner/Coach: Fetch only their academy (or all but select theirs)
      // Ideally backend should filter, but for now fetch all and filter
      fetchAcademies().then(() => {
        // We need to wait for academies to load to select, but fetchAcademies logic sets state.
        // We can rely on a separate effect or finding it here if logic allows.
        // For simplicity, let's rely on the fetch logic.
        if (parsedUser.academy) {
          // Fetch specific academy details if feasible, or let the list populate and we select it in another effect
          // Or better: call a "getMyAcademy" endpoint if it existed.
          // We will set selectedAcademy ID manually for now.
        }
      });
    } else if (parsedUser.role === 'parent') {
      setCurrentView('players'); // Parents start at players view
    }
  }, []);

  // Effect to select academy for non-admins once academies are loaded
  useEffect(() => {
    if (user && user.role !== 'admin' && academies.length > 0) {
      if (user.academy) {
        const myAcademy = academies.find((a: any) => a._id === user.academy || a._id === user.academy._id);
        if (myAcademy) setSelectedAcademy(myAcademy);
      }
    }
  }, [academies, user]);
  const [showAcademyForm, setShowAcademyForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showCoachForm, setShowCoachForm] = useState(false);
  const [showParentForm, setShowParentForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Düzenleme modu için
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null); // İstatistik paneli için
  const [academyDetails, setAcademyDetails] = useState<any>(null); // Akademi detay modalı için
  const [academyForm, setAcademyForm] = useState({
    name: "",
    address: "",
    logoUrl: "",
    owner: "", // Sahip seçimi
  });
  const [playerForm, setPlayerForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "player" as any,
    academy: "",
    phone: "",
    playerProfile: {
      position: "",
      rating: 0,
      parent: "",
      stats: {
        pace: 0,
        shooting: 0,
        passing: 0,
        dribbling: 0,
        defending: 0,
        physical: 0
      }
    },
  });

  useEffect(() => {
    fetchAcademies(); // Sadece mount anında bir kez çek
  }, []);

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentView === "academies") {
      fetchAcademies();
      fetchOwners();
    } else if (currentView === "players") {
      fetchPlayers(selectedAcademy?._id);
      fetchAcademies();
      fetchParents();
    } else if (currentView === "coaches") {
      fetchCoaches(selectedAcademy?._id);
      fetchAcademies();
    } else if (currentView === "parents") {
      fetchParents(selectedAcademy?._id);
      fetchAcademies();
    } else if (currentView === "dashboard") {
      // Dashboard için de verileri tazele
      fetchAcademies(); // Akademi sayılarını güncelle
      fetchPlayers(selectedAcademy?._id);
      fetchCoaches(selectedAcademy?._id);
      fetchParents(selectedAcademy?._id);
    }
  }, [currentView, selectedAcademy]); // selectedAcademy değişince de tetiklensin!

  const fetchOwners = async () => {
    try {
      const response = await api.get('/users?role=owner');
      setOwners(response.data);
    } catch (error) {
      console.error('Sahipler yüklenemedi:', error);
    }
  };

  const fetchAcademies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/academies');
      console.log('📊 Akademiler backend\'den geldi:', response.data);
      setAcademies(response.data);
    } catch (error) {
      console.error('Akademiler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcademySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...academyForm };
      if (!dataToSend.owner || dataToSend.owner === "") {
        delete (dataToSend as any).owner;
      }

      await api.post('/academies', dataToSend);
      setAcademyForm({ name: "", address: "", logoUrl: "", owner: "" });
      setShowAcademyForm(false);
      fetchAcademies();
    } catch (error: any) {
      console.error('Akademi eklenemedi:', error);
      alert(error.response?.data?.message || 'Akademi eklenirken hata oluştu!');
    }
  };

  const handleDeleteAcademy = async (id: string) => {
    if (!confirm('Bu akademiyi silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/academies/${id}`);
      fetchAcademies();
    } catch (error) {
      console.error('Akademi silinemedi:', error);
      alert('Akademi silinirken hata oluştu!');
    }
  };

  const fetchCoaches = async (academyId?: string) => {
    setLoading(true);
    try {
      console.log('Fetching coaches for academy:', academyId);
      const url = academyId ? `/users?role=coach&academy=${academyId}` : '/users?role=coach';
      const response = await api.get(url);
      setCoaches(response.data);
    } catch (error) {
      console.error('Antrenörler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async (academyId?: string) => {
    setLoading(true);
    try {
      const url = academyId ? `/users?role=parent&academy=${academyId}` : '/users?role=parent';
      const response = await api.get(url);
      setParents(response.data);
    } catch (error) {
      console.error('Veliler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  /* --- PLAYERS (STUDENTS) LOGIC --- */

  const fetchPlayers = async (academyId?: string) => {
    setLoading(true);
    try {
      // Use new students endpoint
      const timestamp = new Date().getTime();
      let url = '/students?';
      if (academyId) url += `academy=${academyId}&`;
      url += `_t=${timestamp}`;

      const response = await api.get(url);
      setPlayers(response.data);
    } catch (error) {
      console.error('Oyuncular yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddPlayerModal = () => {
    setEditingId(null);
    setPlayerForm({
      role: 'player', // UI state için
      fullName: "", email: "", password: "", academy: selectedAcademy?._id || "",
      // @ts-ignore
      position: "", // Student specific
      // @ts-ignore
      rating: 0,
      playerProfile: { position: "", rating: 0, parent: "", stats: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 } }
    } as any);
    setShowPlayerForm(true);
  };

  const openAddCoachModal = () => {
    setEditingId(null);
    setPlayerForm({
      role: 'coach',
      fullName: "",
      email: "",
      password: "",
      academy: selectedAcademy?._id || "",
      phone: "",
      playerProfile: { position: "", rating: 0, parent: "", stats: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 } }
    } as any);
    setShowCoachForm(true);
  };

  const openAddParentModal = () => {
    setEditingId(null);
    setPlayerForm({
      role: 'parent',
      fullName: "",
      email: "",
      password: "",
      academy: selectedAcademy?._id || "", // Veliye de akademi ata
      phone: "",
      playerProfile: { position: "", rating: 0, parent: "", stats: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 } }
    } as any);
    setShowParentForm(true);
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (playerForm.role === 'player') {
        // Create/Update STUDENT (No Auth)
        const studentData = {
          fullName: playerForm.fullName,
          academy: playerForm.academy,
          // @ts-ignore
          position: playerForm.playerProfile.position,
          // @ts-ignore
          parent: playerForm.playerProfile.parent,
          stats: playerForm.playerProfile.stats
        };

        if (editingId) {
          await api.put(`/students/${editingId}`, studentData);
        } else {
          await api.post('/students', studentData);
        }
        setShowPlayerForm(false);
        fetchPlayers(selectedAcademy?._id);

      } else {
        // Create/Update USER (Coach/Parent)
        // Clean up unnecessary fields
        const userData = {
          fullName: playerForm.fullName,
          email: playerForm.email,
          password: playerForm.password,
          role: playerForm.role,
          academy: playerForm.academy || undefined, // Don't send empty string
          phone: playerForm.phone
        };

        console.log('Sending user data:', userData); // Debug

        if (editingId) {
          const updateData = { ...userData };
          if (!updateData.password) delete (updateData as any).password;
          await api.put(`/users/${editingId}`, updateData);
        } else {
          const response = await api.post('/users', userData);
          if (response.data.generatedPassword) {
            alert(`Kullanıcı oluşturuldu!\n\nOtomatik Şifre: ${response.data.generatedPassword}\n\nLütfen bu şifreyi kaydedin, tekrar gösterilmeyecektir.`);
          }
        }

        if (playerForm.role === 'coach') {
          setShowCoachForm(false);
          fetchCoaches(selectedAcademy?._id);
          fetchAcademies(); // Sayıları güncelle
        }
        if (playerForm.role === 'parent') {
          setShowParentForm(false);
          fetchParents(selectedAcademy?._id);
          fetchAcademies(); // Sayıları güncelle
        }
      }

      setEditingId(null);
      // Reset form
      setPlayerForm({
        email: "",
        password: "",
        fullName: "",
        role: "player" as any,
        academy: "",
        phone: "",
        playerProfile: {
          position: "",
          rating: 0,
          parent: "",
          stats: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 }
        },
      });

    } catch (error: any) {
      console.error('İşlem başarısız:', error.response?.data || error);
      alert(error.response?.data?.message || 'Bilinmeyen bir hata oluştu!');
    }
  };

  const handleEditUser = (user: any) => {
    setEditingId(user._id);

    // STUDENT Edit Logic
    if (currentView === 'players' || user.stats) {
      setPlayerForm({
        role: 'player',
        fullName: user.fullName,
        email: "", // Students don't have email
        password: "",
        academy: user.academy?._id || user.academy || "",
        phone: "",
        playerProfile: {
          position: user.position || "",
          rating: user.rating || 0,
          parent: user.parent?._id || user.parent || "",
          stats: user.stats || { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 }
        }
      } as any);
      setShowPlayerForm(true);
      return;
    }

    // USER Edit Logic (Coach/Parent)
    setPlayerForm({
      email: user.email,
      password: "",
      fullName: user.fullName,
      role: user.role,
      academy: user.academy?._id || user.academy || "",
      phone: user.phone || "",
      playerProfile: user.playerProfile || {
        position: "", rating: 0, parent: "",
        stats: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 }
      },
    });

    if (user.role === 'coach') setShowCoachForm(true);
    if (user.role === 'parent') setShowParentForm(true);
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

    try {
      if (currentView === 'players') {
        await api.delete(`/students/${id}`);
        fetchPlayers(selectedAcademy?._id);
      } else {
        await api.delete(`/users/${id}`);
        if (currentView === 'coaches') fetchCoaches(selectedAcademy?._id);
        if (currentView === 'parents') fetchParents();
      }
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
      alert('Silme işleminde hata oluştu!');
    }
  };

  const handleEditAcademy = (academy: any) => {
    setEditingId(academy._id);
    setAcademyForm({
      name: academy.name,
      address: academy.address || "",
      logoUrl: academy.logoUrl || "",
      owner: academy.owner || ""
    });
    setShowAcademyForm(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FUTKIDS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Yönetim Paneli</p>
        </div>

        <nav className="p-4 space-y-1">
          {(!user || user.role !== 'parent') && (
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              active={currentView === "dashboard"}
              onClick={() => setCurrentView("dashboard")}
            />
          )}

          {user?.role === 'admin' && (
            <NavItem
              icon={<Building2 className="w-5 h-5" />}
              label="Akademiler"
              active={currentView === "academies"}
              onClick={() => setCurrentView("academies")}
            />
          )}

          <NavItem
            icon={<Users className="w-5 h-5" />}
            label="Oyuncular"
            active={currentView === "players"}
            onClick={() => setCurrentView("players")}
          />

          {(!user || user.role !== 'parent') && (
            <>
              <NavItem
                icon={<GraduationCap className="w-5 h-5" />}
                label="Antrenörler"
                active={currentView === "coaches"}
                onClick={() => setCurrentView("coaches")}
              />
              <NavItem
                icon={<UserCircle className="w-5 h-5" />}
                label="Veliler"
                active={currentView === "parents"}
                onClick={() => setCurrentView("parents")}
              />
            </>
          )}

          <NavItem
            icon={<Activity className="w-5 h-5" />}
            label="Maçlar"
            active={currentView === "matches"}
            onClick={() => setCurrentView("matches")}
          />

          {/* Show Payments and Attendance to everyone for now, logic inside might vary */}
          <NavItem
            icon={<CreditCard className="w-5 h-5" />}
            label="Ödemeler"
            active={currentView === "payments"}
            onClick={() => setCurrentView("payments")}
          />
          <NavItem
            icon={<ClipboardList className="w-5 h-5" />}
            label="Yoklama"
            active={currentView === "attendance"}
            onClick={() => setCurrentView("attendance")}
          />

          {user?.role !== 'parent' && (
            <NavItem
              icon={<Sparkles className="w-5 h-5" />}
              label="AI Analizi"
              active={currentView === "analysis"}
              onClick={() => setCurrentView("analysis")}
            />
          )}

          <NavItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Raporlar"
            onClick={() => { }}
          />
          <NavItem
            icon={<Settings className="w-5 h-5" />}
            label="Ayarlar"
            onClick={() => { }}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                {user?.role === 'admin' ? (
                  <select
                    value={selectedAcademy?._id || ''}
                    onChange={(e) => {
                      const academy = academies.find((a: any) => a._id === e.target.value);
                      setSelectedAcademy(academy);
                    }}
                    className="bg-transparent border-none text-sm font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <option value="" className="dark:bg-gray-800 dark:text-white">Tüm Akademiler</option>
                    {academies.map((a: any) => (
                      <option key={a._id} value={a._id} className="dark:bg-gray-800 dark:text-white">
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedAcademy?.name || 'Akademim'}
                  </span>
                )}
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 cursor-pointer group relative">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName || 'Misafir'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{user?.role || 'User'}</div>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />

                {/* Simple Dropdown for Logout */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block py-1">
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      router.push('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {currentView === "dashboard" && (
            <DashboardView
              selectedAcademy={selectedAcademy}
              players={players}
              coaches={coaches}
            />
          )}{currentView === "academies" && (
            <AcademiesView
              academies={academies}
              loading={loading}
              showForm={showAcademyForm}
              setShowForm={setShowAcademyForm}
              formData={academyForm}
              setFormData={setAcademyForm}
              onSubmit={handleAcademySubmit}
              onDelete={handleDeleteAcademy}
              onEdit={handleEditAcademy}
              owners={owners} // Sahipler listesini gönder
              onAcademyClick={(acc: any) => { setSelectedAcademy(acc); setCurrentView('dashboard'); }}
            />
          )}
          {currentView === "players" && (
            <PlayersView
              players={players}
              academies={academies}
              parents={parents}
              loading={loading}
              showForm={showPlayerForm}
              setShowForm={setShowPlayerForm}
              onAdd={openAddPlayerModal}
              formData={playerForm}
              setFormData={setPlayerForm}
              onSubmit={handlePlayerSubmit}
              onDelete={handleDeletePlayer}
              onEdit={handleEditUser}
              expandedPlayer={expandedPlayer}
              setExpandedPlayer={setExpandedPlayer}
            />
          )}
          {currentView === "coaches" && (
            <CoachesView
              coaches={coaches}
              academies={academies}
              loading={loading}
              showForm={showCoachForm}
              setShowForm={setShowCoachForm}
              onAdd={openAddCoachModal}
              formData={playerForm}
              setFormData={setPlayerForm}
              onSubmit={handlePlayerSubmit}
              onDelete={handleDeletePlayer}
              onEdit={handleEditUser}
            />
          )}
          {currentView === "parents" && (
            <ParentsView
              parents={parents}
              academies={academies}
              loading={loading}
              onDelete={handleDeletePlayer}
              onEdit={handleEditUser}
              showForm={showParentForm}
              setShowForm={setShowParentForm}
              formData={playerForm}
              setFormData={setPlayerForm}
              onSubmit={handlePlayerSubmit}
              onAdd={openAddParentModal}
            />
          )}
          {currentView === "matches" && (
            <PlaceholderView title="Maç Yönetimi" description="Yakında: Maç skorları, fikstür ve performans takibi." icon={<Activity size={48} />} />
          )}
          {currentView === "payments" && (
            <PlaceholderView title="Ödeme Takibi" description="Yakında: Aidat takibi, faturalandırma ve gelir raporları." icon={<CreditCard size={48} />} />
          )}
          {currentView === "attendance" && (
            <PlaceholderView title="Yoklama" description="Yakında: Mobil uygulama entegreli dijital yoklama sistemi." icon={<ClipboardList size={48} />} />
          )}
          {currentView === "analysis" && (
            <PlaceholderView title="AI Video Analiz Merkezi" description="V2.1 Premium: Videoları yükleyerek biyomekanik analizleri başlatın." icon={<Video size={48} />} />
          )}
        </main>
      </div>

      {/* Academy Detail Modal */}
      {academyDetails && (
        <AcademyDetailModal
          academy={academyDetails}
          onClose={() => setAcademyDetails(null)}
          players={players.filter((p: any) => p.academy?._id === academyDetails._id || p.academy === academyDetails._id)}
          coaches={coaches.filter((c: any) => c.academy?._id === academyDetails._id || c.academy === academyDetails._id)}
        />
      )}
    </div>
  );
}

// Dashboard View
function DashboardView({ selectedAcademy, players, coaches }: any) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedAcademy ? `${selectedAcademy.name} Özet` : 'Genel Bakış'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {selectedAcademy ? 'Akademi bazlı performans verileri' : 'Sistem genelindeki son durum'}
          </p>
        </div>
        {selectedAcademy && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              AKTİF AKADEMİ
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Oyuncu Sayısı"
          value={players.length.toString()}
          change={selectedAcademy ? "Bu Akademi" : "Toplam Kayıtlı"}
          trend="up"
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Antrenör Sayısı"
          value={coaches.length.toString()}
          change={selectedAcademy ? "Bu Akademi" : "Toplam Kayıtlı"}
          trend="up"
          icon={<GraduationCap className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Aktif Maçlar"
          value="3"
          change="Sıradaki 7 gün"
          trend="neutral"
          icon={<Activity className="w-6 h-6 text-orange-600" />}
        />
        <StatCard
          title="Doluluk Oranı"
          value="%82"
          change="Kontenjan"
          trend="up"
          icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            {players.slice(0, 3).map((p: any) => (
              <ActivityItem
                key={p._id}
                time="Yeni"
                title="Sisteme Kaydedildi"
                description={`${p.fullName} - ${p.position || 'Pozisyon Belirsiz'}`}
                type="success"
              />
            ))}
            {players.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Bu akademiye ait henüz bir aktivite yok.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600">Yeni Maç Planla</span>
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600">Yoklama Al</span>
              <ClipboardList className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
// Academies View
function AcademiesView({ academies, loading, showForm, setShowForm, formData, setFormData, onSubmit, onDelete, owners, onAcademyClick, onEdit }: any) {
  return (
    <>
      {/* ... header ... */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Akademiler</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Futbol okullarını yönetin</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Akademi
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : academies.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Henüz akademi yok
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            İlk akademinizi ekleyerek başlayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academies.map((academy: any) => (
            <div
              key={academy._id}
              onClick={() => onAcademyClick(academy)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(academy); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(academy._id); }}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                {academy.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
                {academy.address || 'Adres belirtilmemiş'}
              </p>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Hoca Sayısı</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {academy.coachCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Oyuncu Sayısı</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {academy.playerCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Veli Sayısı</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {academy.parentCount || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Yeni Akademi Ekle
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Akademi Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="FUTKIDS İstanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adres
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Kadıköy, İstanbul"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Players View
function PlayersView({ players, academies, parents, loading, showForm, setShowForm, onAdd, formData, setFormData, onSubmit, onDelete, onEdit, expandedPlayer, setExpandedPlayer }: any) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Oyuncular</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Akademi oyuncularını yönetin (Kartlar üzerine tıklayarak detaylara ulaşabilirsiniz)</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Oyuncu
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz oyuncu yok</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Sisteme ilk oyuncuyu ekleyerek başlayın</p>
        </div>
      ) : (
        <div className="space-y-4">
          {players.map((player: any) => {
            const isExpanded = expandedPlayer === player._id;
            return (
              <div key={player._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all shadow-sm">
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  onClick={() => setExpandedPlayer(isExpanded ? null : player._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl">
                      {player.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{player.fullName}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded uppercase tracking-wider">
                          {player.position || 'POS'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{player.academy?.name || 'Akademi Belirtilmemiş'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-right">
                      <div className="text-xs text-gray-400 uppercase font-black tracking-tighter">GEN</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{player.rating || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(player); }}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(player._id); }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-8 bg-gray-50/50 dark:bg-black/10 border-t border-gray-100 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* FIFA Style Stats */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
                      {Object.entries(player.stats || { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 }).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase text-gray-500 tracking-widest">
                            <span>{key}</span>
                            <span className="text-gray-900 dark:text-white">{value as number}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${parseInt(value as string) > 80 ? 'bg-green-500' : parseInt(value as string) > 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Player Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter italic">
              {formData.fullName ? 'Oyuncuyu Düzenle' : 'Yeni Oyuncu Kaydı'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tam İsim</label>
                    <input
                      type="text" required value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Örn: Lionel Messi"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Akademi</label>
                    <select
                      required value={formData.academy || ""}
                      onChange={(e) => setFormData({ ...formData, academy: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                    >
                      <option value="">Seçiniz</option>
                      {academies.map((acc: any) => <option key={acc._id} value={acc._id}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Pozisyon</label>
                    <input
                      type="text" value={formData.playerProfile.position}
                      onChange={(e) => setFormData({ ...formData, playerProfile: { ...formData.playerProfile, position: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Örn: ST, LW, GK"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Veli</label>
                    <select
                      value={formData.playerProfile.parent || ""}
                      onChange={(e) => setFormData({ ...formData, playerProfile: { ...formData.playerProfile, parent: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                    >
                      <option value="">Veli Seçin (Opsiyonel)</option>
                      {parents?.map((p: any) => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Performans İstatistikleri (0-100)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map((stat) => (
                    <div key={stat}>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{stat}</label>
                      <input
                        type="number" min="0" max="100"
                        value={formData.playerProfile.stats[stat]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          const newStats = { ...formData.playerProfile.stats, [stat]: newValue };

                          // Calculate new overall rating
                          const statValues = Object.values(newStats).map(val => typeof val === 'number' ? val : 0);
                          const sum = statValues.reduce((a, b) => a + b, 0);
                          const newRating = Math.round(sum / 6);

                          setFormData({
                            ...formData,
                            playerProfile: {
                              ...formData.playerProfile,
                              rating: newRating,
                              stats: newStats
                            }
                          });
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                  Sisteme Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Coaches View
function CoachesView({ coaches, academies, loading, showForm, setShowForm, onAdd, formData, setFormData, onSubmit, onDelete, onEdit }: any) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Antrenörler</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Akademi antrenörlerinı yönetin</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Antrenör
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Antrenör</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Akademi</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {coaches.map((coach: any) => (
                <tr key={coach._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold">{coach.fullName.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{coach.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{coach.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{coach.academy?.name || '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => onEdit(coach)} className="text-blue-600 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(coach._id)} className="text-red-600 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Toolkit for Coaches */}

      {/* Coach Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter italic">
              {formData.id ? 'Hocayı Düzenle' : 'Yeni Antrenör Kaydı'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tam İsim</label>
                <input
                  type="text" required value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="Antrenör Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">E-Posta</label>
                <input
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder=" coach@futkids.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Akademi</label>
                <select
                  required value={formData.academy || ""}
                  onChange={(e) => setFormData({ ...formData, academy: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                >
                  <option value="">Akademi Seçiniz</option>
                  {academies.map((acc: any) => <option key={acc._id} value={acc._id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-sm uppercase">Vazgeç</button>
                <button type="submit" className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-green-500/30">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Parents View
function ParentsView({ parents, academies, loading, onDelete, onEdit, showForm, setShowForm, formData, setFormData, onSubmit, onAdd }: any) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Veliler</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sistemdeki velileri yönetin</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Veli
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Veli</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Telefon</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase">Akademi</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {parents.map((parent: any) => (
                <tr key={parent._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">{parent.fullName.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{parent.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{parent.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{parent.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{parent.academy?.name || '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => onEdit(parent)} className="text-blue-600 hover:text-blue-700 p-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(parent._id)} className="text-red-600 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Parent Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter italic">
              {formData.id ? 'Veliyi Düzenle' : 'Yeni Veli Kaydı'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tam İsim</label>
                <input
                  type="text" required value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="Veli Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">E-Posta</label>
                <input
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="parent@futkids.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Telefon</label>
                <input
                  type="text" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="05xx ..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Akademi</label>
                <select
                  required value={formData.academy || ""}
                  onChange={(e) => setFormData({ ...formData, academy: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                >
                  <option value="">Akademi Seçiniz</option>
                  {academies?.map((acc: any) => <option key={acc._id} value={acc._id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-sm uppercase">Vazgeç</button>
                <button type="submit" className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-purple-500/30">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Academy Detail Modal Component
function AcademyDetailModal({ academy, onClose, players, coaches }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">
                {academy.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{academy.city || 'İstanbul'}</span>
                <span>•</span>
                <span>{academy.address}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
          >
            <Plus className="rotate-45 w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Coaches List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Antrenör Kadrosu</h3>
              </div>
              <div className="space-y-3">
                {coaches.map((coach: any) => (
                  <div key={coach._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                      {coach.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{coach.fullName}</div>
                      <div className="text-xs text-gray-500">{coach.email}</div>
                    </div>
                  </div>
                ))}
                {coaches.length === 0 && <p className="text-sm text-gray-400 italic">Antrenör bulunamadı.</p>}
              </div>
            </div>

            {/* Players List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Öne Çıkan Oyuncular</h3>
              </div>
              <div className="space-y-3">
                {players.map((player: any) => (
                  <div key={player._id} className="flex items-center justify-between p-3 bg-gray-100/50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                        {player.rating || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{player.fullName}</div>
                        <div className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md font-black inline-block uppercase">
                          {player.position || 'POS'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Veli</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{player.parent?.fullName || '-'}</div>
                    </div>
                  </div>
                ))}
                {players.length === 0 && <p className="text-sm text-gray-400 italic">Oyuncu bulunamadı.</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50/30 dark:bg-gray-800/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder View
function PlaceholderView({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 animate-pulse">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight italic">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm font-medium">{description}</p>
    </div>
  );
}

// Components
function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${active
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatCard({ title, value, change, trend, icon }: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}) {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <span className={`text-xs font-medium ${trendColor}`}>{change}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    </div>
  );
}

function ActivityItem({ time, title, description, type }: {
  time: string;
  title: string;
  description: string;
  type: "success" | "info" | "neutral";
}) {
  const dotColor = type === "success" ? "bg-green-500" : type === "info" ? "bg-blue-500" : "bg-gray-400";

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${dotColor} mt-2`} />
        <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-2" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
