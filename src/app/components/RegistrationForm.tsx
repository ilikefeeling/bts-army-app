"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";
import { CheckCircle, User, Phone, Mail, ArrowRight, Edit2, Loader2, AlertCircle, Send } from "lucide-react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface RegistrationData {
    ownerName: string;
    phone: string;
    email: string;
}

interface RegistrationFormProps {
    number: string;
    tier: string;
    payerEmail?: string;
    payerName?: string;
    isVerified?: boolean;
    onComplete: (data: RegistrationData) => void;
}

// Modal step types
type ModalStep = 'verify' | 'input' | 'review';

export default function RegistrationForm({ number, tier, payerEmail = "", payerName = "", isVerified = false, onComplete }: RegistrationFormProps) {
    const [step, setStep] = useState<ModalStep>(isVerified ? 'input' : 'verify');
    const [formData, setFormData] = useState<RegistrationData>({
        ownerName: payerName,
        phone: "",
        email: payerEmail,
    });
    const [errors, setErrors] = useState<Partial<RegistrationData>>({});
    const [globalError, setGlobalError] = useState("");
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        if (step === 'verify' && formData.email && globalError.includes("sent")) {
            const trackingRef = doc(db, 'email_verifications', formData.email.trim().toLowerCase());
            const unsubscribe = onSnapshot(trackingRef, (docSnap) => {
                if (docSnap.exists() && docSnap.data().status === 'verified') {
                    setGlobalError("✅ Verified successfully! Proceeding...");
                    setTimeout(() => {
                        setStep('input');
                        setGlobalError("");
                    }, 1500);
                }
            });
            return () => unsubscribe();
        }
    }, [step, formData.email, globalError]);

    const handleChange = (field: keyof RegistrationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<RegistrationData> = {};
        if (!formData.ownerName.trim()) newErrors.ownerName = "Please enter your name.";
        if (!formData.phone || formData.phone.length < 5) newErrors.phone = "Please enter a valid phone number.";
        if (!formData.email.trim() || !formData.email.includes("@")) newErrors.email = "Please enter a valid email address.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitToReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError("");

        if (!validate()) return;

        setIsValidating(true);
        try {
            // 1. Check Phone uniqueness
            const qPhone = query(
                collection(db, "army_numbers"),
                where("phone", "==", formData.phone.trim()),
                where("status", "==", "sold")
            );
            const snapPhone = await getDocs(qPhone);
            if (!snapPhone.empty) {
                setGlobalError("This phone number is already registered.");
                setIsValidating(false);
                return;
            }

            // 2. Check Email uniqueness
            const qEmail = query(
                collection(db, "army_numbers"),
                where("owner_email", "==", formData.email.trim().toLowerCase()),
                where("status", "==", "sold")
            );
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
                setGlobalError("This email address is already registered.");
                setIsValidating(false);
                return;
            }

            setStep('review');
        } catch (err) {
            console.error("Validation failed", err);
            setGlobalError("Validation failed. Please try again.");
        } finally {
            setIsValidating(false);
        }
    };

    const inputClass = (field: keyof RegistrationData) =>
        `w-full px-4 py-3 bg-black/40 border rounded-xl focus:outline-none text-white placeholder-gray-600 transition-all text-sm ${errors[field] ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-white/10 focus:border-army-gold focus:ring-1 focus:ring-army-gold"
        }`;

    const tierColors: Record<string, string> = {
        VVIP: 'from-purple-400 to-purple-600',
        DIAMOND: 'from-blue-400 to-blue-600',
        BLACK: 'from-gray-300 to-gray-500',
        GOLD: 'from-yellow-400 to-yellow-600',
        SILVER: 'from-gray-300 to-gray-400',
        STANDARD: 'from-white to-gray-300',
    };
    const tierColor = tierColors[tier] || tierColors.STANDARD;

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError("");
        if (!formData.email.trim() || !formData.email.includes("@")) {
            setErrors({ email: "Please enter a valid email address." });
            return;
        }

        setIsValidating(true);
        try {
            // Check for existing registration before sending link (optional but good)
            const qEmail = query(
                collection(db, "army_numbers"),
                where("owner_email", "==", formData.email.trim().toLowerCase()),
                where("status", "==", "sold")
            );
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
                setGlobalError("This email address is already registered.");
                setIsValidating(false);
                return;
            }

            const actionCodeSettings = {
                url: window.location.origin + "/verify-email",
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, formData.email.trim(), actionCodeSettings);

            // Store email locally to complete sign-in on return
            window.localStorage.setItem('emailForSignIn', formData.email.trim());
            window.localStorage.setItem('pendingArmyNumber', number);

            // Create tracking document for cross-browser sync
            try {
                const trackingRef = doc(db, 'email_verifications', formData.email.trim().toLowerCase());
                await setDoc(trackingRef, { status: 'pending', timestamp: Date.now() });
            } catch (e) {
                console.error("Tracking setup failed", e);
            }

            setGlobalError("✅ Verification link sent! Please check your inbox.");
        } catch (err) {
            console.error("Failed to send link", err);
            setGlobalError("Failed to send verification link. Please try again.");
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {step === 'verify' ? (
                <motion.div
                    key="verify"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-army-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-army-purple" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Email Verification</h3>
                        <p className="text-gray-400 text-sm">
                            To ensure authenticity, we need to verify your email address before issuing your ARMY number.
                        </p>
                    </div>

                    <form onSubmit={handleSendLink} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <Mail size={11} /> Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange("email", e.target.value)}
                                placeholder="your@email.com"
                                className={inputClass("email")}
                                disabled={globalError.includes("sent")}
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {globalError && (
                            <div className={`p-3 rounded-xl text-sm mb-4 flex items-start gap-2 ${globalError.includes("sent")
                                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                                : "bg-red-500/10 border border-red-500/30 text-red-400"
                                }`}>
                                {globalError.includes("sent") ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                                <span>{globalError}</span>
                            </div>
                        )}

                        {!globalError.includes("sent") && (
                            <button
                                type="submit"
                                disabled={isValidating}
                                className="w-full py-4 bg-army-gold text-black font-black text-base rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isValidating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Send Verification Link
                            </button>
                        )}

                        {globalError.includes("sent") && (
                            <div className="text-center mt-4">
                                <p className="text-sm font-bold text-army-gold animate-pulse mb-1">
                                    Waiting for verification...
                                </p>
                                <p className="text-xs text-gray-400 italic">
                                    Please check your email and click the verification link.<br />
                                    <span className="text-red-400 font-bold">DO NOT close this window.</span> It will automatically proceed when verified.
                                </p>
                            </div>
                        )}
                    </form>
                </motion.div>
            ) : step === 'input' ? (
                <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="mb-6 text-center">
                        <div className={`inline-block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${tierColor} font-mono tracking-wider mb-1`}>
                            {number.slice(0, 4)}-{number.slice(4, 8)}
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{tier} CLASS</p>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 text-center">Registration Details</h3>
                    <p className="text-gray-400 text-sm text-center mb-6">Please fill in the information to be included on your certificate.</p>

                    <form onSubmit={handleSubmitToReview} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <User size={11} /> Name *
                            </label>
                            <input
                                type="text"
                                value={formData.ownerName}
                                onChange={e => handleChange("ownerName", e.target.value)}
                                placeholder="e.g. John Doe / 홍길동"
                                className={inputClass("ownerName")}
                            />
                            {errors.ownerName && <p className="text-red-400 text-xs mt-1">{errors.ownerName}</p>}
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <Mail size={11} /> Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange("email", e.target.value)}
                                placeholder="your@email.com"
                                className={inputClass("email")}
                                disabled={isVerified}
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <Phone size={11} /> Phone Number *
                            </label>
                            <PhoneInput
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={(value) => handleChange("phone", value || "")}
                                defaultCountry="KR"
                                international
                                className={`w-full bg-black/40 border rounded-xl overflow-hidden focus-within:ring-1 transition-all text-sm phone-input-container ${errors.phone ? "border-red-500 focus-within:ring-red-500" : "border-white/10 focus-within:border-army-gold focus-within:ring-army-gold"
                                    }`}
                            />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        {globalError && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">
                                <AlertCircle size={16} />
                                {globalError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isValidating}
                            className="w-full py-4 bg-army-gold text-black font-black text-base rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {isValidating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    Review & Confirm <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <h3 className="text-xl font-bold text-white mb-1 text-center">Review Registration</h3>
                    <p className="text-gray-400 text-sm text-center mb-6">Your certificate will be issued with the information below. Please confirm.</p>

                    <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <tbody>
                                {[
                                    { label: "Army Number", value: `${number.slice(0, 4)}-${number.slice(4, 8)}` },
                                    { label: "Tier", value: `${tier} CLASS` },
                                    { label: "Name", value: formData.ownerName },
                                    { label: "Email", value: formData.email },
                                    { label: "Phone", value: formData.phone },
                                    { label: "Issue Date", value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                ].map(({ label, value }) => (
                                    <tr key={label} className="border-b border-white/5 last:border-0">
                                        <td className="py-3 px-4 text-gray-500 font-medium w-28 shrink-0">{label}</td>
                                        <td className="py-3 px-4 text-white font-mono break-all">{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('input')}
                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Edit2 size={16} /> Edit
                        </button>
                        <button
                            onClick={() => onComplete(formData)}
                            className="flex-2 w-full py-3 bg-army-purple hover:bg-purple-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50"
                        >
                            <CheckCircle size={16} /> Issue Certificate
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
