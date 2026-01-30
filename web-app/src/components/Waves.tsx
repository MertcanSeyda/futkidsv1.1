"use client";

import { useEffect, useRef } from 'react';

interface WavesProps {
    lineColor?: string;
    backgroundColor?: string;
    waveSpeedX?: number;
    waveSpeedY?: number;
    waveAmpX?: number;
    waveAmpY?: number;
    friction?: number;
    tension?: number;
    maxCursorMove?: number;
    xGap?: number;
    yGap?: number;
}

export const Waves = ({
    lineColor = "rgba(255, 255, 255, 0.3)",
    backgroundColor = "transparent",
    waveSpeedX = 0.0125,
    waveSpeedY = 0.005,
    waveAmpX = 30,
    waveAmpY = 15,
    friction = 0.9,
    tension = 0.01,
    maxCursorMove = 100,
    xGap = 15,
    yGap = 15,
}: WavesProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const points: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = [];
        for (let x = 0; x < width + xGap; x += xGap) {
            for (let y = 0; y < height + yGap; y += yGap) {
                points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
            }
        }

        const animate = (time: number) => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;

            points.forEach((p) => {
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxCursorMove) {
                    const force = (maxCursorMove - dist) / maxCursorMove;
                    p.vx -= dx * force * tension;
                    p.vy -= dy * force * tension;
                }

                p.vx += (p.ox - p.x) * tension;
                p.vy += (p.oy - p.y) * tension;

                p.vx *= friction;
                p.vy *= friction;

                p.x += p.vx + Math.sin(time * waveSpeedX + p.oy) * waveAmpX * 0.1;
                p.y += p.vy + Math.cos(time * waveSpeedY + p.ox) * waveAmpY * 0.1;
            });

            // Draw lines
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                if (i % (Math.floor(height / yGap) + 1) !== 0) {
                    ctx.beginPath();
                    ctx.moveTo(points[i - 1].x, points[i - 1].y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate(0);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [lineColor, backgroundColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove, xGap, yGap]);

    return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};
