"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Target, Shield, Activity } from "lucide-react";

interface PremiumStatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    iconType: "speed" | "shoot" | "pass" | "def" | "phys";
    color: string;
}

export default function PremiumStatCard({ title, value, subtitle, iconType, color }: PremiumStatCardProps) {
    const getIcon = () => {
        switch (iconType) {
            case "speed": return <Zap className="w-6 h-6" />;
            case "shoot": return <Target className="w-6 h-6" />;
            case "pass": return <TrendingUp className="w-6 h-6" />;
            case "def": return <Shield className="w-6 h-6" />;
            case "phys": return <Activity className="w-6 h-6" />;
            default: return <Zap className="w-6 h-6" />;
        }
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative w-[280px] h-[350px] rounded-[30px] p-6 overflow-hidden group border border-white/10"
            style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)`,
                backdropFilter: "blur(20px)"
            }}
        >
            {/* Background Glow */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: color }}
            ></div>

            <div className="relative z-10 h-full flex flex-col">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    style={{ backgroundColor: `${color}20`, color: color }}
                >
                    {getIcon()}
                </div>

                <div className="mt-auto">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">{subtitle}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-6xl font-black text-white tracking-tighter">{value}</span>
                        {typeof value === 'number' && <span className="text-xl font-bold text-gray-500">/ 99</span>}
                    </div>

                    <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                        style={{ backgroundImage: `linear-gradient(to right, white, ${color})` }}
                    >
                        {title}
                    </h2>
                </div>

                <div className="mt-6 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "70%" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                        ></motion.div>
                    </div>
                </div>
            </div>

            {/* Glass effect shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </motion.div>
    );
}
