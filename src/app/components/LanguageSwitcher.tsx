"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${language === 'en'
                        ? "bg-army-gold text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                        : "bg-black/50 text-gray-400 border border-white/10 hover:text-white"
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${language === 'ko'
                        ? "bg-army-gold text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                        : "bg-black/50 text-gray-400 border border-white/10 hover:text-white"
                    }`}
            >
                KO
            </button>
        </div>
    );
}
