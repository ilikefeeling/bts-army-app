"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EventConfig } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface IdentityGateProps {
    onVerified: () => void;
}

// Member Data Structure for V2
interface MemberData {
    id: string;
    stageName: string; // Display Name (EN)
    realName: string;  // Answer (Hangul)
}

const MEMBERS_V2: MemberData[] = [
    { id: 'jk', stageName: 'JUNGKOOK', realName: '전정국' },
    { id: 'jimin', stageName: 'JIMIN', realName: '박지민' },
    { id: 'v', stageName: 'V', realName: '김태형' },
    { id: 'suga', stageName: 'SUGA', realName: '민윤기' },
    { id: 'jin', stageName: 'JIN', realName: '김석진' },
    { id: 'rm', stageName: 'RM', realName: '김남준' },
    { id: 'jhope', stageName: 'JHOPE', realName: '정호석' }
];

// Default event - ARIRANG Comeback (v2.0)
const FALLBACK_EVENT: EventConfig = {
    auth_guide: "Please type 'ARIRANG' in Korean.",
    auth_answer: "아리랑",
    member_entry_min: 1,
    member_entry_max: 7,
    is_active: true,
    event_title: "BTS 5th Album 'ARIRANG' Comeback Special",
    event_date: "2026-03-21",
    event_notice: "Celebrating the release of BTS 5th Studio Album 'ARIRANG' on March 21, 2026, and the Gwanghwamun Comeback Concert."
};


