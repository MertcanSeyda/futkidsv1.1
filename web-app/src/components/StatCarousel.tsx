"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StatCarouselProps {
    items: React.ReactNode[];
}

export default function StatCarousel({ items }: StatCarouselProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        if (items.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <div className="relative w-full h-[550px] flex items-center justify-center overflow-hidden py-10">
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                    const position = (index - currentIndex + items.length) % items.length;

                    // Show current, next, and previous
                    if (position > 1 && position < items.length - 1) return null;

                    let x = 0;
                    let z = 0;
                    let rotateY = 0;
                    let opacity = 0;
                    let scale = 0.8;
                    let zIndex = 0;

                    if (position === 0) {
                        x = 0;
                        z = 200;
                        opacity = 1;
                        scale = 1.1;
                        zIndex = 50;
                    } else if (position === 1) {
                        x = 350;
                        z = 0;
                        rotateY = -45;
                        opacity = 0.4;
                        zIndex = 20;
                    } else if (position === items.length - 1) {
                        x = -350;
                        z = 0;
                        rotateY = 45;
                        opacity = 0.4;
                        zIndex = 20;
                    }

                    return (
                        <motion.div
                            key={index}
                            initial={{ x: 500, opacity: 0, scale: 0.5 }}
                            animate={{
                                x,
                                z,
                                rotateY,
                                opacity,
                                scale,
                                zIndex,
                                pointerEvents: position === 0 ? "auto" : "none",
                            }}
                            exit={{ x: -500, opacity: 0, scale: 0.5 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                            className="absolute"
                            style={{
                                perspective: 1200,
                                transformStyle: "preserve-3d"
                            }}
                        >
                            {item}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 flex gap-3">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-10 bg-indigo-500" : "w-3 bg-white/10 hover:bg-white/20"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
