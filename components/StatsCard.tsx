'use client';

import { useEffect, useState, ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    delay?: number;
}

export default function StatsCard({ title, value, icon, delay = 0 }: StatsCardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = typeof value === 'number' ? value : 0;

    useEffect(() => {
        if (typeof value !== 'number') {
            return;
        }

        const duration = 2000;
        const steps = 60;
        const stepValue = numericValue / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                currentStep++;
                setDisplayValue(Math.floor(stepValue * currentStep));

                if (currentStep >= steps) {
                    setDisplayValue(numericValue);
                    clearInterval(interval);
                }
            }, stepDuration);
        }, delay);

        return () => clearTimeout(timer);
    }, [numericValue, delay]);

    return (
        <div
            className="relative glass-card p-8 group animate-scale-in hover:bg-white/5 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Accent border left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-discord-hot-blue to-discord-hot-orange" />

            <div className="flex items-center gap-6 pl-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-discord-hot-blue group-hover:scale-105 transition-transform duration-300">
                    {icon}
                </div>

                {/* Content - Left aligned */}
                <div className="text-left">
                    <div className="text-4xl font-bold text-white mb-1 tracking-tight">
                        {typeof value === 'number' ? displayValue.toLocaleString() : value}
                    </div>
                    <div className="text-slate-400 text-sm uppercase tracking-wider font-medium">
                        {title}
                    </div>
                </div>
            </div>
        </div>
    );
}
