import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                discord: {
                    blurple: '#4aa8e7', // Brand Blue
                    'blurple-dark': '#3a8cc4', // Darker Brand Blue
                    green: '#57F287',
                    yellow: '#FEE75C',
                    fuchsia: '#f59b39', // Brand Orange
                    red: '#ED4245',
                    white: '#FFFFFF',
                    black: '#1c1d2d', // Brand Background
                    'dark-gray': '#232438', // Slightly lighter background
                    'medium-gray': '#2a2b42',
                    'light-gray': '#40444B',
                    'very-light-gray': '#99AAB5',
                    'hot-blue': '#00A8FF',
                    'hot-orange': '#FF6B00',
                    'deep-blue': '#2B2D42',
                    'electric-cyan': '#00E5FF',
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in',
                'slide-up': 'slideUp 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
} satisfies Config;
