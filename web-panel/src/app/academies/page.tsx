"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    Moon,
    Sun
} from "lucide-react";
import api from "@/lib/api";

export default function AcademiesPage() {
    const router = useRouter();
    const [academies, setAcademies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        logoUrl: "",
    });

    useEffect(() => {
        fetchAcademies();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const fetchAcademies = async () => {
        try {
            const response = await api.get('/academies');
            setAcademies(response.data);
        } catch (error) {
            console.error('Akademiler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/academies', formData);
            setFormData({ name: "", address: "", logoUrl: "" });
            setShowForm(false);
            fetchAcademies();
        } catch (error) {
            console.error('Akademi eklenemedi:', error);
            alert('Akademi eklenirken hata oluştu!');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu akademiyi silmek istediğinizden emin misiniz?')) return;

        try {
            await api.delete(`/academies/${id}`);
            fetchAcademies();
        } catch (error) {
            console.error('Akademi silinemedi:', error);
            alert('Akademi silinirken hata oluştu!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Akademiler</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Futbol okullarını yönetin</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Yeni Akademi
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {academies.map((academy: any) => (
                            <div
                                key={academy._id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(academy._id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {academy.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {academy.address || 'Adres belirtilmemiş'}
                                </p>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Sahibi</span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {academy.owner?.fullName || 'Belirtilmemiş'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {academies.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Henüz akademi yok
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            İlk akademinizi ekleyerek başlayın
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Yeni Akademi Ekle
                        </button>
                    </div>
                )}
            </main>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Yeni Akademi Ekle
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="https://example.com/logo.png"
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
        </div>
    );
}
