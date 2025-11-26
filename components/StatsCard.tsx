'use client';

import { useEffect, useState } from 'react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: string;
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
        <div className="glass-card p-8 text-center group animate-scale-in hover:bg-white/5 transition-all duration-300" style={{ animationDelay: `${delay}ms` }}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
                {icon}
            </div>
            <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                {typeof value === 'number' ? displayValue.toLocaleString() : value}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                {title}
            </div>
        </div>
    );
}
