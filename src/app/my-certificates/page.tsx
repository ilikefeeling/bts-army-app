"use client";

import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Certificate from "@/app/components/Certificate";
import { Search, Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ArmyNumberDoc {
    number: string;
    tier: string;
    ownerNameKo: string;
    ownerNameEn: string;
    phone: string;
    email: string;
    address: string;
    issueDate: string;
}

export default function MyCertificatesPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [certificates, setCertificates] = useState<ArmyNumberDoc[]>([]);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes("@")) {
            setError("올바른 이메일 주소를 입력해주세요.");
            return;
        }
        setLoading(true);
        setError("");
        setSearched(false);
        setCertificates([]);

        try {
            const q = query(
                collection(db, "army_numbers"),
                where("owner_email", "==", email.trim().toLowerCase()),
                where("status", "==", "sold")
            );
            const snap = await getDocs(q);
            const results: ArmyNumberDoc[] = snap.docs.map(d => d.data() as ArmyNumberDoc);
            setCertificates(results);
        } catch (err) {
            console.error(err);
            setError("조회 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    return (
        <div className="min-h-screen bg-army-dark text-white px-4 py-12 flex flex-col items-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-army-purple/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-army-gold/5 blur-[120px] rounded-full" />
            </div>

            <div className="z-10 w-full max-w-2xl">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
                >
                    <ArrowLeft size={16} />
                    메인으로 돌아가기
                </Link>

                {/* Title */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-army-purple to-army-gold mb-3">
                        내 인증서 조회
                    </h1>
                    <p className="text-gray-400 text-sm">
                        발급 시 사용한 이메일 주소로 인증서를 조회하세요.
                    </p>
                </div>

                {/* Email Search Form */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-xl"
                >
                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Mail size={15} /> 이메일 주소
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-army-gold focus:ring-1 focus:ring-army-gold focus:outline-none text-white placeholder-gray-600 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-army-gold text-black font-black rounded-xl hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            조회
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                </form>

                {/* Results */}
                {searched && !loading && (
                    <div>
                        {certificates.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <p className="text-2xl mb-2">📭</p>
                                <p className="font-medium">해당 이메일로 발급된 인증서가 없습니다.</p>
                                <p className="text-sm mt-1">이메일 주소를 확인하거나, 발급 내역이 없는 경우입니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <p className="text-center text-gray-400 text-sm">
                                    총 <span className="text-white font-bold">{certificates.length}</span>개의 인증서가 조회되었습니다.
                                </p>
                                {certificates.map((cert) => (
                                    <Certificate
                                        key={cert.number}
                                        number={cert.number}
                                        tier={cert.tier || "STANDARD"}
                                        issueDate={cert.issueDate}
                                        registrant={{
                                            ownerNameKo: cert.ownerNameKo,
                                            ownerNameEn: cert.ownerNameEn,
                                            phone: cert.phone,
                                            email: cert.email,
                                            address: cert.address,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
