"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ElectricCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "blue" | "lime" | "gold" | "fuchsia";
}

export const ElectricCard = ({ children, className, variant = "blue" }: ElectricCardProps) => {
    const gradients = {
        blue: "conic-gradient(transparent, transparent, transparent, #3b82f6, #06b6d4, transparent)",
        lime: "conic-gradient(transparent, transparent, transparent, #84cc16, #22c55e, transparent)",
        gold: "conic-gradient(transparent, transparent, transparent, #fbbf24, #f59e0b, transparent)",
        fuchsia: "conic-gradient(transparent, transparent, transparent, #d946ef, #a855f7, transparent)",
    };

    return (
        <div className={cn("relative group p-[2px] rounded-xl overflow-hidden bg-slate-900/50", className)}>
            {/* Moving Border */}
            <div
                className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: gradients[variant] }}
            />

            {/* Static Border (Low opacity) */}
            <div
                className="absolute inset-0 border border-white/10 rounded-xl"
            />

            {/* Content */}
            <div className="relative bg-[#020617] rounded-[10px] h-full w-full">
                {children}
            </div>
        </div>
    );
};

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    variant,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    variant?: "blue" | "lime" | "gold" | "fuchsia";
}) => {
    return (
        <ElectricCard
            variant={variant}
            className={cn(
                "row-span-1 border border-white/5",
                className
            )}
        >
            <div className="flex flex-col h-full p-4">
                {header && <div className="mb-2">{header}</div>}
                <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <div className="font-bold text-neutral-200 dark:text-neutral-200 uppercase tracking-tighter text-sm">
                        {title}
                    </div>
                </div>
                <div className="font-normal text-neutral-400 text-xs">
                    {description}
                </div>
            </div>
        </ElectricCard>
    );
};