export default function IdentityGate({ onVerified }: IdentityGateProps) {
    const { t, language } = useLanguage();

    // 0: Intro, 1: Identity Check, 2: Member Check
    const [step, setStep] = useState(0);
    const [authInput, setAuthInput] = useState("");

    // V2 State: Selected members and their inputs
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [memberInputs, setMemberInputs] = useState<Record<string, string>>({});

    const [error, setError] = useState("");
    // const [loading, setLoading] = useState(false); // Unused for now
    const [eventData, setEventData] = useState<EventConfig>(FALLBACK_EVENT);

    useEffect(() => {
        async function fetchEvent() {
            if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock_key" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                console.log("Using fallback event config (Mock Mode)");
                return;
            }

            try {
                const docRef = doc(db, "events", "launch_event");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEventData(docSnap.data() as EventConfig);
                }
            } catch (e) {
                console.error("Failed to fetch event, using fallback", e);
            }
        }
        fetchEvent();
    }, []);

    const handleAuthSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Dynamic challenge from Firestore (auth_answer)
        const correctAnswer = eventData.auth_answer?.trim() || "아리랑";
        const userInput = authInput.trim();

        const isValid = userInput === correctAnswer ||
            userInput.toLowerCase() === correctAnswer.toLowerCase();

        if (isValid) {
            setStep(2);
            setError("");
        } else {
            setError(language === 'ko' ? "정답이 아닙니다. 다시 입력해주세요." : "Incorrect answer. Please try again.");
        }
    };

    // V2 Logic: Checkbox handler
    const toggleMember = (id: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
            // Optional: Clear input when unchecked? Let's keep it for now in case of accidental uncheck
        } else {
            newSelected.add(id);
        }
        setSelectedMembers(newSelected);
        setError(""); // Clear error on interaction
    };

    // V2 Logic: Input handler
    const handleMemberInput = (id: string, value: string) => {
        setMemberInputs(prev => ({
            ...prev,
            [id]: value
        }));
        setError("");
    };

    const handleMemberSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let correctCount = 0;

        // Validation: Iterate through selected members
        // Requirement: At least 1 member selected AND correctly answered.
        // We only validate the ones that are SELECTED.

        // However, user prompt says "1명의 이름만 한글 입력해도 승인되도록".
        // This likely means: If I select 3 people, do I need to get ALL 3 right? 
        // Or just 1 of them?
        // "1명의 이름만 한글 입력해도 승인되도록 (7명 모두 입력해야 pass 되는 형식 아니라는 것)"
        // Interpreting this as: I must get at least ONE correct answer from my selections to pass.
        // But what if I enter 1 correct and 1 wrong? Usually strictly, all entered must be correct.
        // Let's implement: All SELECTED inputs must be correct (can't verify with wrong info), 
        // AND count of correct inputs >= 1.

        const selectedIds = Array.from(selectedMembers);

        if (selectedIds.length === 0) {
            setError("Please select at least one member.");
            return;
        }

        let allSelectedAreCorrect = true;

        for (const id of selectedIds) {
            const inputVal = memberInputs[id]?.trim() || "";
            const answer = MEMBERS_V2.find(m => m.id === id)?.realName || "";

            if (inputVal !== answer) {
                allSelectedAreCorrect = false;
            } else {
                correctCount++;
            }
        }

        // Logic choice: 
        // If I select V and type "김태형" (Correct) -> Pass
        // If I select V and type "바보" (Wrong) -> Fail
        // If I select V (Correct) and Jin (Wrong) -> Fail (Security best practice: don't allow wrong info)

        if (allSelectedAreCorrect && correctCount >= 1) {
            onVerified();
        } else {
            // General error message. Detailed per-field error could be better but sticking to single error line for now.
            setError(language === 'ko' ? "선택한 멤버의 실명(한글)을 정확히 입력해주세요." : "Please enter the correct Korean real name for the selected member(s).");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-army-purple/20 via-black to-black opacity-50" />

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center space-y-8 relative z-10 w-full max-w-lg"
                    >
                        {/* Event Announcement Banner */}
                        {eventData.event_title && eventData.is_active && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="w-full bg-gradient-to-r from-[#1a0533] via-[#2d0f4f] to-[#1a0533] border border-army-purple/50 rounded-2xl p-5 shadow-[0_0_25px_rgba(157,78,221,0.3)] relative overflow-hidden"
                            >
                                {/* Decorative glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-army-purple/5 via-army-gold/5 to-army-purple/5 animate-pulse pointer-events-none" />

                                <div className="relative z-10">
                                    {/* Event Badge */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">🎤</span>
                                        <span className="text-xs font-black tracking-[0.2em] text-army-gold uppercase">
                                            Special Event
                                        </span>
                                        {eventData.event_date && (
                                            <span className="ml-auto text-xs text-purple-300 font-mono bg-army-purple/20 px-2 py-0.5 rounded-full">
                                                {new Date(eventData.event_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-white font-black text-base md:text-lg leading-snug mb-2">
                                        {eventData.event_title}
                                    </h3>

                                    {/* Notice text */}
                                    {eventData.event_notice && (
                                        <p className="text-purple-200/70 text-xs leading-relaxed">
                                            {eventData.event_notice}
                                        </p>
                                    )}

                                    {/* Divider */}
                                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-green-400 text-xs font-bold">이벤트 진행 중</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <h1 className="text-4xl md:text-6xl font-bold text-center leading-tight whitespace-pre-wrap">
                            {t.intro.title}
                        </h1>
                        <button
                            onClick={() => setStep(1)}
                            className="px-8 py-3 bg-white text-black text-xl font-bold tracking-widest hover:bg-army-gold transition-colors duration-300"
                        >
                            {t.intro.button}
                        </button>
                        <p className="text-sm text-gray-500 mt-4">
                            {language === 'en' ? "Select 'KO' for Korean Mode" : "Select 'EN' for English Mode"}
                        </p>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl relative z-10"
                    >
                        {/* Removed Lock Icon for a friendlier look */}

                        <h2 className="text-xl md:text-2xl font-medium text-center mb-6 text-gray-200">
                            {eventData.auth_guide || t.gate.step1_guide}
                        </h2>

                        {/* Challenge Text Display - dynamic from Firestore */}
                        <div className="mb-8 text-center">
                            <p className="text-2xl md:text-3xl font-bold text-army-gold tracking-wider drop-shadow-lg">
                                "{eventData.auth_answer || t.gate.step1_challenge}"
                            </p>
                        </div>

                        <form onSubmit={handleAuthSubmit} className="space-y-6">
                            <input
                                type="text"
                                value={authInput}
                                onChange={(e) => setAuthInput(e.target.value)}
                                placeholder={t.gate.step1_placeholder}
                                className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-xl focus:border-army-gold focus:ring-1 focus:ring-army-gold focus:outline-none text-center text-lg placeholder-gray-600 transition-all"
                            />
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button
                                type="submit"
                                className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-army-gold transition-colors duration-300 tracking-wide"
                            >
                                {t.gate.step1_button}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md p-8 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl relative z-10"
                    >
                        <h2 className="text-2xl font-bold text-center mb-2">{t.gate.step2_title}</h2>
                        <p className="text-gray-400 text-center mb-6">
                            {language === 'ko'
                                ? "멤버를 선택하고 실명(한글)을 입력하세요."
                                : "Select a member and enter their Real Name (Hangul)."}
                        </p>

                        <form onSubmit={handleMemberSubmit} className="space-y-4">
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {MEMBERS_V2.map((member) => (
                                    <div key={member.id} className="flex flex-col space-y-2 p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id={`cb-${member.id}`}
                                                checked={selectedMembers.has(member.id)}
                                                onChange={() => toggleMember(member.id)}
                                                className="w-5 h-5 rounded border-gray-600 bg-black text-army-gold focus:ring-army-gold"
                                            />
                                            <label htmlFor={`cb-${member.id}`} className="flex-1 cursor-pointer font-bold text-lg tracking-wide">
                                                {member.stageName}
                                            </label>
                                        </div>

                                        <AnimatePresence>
                                            {selectedMembers.has(member.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden pl-8"
                                                >
                                                    <input
                                                        type="text"
                                                        value={memberInputs[member.id] || ""}
                                                        onChange={(e) => handleMemberInput(member.id, e.target.value)}
                                                        placeholder="예: 홍길동"
                                                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded focus:border-army-gold focus:outline-none text-sm text-white"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                            <button
                                type="submit"
                                className="w-full py-4 bg-army-purple text-white font-bold text-lg rounded-xl hover:bg-purple-600 transition-colors duration-300 shadow-lg mt-4"
                            >
                                {t.gate.step2_button}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
