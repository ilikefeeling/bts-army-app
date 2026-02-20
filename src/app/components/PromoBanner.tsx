"use client";

import { ExternalLink, Sparkles } from "lucide-react";

interface PromoBannerProps {
    className?: string;
}

export default function PromoBanner({ className = "" }: PromoBannerProps) {
    return (
        <a
            href="https://www.bts-army.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`group block w-full ${className}`}
            aria-label="Visit BTS ARMY Service"
        >
            <div className="
                relative overflow-hidden rounded-2xl
                bg-gradient-to-r from-[#5B2D91] via-[#7B3FC4] to-[#A855F7]
                border border-purple-400/30
                p-px
                shadow-[0_0_30px_rgba(168,85,247,0.25)]
                group-hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]
                transition-all duration-500
                group-hover:scale-[1.015]
            ">
                {/* Inner Content */}
                <div className="
                    relative rounded-2xl overflow-hidden
                    bg-gradient-to-r from-[#3D1B6E]/90 via-[#5B2D91]/80 to-[#7B3FC4]/90
                    backdrop-blur-sm
                    px-6 py-5 md:px-10 md:py-6
                    flex flex-col sm:flex-row items-center justify-between gap-5
                ">
                    {/* Animated Background Orbs */}
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                    <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-army-gold/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

                    {/* Text Content */}
                    <div className="relative z-10 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <Sparkles size={14} className="text-army-gold animate-pulse" />
                            <span className="text-xs font-bold tracking-[0.2em] text-purple-300 uppercase">
                                Official BTS ARMY Platform
                            </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                            나의 BTS ARMY 번호를 발급 받고 이용하세요
                        </h3>
                    </div>

                    {/* CTA Button */}
                    <div className="relative z-10 shrink-0">
                        <div className="
                            flex items-center gap-2
                            px-5 py-3 md:px-6 md:py-3.5
                            bg-white text-purple-900
                            font-black text-sm md:text-base
                            rounded-xl
                            shadow-lg shadow-black/30
                            group-hover:bg-army-gold
                            group-hover:text-black
                            transition-all duration-300
                            whitespace-nowrap
                        ">
                            Go to BTS ARMY Service
                            <ExternalLink size={16} className="shrink-0" />
                        </div>
                        <p className="text-[10px] text-purple-300/60 text-center mt-1.5">
                            www.bts-army.app
                        </p>
                    </div>
                </div>
            </div>
        </a>
    );
}
