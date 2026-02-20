"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Phone, Mail, ArrowRight, Edit2 } from "lucide-react";

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
    onComplete: (data: RegistrationData) => void;
}

export default function RegistrationForm({ number, tier, payerEmail = "", payerName = "", onComplete }: RegistrationFormProps) {
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [formData, setFormData] = useState<RegistrationData>({
        ownerName: payerName,
        phone: "",
        email: payerEmail,
    });
    const [errors, setErrors] = useState<Partial<RegistrationData>>({});

    const handleChange = (field: keyof RegistrationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<RegistrationData> = {};
        if (!formData.ownerName.trim()) newErrors.ownerName = "Please enter your name.";
        if (!formData.phone.trim()) newErrors.phone = "Please enter your phone number.";
        if (!formData.email.trim() || !formData.email.includes("@")) newErrors.email = "Please enter a valid email address.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitToReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setStep('review');
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

    return (
        <AnimatePresence mode="wait">
            {step === 'input' ? (
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
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <Phone size={11} /> Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => handleChange("phone", e.target.value)}
                                placeholder="e.g. +82 10-0000-0000"
                                className={inputClass("phone")}
                            />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-army-gold text-black font-black text-base rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            Review & Confirm <ArrowRight size={18} />
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
