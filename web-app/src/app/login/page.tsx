"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Star, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Waves } from "@/components/Waves";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
            if (user.role === 'admin' || user.role === 'owner') {
                // Normally admin goes to panel, but for this demo let's keep them in dashboard
                router.push("/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-[#E0E0E0] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Waves Background */}
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
                className="w-full max-w-md relative z-10"
            >
                {/* Back Link */}
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Ana Sayfaya Dön
                </button>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                            <Star className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Platforma Giriş</h1>
                        <p className="text-gray-500 text-sm">Performans verilerine erişim sağlayın</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-2">E-POSTA ADRESİ</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 focus:bg-black/60 py-4 pl-12 pr-4 rounded-2xl text-white focus:outline-none transition-all placeholder:text-gray-700"
                                    placeholder="ornek@futkids.com"
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

                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded-md border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors font-medium">Beni Hatırla</span>
                            </label>
                            <a href="#" className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors font-bold uppercase tracking-tighter">Şifremi Unuttum?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] group mt-4 overflow-hidden relative"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    PLATFORMA GİR <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-gray-600 text-xs font-medium">
                        HENÜZ BİR AKADEMİYE ÜYE DEĞİL MİSİNİZ? <br />
                        <a href="#" className="text-indigo-400 hover:underline font-black mt-2 inline-block">BİZE ULAŞIN</a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
