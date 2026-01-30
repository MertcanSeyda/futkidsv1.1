"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import api from "@/lib/api";

export default function CardPage() {
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        fetchStudent(parsedUser._id);
    }, []);

    const fetchStudent = async (parentId: string) => {
        try {
            const response = await api.get(`/students?parent=${parentId}`);
            if (response.data.length > 0) {
                setStudent(response.data[0]);
            }
        } catch (error) {
            console.error("Öğrenci yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
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

    if (!student) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center">
                <p className="text-white">Oyuncu bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Dashboard'a Dön</span>
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Oyuncu Kartı</h1>
                    <p className="text-gray-500">FIFA Ultimate Team Tarzı Kart</p>
                </div>

                <PlayerCard
                    fullName={student.fullName}
                    position={student.position}
                    rating={calculateRating(student.stats)}
                    stats={student.stats}
                    academy={student.academy?.name}
                    photoUrl={student.photoUrl}
                />

                <div className="mt-8 text-center">
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all">
                        Kartı Paylaş
                    </button>
                </div>
            </div>
        </div>
    );
}
