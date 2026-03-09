"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, User, ChevronLeft, Building2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Waves } from "@/components/Waves";
import api from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("parent");
    const [academies, setAcademies] = useState<any[]>([]);
    const [selectedAcademy, setSelectedAcademy] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAcademies();
    }, []);

    const fetchAcademies = async () => {
        try {
            const response = await api.get('/academies');
            setAcademies(response.data);
        } catch (err) {
            console.error("Akademiler yüklenemedi", err);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                fullName,
                email,
                password,
                role,
                phone,
                academy: selectedAcademy || undefined
            };

            await api.post('/auth/register', payload);

            // Auto login or redirect to login
            alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
            router.push("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-[#E0E0E0] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <Waves
                lineColor="rgba(79, 70, 229, 0.15)"
                backgroundColor="#050510"
                waveAmpX={30}
                waveAmpY={20}
                tension={0.003}
                xGap={20}
                yGap={20}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Giriş Ekranına Dön
                </button>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Yeni Kayıt</h1>
                        <p className="text-gray-500 text-sm">FUTKIDS dünyasına adım atın</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">AD SOYAD</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 pl-12 pr-4 rounded-2xl text-white focus:outline-none transition-all placeholder:text-gray-700"
                                    placeholder="Adınız Soyadınız"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">E-POSTA</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 pl-12 pr-4 rounded-2xl text-white focus:outline-none transition-all placeholder:text-gray-700"
                                    placeholder="ornek@mail.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">ŞİFRE</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 pl-12 pr-4 rounded-2xl text-white focus:outline-none transition-all placeholder:text-gray-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">TELEFON</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 pl-12 pr-4 rounded-2xl text-white focus:outline-none transition-all placeholder:text-gray-700"
                                    placeholder="05XX XXX XX XX"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">ROL</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 px-4 rounded-2xl text-white focus:outline-none transition-all"
                            >
                                <option value="parent" className="bg-[#0a0a1a]">VELİ</option>
                                <option value="coach" className="bg-[#0a0a1a]">ANTRENÖR</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">AKADEMİ SEÇİNİZ</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <select
                                    value={selectedAcademy}
                                    onChange={(e) => setSelectedAcademy(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 pl-12 pr-4 rounded-2xl text-white focus:outline-none transition-all"
                                >
                                    <option value="" className="bg-[#0a0a1a]">Bir akademiye bağlı değilseniz boş bırakın</option>
                                    {academies.map((aca) => (
                                        <option key={aca._id} value={aca._id} className="bg-[#0a0a1a]">
                                            {aca.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="md:col-span-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] group mt-4 overflow-hidden relative"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    KAYIT OL VE BAŞLA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-gray-600 text-xs font-medium">
                        ZATEN ÜYE MİSİNİZ? <br />
                        <button onClick={() => router.push("/login")} className="text-indigo-400 hover:underline font-black mt-2 inline-block">GİRİŞ YAP</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
