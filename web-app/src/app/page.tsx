"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Video, BarChart3, TrendingUp, Zap, Star, Shield, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Waves } from "@/components/Waves";

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050510] text-[#E0E0E0] selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* ReactBits Waves Background */}
      <Waves
        lineColor="rgba(79, 70, 229, 0.2)"
        backgroundColor="#050510"
        waveAmpX={50}
        waveAmpY={30}
        tension={0.005}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050510]/80 backdrop-blur-md py-4 border-b border-indigo-500/10' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">FUTKIDS</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#ozellikler" className="hover:text-indigo-400 transition-colors">Özellikler</a>
            <a href="#analiz" className="hover:text-indigo-400 transition-colors">Yapay Zeka</a>
            <a href="#akademi" className="hover:text-indigo-400 transition-colors">Akademiler</a>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95"
          >
            SİSTEME GİRİŞ
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">V2.1 ŞİMDİ YAYINDA</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
              GELECEĞİN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">YILDIZLARI</span> <br />
              BURADA
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              Yapay zeka asistanı ile performansını gerçek zamanlı analiz et.
              Gelişimini izle, eksiklerini kapat ve profesyonel dünyaya adım at.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/login")}
                className="px-10 py-4 bg-white text-indigo-950 font-black rounded-full flex items-center gap-3 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all group"
              >
                HEMEN KEŞFET <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-4 border-2 border-indigo-500/20 hover:border-indigo-500/40 text-white font-bold rounded-full transition-all">
                DEMO İZLE
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Visual Element - AI Analytics Mockup */}
            <div className="bg-gradient-to-tr from-indigo-600/20 to-emerald-600/20 rounded-[2rem] border border-white/10 p-4 relative">
              <div className="bg-[#050510] rounded-[1.5rem] p-8 aspect-[4/3] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-xs font-mono text-gray-500 tracking-widest uppercase">PERFORMANCE_ENGINE.DLL</div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="h-2 rounded-full bg-indigo-500/20 w-3/4" />
                    <div className="text-5xl font-black text-white">94%</div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pace Accuracy</div>
                    <div className="h-32 bg-indigo-500/10 rounded-xl border border-indigo-500/20 p-4">
                      <div className="w-full h-full flex items-end gap-1">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <div key={i} className="flex-1 bg-indigo-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-4">
                    <StatBox icon={<Zap className="w-4 h-4 text-emerald-400" />} label="HIZ" value="89" />
                    <StatBox icon={<Shield className="w-4 h-4 text-indigo-400" />} label="GÜÇ" value="76" />
                    <StatBox icon={<Trophy className="w-4 h-4 text-yellow-500" />} label="REKOR" value="12.2s" />
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-[100px] -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/20 blur-[100px] -z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="ozellikler" className="max-w-7xl mx-auto px-8 py-32 overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">PROFESYONEL ANALİZ ARAÇLARI</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Sıradan bir uygulamadan fazlası. Geleceğin futbol altyapısı için tasarlandı.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Video className="w-8 h-8 text-indigo-400" />}
            title="AI Video Analizi"
            description="Antrenman görüntülerini yükle, yapay zeka vücut dilini ve tekniğini milimetrik analiz etsin."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-indigo-400" />}
            title="Performans Kartı"
            description="Zamanla değişen istatistiklerini FIFA tarzı dinamik kartlar üzerinden takip et ve geliştir."
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-indigo-400" />}
            title="Gelişim Yolculuğu"
            description="Haftalık raporlarla gelişini gör, koçlarından gelen özel notları takip et."
          />
        </div>
      </section>

      {/* Search / Discover Academies Section */}
      <section id="akademi" className="max-w-7xl mx-auto px-8 py-24 mb-20 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[3rem] border border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight leading-tight">Sana En Yakın <br />Akademiyi Keşfet</h2>
            <p className="text-gray-400 mb-8 text-lg">Futkids sistemiyle entegre çalışan profesyonel futbol okullarına katıl, gelişimini resmiyetle takip ettir.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Şehir veya akademi adı ara..."
                className="flex-1 bg-white/5 border border-white/10 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-gray-600"
              />
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all">ARA</button>
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-indigo-600/20 p-8 rounded-3xl border border-indigo-500/20 text-center">
              <div className="text-4xl font-black text-white mb-2">24</div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Aktif Akademi</div>
            </div>
            <div className="bg-emerald-600/20 p-8 rounded-3xl border border-emerald-500/20 text-center">
              <div className="text-4xl font-black text-white mb-2">1,500+</div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Kayıtlı Oyuncu</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-indigo-500" />
            <span className="text-lg font-black text-white tracking-widest uppercase">FUTKIDS</span>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            © 2026 FUTKIDS PLATFORM. Geleceğin Futbolu İçin Tasarlandı.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-default">
      <div className="w-10 h-10 rounded-xl bg-black/50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <div className="text-xl font-black text-white leading-none">{value}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group"
    >
      <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/10 group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
