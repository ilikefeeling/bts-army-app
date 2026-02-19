"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Check, X, Crown, Gem, Star, RotateCcw } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { classifyNumber, getPrice, type Tier, type PricingConfig, DEFAULT_PRICING } from "@/lib/numberLogic";
import PaymentModal from "./PaymentModal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ArmyNumberSearch() {
    const { t } = useLanguage();
    // Mock Mode Check
    const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock_key";

    // Segmented Input Logic
    const [digits, setDigits] = useState<string[]>(Array(8).fill(""));
    const inputRefs = useState<Array<HTMLInputElement | null>>([])[0] || [];

    // Sync digits to query for search logic
    const [query, setQuery] = useState("");
    useEffect(() => {
        setQuery(digits.join(""));
    }, [digits]);

    const handleDigitChange = (index: number, value: string) => {
        // Allow only numbers
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value.slice(-1); // Keep only the last character entered
        setDigits(newDigits);

        // Auto-focus next
        if (value && index < 7) {
            inputRefs[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            // Move back if empty and backspace pressed
            inputRefs[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);

        if (pastedData) {
            const newDigits = [...digits];
            for (let i = 0; i < pastedData.length; i++) {
                newDigits[i] = pastedData[i];
            }
            setDigits(newDigits);
            // Focus the last filled box or the next empty one
            const nextFocusIndex = Math.min(pastedData.length, 7);
            inputRefs[nextFocusIndex]?.focus();
        }
    };

    const [loading, setLoading] = useState(false);
    const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING);
    const [result, setResult] = useState<{
        number: string;
        status: 'available' | 'sold';
        tier: Tier;
        price: number;
    } | null>(null);
    const [showPayment, setShowPayment] = useState(false);

    // Issuance Features State
    const [meaningfulInput, setMeaningfulInput] = useState("");
    const [showMeaningfulInput, setShowMeaningfulInput] = useState(false);

    // Fetch pricing on mount
    useEffect(() => {
        async function fetchPricing() {
            if (isMock) return;
            try {
                const docRef = doc(db, "settings", "pricing");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPricingConfig(docSnap.data() as PricingConfig);
                }
            } catch (e) {
                console.error("Failed to fetch pricing", e);
            }
        }
        fetchPricing();
    }, [isMock]);

    // Helper to set digits from string
    const setDigitsFromString = (str: string) => {
        const newDigits = Array(8).fill("");
        for (let i = 0; i < Math.min(str.length, 8); i++) {
            newDigits[i] = str[i];
        }
        setDigits(newDigits);
    };

    // Unified search function
    const checkNumber = async (num: string) => {
        setLoading(true);
        setResult(null);

        // Mock Search Logic
        if (isMock) {
            setTimeout(() => {
                const tier = classifyNumber(num);
                const price = getPrice(tier, pricingConfig);
                const isSold = num === "77777777";

                setResult({
                    number: num,
                    status: isSold ? 'sold' : 'available',
                    tier,
                    price
                });
                setLoading(false);
            }, 800);
            return;
        }

        try {
            const docRef = doc(db, "army_numbers", num);
            const docSnap = await getDoc(docRef);

            const tier = classifyNumber(num);
            const price = getPrice(tier, pricingConfig);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setResult({
                    number: num,
                    status: data.status === 'sold' ? 'sold' : 'available',
                    tier,
                    price
                });
            } else {
                setResult({
                    number: num,
                    status: 'available',
                    tier,
                    price
                });
            }
        } catch (error) {
            console.error("Search failed", error);
            // Fallback for demo
            const tier = classifyNumber(num);
            const price = getPrice(tier, pricingConfig);
            setResult({
                number: num,
                status: 'available',
                tier,
                price
            });
        } finally {
            setLoading(false);
        }
    };

    // Feature: Meaningful Number
    const generateMeaningful = () => {
        if (!meaningfulInput) return;
        let base = meaningfulInput.replace(/\D/g, '').slice(0, 8);
        while (base.length < 8) {
            base += Math.floor(Math.random() * 10).toString();
        }
        setDigitsFromString(base);
        setShowMeaningfulInput(false);
        setMeaningfulInput("");
        checkNumber(base); // Auto trigger search
    };

    // Feature: Sequential Issue (Mock/Simulated)
    const generateSequential = () => {
        const base = "2025" + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setDigitsFromString(base);
        checkNumber(base); // Auto trigger search
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const num = digits.join("");
        if (num.length !== 8) {
            alert(t.search.alert_8_digits);
            return;
        }
        checkNumber(num);
    };

    const TierIcon = ({ tier }: { tier: Tier }) => {
        switch (tier) {
            case 'BLACK': return <Crown className="text-black drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] w-6 h-6" />;
            case 'VVIP': return <Crown className="text-purple-400 w-5 h-5" />;
            case 'DIAMOND': return <Gem className="text-blue-400 w-5 h-5" />;
            case 'GOLD': return <Star className="text-yellow-400 w-5 h-5" />;
            case 'SILVER': return <Star className="text-gray-300 w-5 h-5" />;
            default: return null;
        }
    };

    const handleReset = () => {
        setDigits(Array(8).fill(""));
        setResult(null);
        setMeaningfulInput("");
        setShowMeaningfulInput(false);
        inputRefs[0]?.focus();
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {/* Search Section */}
            <div className="glass-panel p-8 rounded-2xl mb-12 transform transition-all hover:scale-[1.01]">
                <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                    <Search className="text-army-purple" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {t.search.title}
                    </span>
                </h2>

                <form onSubmit={handleSearch} className="flex flex-col items-center gap-6">
                    {/* 8-Box Input */}
                    <div className="flex gap-2 p-4 bg-black/40 rounded-xl border border-white/10 shadow-inner">
                        <div className="flex gap-1">
                            {digits.slice(0, 4).map((digit, idx) => (
                                <input
                                    key={`digit-${idx}`}
                                    ref={(el) => { if (el) inputRefs[idx] = el; }}
                                    id={`digit-${idx}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                                    onPaste={handlePaste}
                                    className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-white/5 border border-white/20 rounded-lg focus:border-army-purple focus:bg-white/10 focus:shadow-[0_0_15px_rgba(157,78,221,0.5)] outline-none transition-all text-white placeholder-white/20"
                                    placeholder="-"
                                />
                            ))}
                        </div>
                        <div className="flex items-center text-gray-500 font-bold text-2xl">-</div>
                        <div className="flex gap-1">
                            {digits.slice(4, 8).map((digit, idx) => (
                                <input
                                    key={`digit-${idx + 4}`}
                                    ref={(el) => { if (el) inputRefs[idx + 4] = el; }}
                                    id={`digit-${idx + 4}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onKeyDown={(e) => handleKeyDown(idx + 4, e)}
                                    onChange={(e) => handleDigitChange(idx + 4, e.target.value)}
                                    onPaste={handlePaste}
                                    className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-white/5 border border-white/20 rounded-lg focus:border-army-purple focus:bg-white/10 focus:shadow-[0_0_15px_rgba(157,78,221,0.5)] outline-none transition-all text-white placeholder-white/20"
                                    placeholder="-"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 w-full max-w-md">
                        <button
                            type="submit"
                            disabled={loading || digits.join("").length !== 8}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-95 ${loading || digits.join("").length !== 8
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                                : "bg-gradient-to-r from-army-purple to-purple-600 hover:from-purple-500 hover:to-army-purple hover:shadow-[0_0_20px_rgba(157,78,221,0.6)] text-white border border-white/10"
                                }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            {t.search.button_search}
                        </button>

                        {(digits.some(d => d !== "") || result) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all active:scale-95 flex items-center justify-center backdrop-blur-md"
                                title="Reset"
                            >
                                <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
                            </button>
                        )}
                    </div>
                </form>

                {/* Quick Issuance Options */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setShowMeaningfulInput(!showMeaningfulInput)}
                        className="px-5 py-3 rounded-lg bg-black/40 border border-white/10 hover:border-army-purple hover:text-army-purple text-gray-400 text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span>📅</span> Meaningful Number
                    </button>
                    <button
                        onClick={generateSequential}
                        className="px-5 py-3 rounded-lg bg-black/40 border border-white/10 hover:border-army-purple hover:text-army-purple text-gray-400 text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span>✨</span> Sequential Issue
                    </button>
                </div>

                {/* Meaningful Number Input */}
                {showMeaningfulInput && (
                    <div className="mt-6 p-4 bg-black/60 border border-white/10 rounded-xl animate-fade-in max-w-sm mx-auto">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={meaningfulInput}
                                onChange={(e) => setMeaningfulInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="e.g. 951013"
                                className="flex-1 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-army-purple outline-none"
                            />
                            <button
                                onClick={generateMeaningful}
                                className="px-4 py-2 bg-army-purple/80 hover:bg-army-purple text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                GO
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Result */}
            {result && (
                <div className="animate-slide-up">
                    <div className={`relative p-8 rounded-2xl border ${result.status === 'sold'
                        ? 'bg-red-900/20 border-red-500/30'
                        : 'glass-panel border-army-gold/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]'
                        }`}>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            {result.status === 'available' ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                    <Check size={12} strokeWidth={3} />
                                    AVAILABLE
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                                    <X size={12} strokeWidth={3} />
                                    SOLD
                                </span>
                            )}
                        </div>

                        {/* Number Display */}
                        <div className="text-center mb-8">
                            <div className="text-sm text-gray-400 font-bold tracking-widest uppercase mb-2">Army Number</div>
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-mono">
                                {result.number.slice(0, 4)}-{result.number.slice(4, 8)}
                            </h2>
                        </div>

                        {/* Tier Badge */}
                        <div className="flex justify-center mb-6">
                            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${result.tier === 'VVIP' ? 'bg-purple-900/30 border-purple-500/50 text-purple-300' :
                                result.tier === 'DIAMOND' ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' :
                                    result.tier === 'BLACK' ? 'bg-black/50 border-gray-600 text-gray-200' :
                                        result.tier === 'GOLD' ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300' :
                                            result.tier === 'SILVER' ? 'bg-gray-800/50 border-gray-400/50 text-gray-300' :
                                                'bg-white/5 border-white/10 text-gray-400'
                                }`}>
                                <TierIcon tier={result.tier} />
                                <span className="font-bold tracking-wider text-sm">{result.tier} TIER</span>
                            </div>
                        </div>

                        {/* Action Area */}
                        {result.status === 'available' ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <div className="text-gray-400 text-sm mb-1">Issuance Fee</div>
                                    <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                                        {result.price === 0 ? "FREE" : `$${result.price.toLocaleString()}`}
                                        {result.price > 0 && <span className="text-sm text-gray-500 font-normal">USD</span>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPayment(true)}
                                    className="w-full max-w-sm py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    CLAIM THIS NUMBER
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-black/40 rounded-xl border border-white/5">
                                <div className="text-gray-400">This number is already owned by another Army.</div>
                                <button
                                    onClick={() => {/* Implement View Profile later */ }}
                                    className="mt-2 text-army-purple hover:text-purple-400 text-sm font-bold underline decoration-2 underline-offset-4"
                                >
                                    View Owner Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && result && (
                <PaymentModal
                    number={result.number}
                    price={result.price}
                    onClose={() => setShowPayment(false)}
                />
            )}
        </div>
    );
}
