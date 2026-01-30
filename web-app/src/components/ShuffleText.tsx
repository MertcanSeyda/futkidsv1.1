"use client";

import { useEffect, useRef } from "react";

interface ShuffleTextProps {
    text: string;
    className?: string;
    speed?: number;
}

export function ShuffleText({ text, className = "", speed = 50 }: ShuffleTextProps) {
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const chars = "!<>-_\\/[]{}—=+*^?#________";
        let interval: NodeJS.Timeout;

        const shuffle = () => {
            let iteration = 0;

            clearInterval(interval);

            interval = setInterval(() => {
                element.innerText = text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                if (iteration >= text.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, speed);
        };

        // Initial shuffle
        shuffle();

        // Shuffle on hover
        element.addEventListener("mouseenter", shuffle);

        return () => {
            clearInterval(interval);
            element.removeEventListener("mouseenter", shuffle);
        };
    }, [text, speed]);

    return <span ref={elementRef} className={className}>{text}</span>;
}
