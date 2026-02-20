"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Phone, MapPin, Mail, ArrowRight, Edit2 } from "lucide-react";

interface RegistrationData {
    ownerNameKo: string;
    ownerNameEn: string;
    phone: string;
    email: string;
    address: string;
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
        ownerNameKo: "",
        ownerNameEn: payerName,
        phone: "",
        email: payerEmail,
        address: "",
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
        if (!formData.ownerNameKo.trim()) newErrors.ownerNameKo = "한글 이름을 입력해주세요.";
        if (!formData.ownerNameEn.trim()) newErrors.ownerNameEn = "영문 이름을 입력해주세요.";
        if (!formData.phone.trim()) newErrors.phone = "전화번호를 입력해주세요.";
        if (!formData.email.trim() || !formData.email.includes("@")) newErrors.email = "올바른 이메일을 입력해주세요.";
        if (!formData.address.trim()) newErrors.address = "주소를 입력해주세요.";
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

                    <h3 className="text-xl font-bold text-white mb-1 text-center">등록 정보 입력</h3>
                    <p className="text-gray-400 text-sm text-center mb-6">인증서에 포함될 정보를 입력해주세요.</p>

                    <form onSubmit={handleSubmitToReview} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <User size={11} /> 한글 성명 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ownerNameKo}
                                    onChange={e => handleChange("ownerNameKo", e.target.value)}
                                    placeholder="예: 홍길동"
                                    className={inputClass("ownerNameKo")}
                                />
                                {errors.ownerNameKo && <p className="text-red-400 text-xs mt-1">{errors.ownerNameKo}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <User size={11} /> 영문 성명 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ownerNameEn}
                                    onChange={e => handleChange("ownerNameEn", e.target.value)}
                                    placeholder="e.g. HONG GILDONG"
                                    className={inputClass("ownerNameEn")}
                                />
                                {errors.ownerNameEn && <p className="text-red-400 text-xs mt-1">{errors.ownerNameEn}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <Mail size={11} /> 이메일 *
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
                                <Phone size={11} /> 전화번호 *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => handleChange("phone", e.target.value)}
                                placeholder="예: 010-0000-0000"
                                className={inputClass("phone")}
                            />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <MapPin size={11} /> 주소 *
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => handleChange("address", e.target.value)}
                                placeholder="예: 서울특별시 강남구 테헤란로 123"
                                className={inputClass("address")}
                            />
                            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-army-gold text-black font-black text-base rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            내용 확인하기 <ArrowRight size={18} />
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
                    <h3 className="text-xl font-bold text-white mb-1 text-center">등록 내용 확인</h3>
                    <p className="text-gray-400 text-sm text-center mb-6">아래 내용으로 인증서가 발급됩니다. 확인해주세요.</p>

                    <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <tbody>
                                {[
                                    { label: "아미 넘버", value: `${number.slice(0, 4)}-${number.slice(4, 8)}` },
                                    { label: "등급", value: `${tier} CLASS` },
                                    { label: "한글 성명", value: formData.ownerNameKo },
                                    { label: "영문 성명", value: formData.ownerNameEn },
                                    { label: "이메일", value: formData.email },
                                    { label: "전화번호", value: formData.phone },
                                    { label: "주소", value: formData.address },
                                    { label: "발급일", value: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) },
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
                            <Edit2 size={16} /> 수정
                        </button>
                        <button
                            onClick={() => onComplete(formData)}
                            className="flex-2 w-full py-3 bg-army-purple hover:bg-purple-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50"
                        >
                            <CheckCircle size={16} /> 인증서 발급하기
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
