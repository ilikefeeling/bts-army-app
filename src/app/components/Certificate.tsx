"use client";

import { useRef } from "react";
import { Download, Printer } from "lucide-react";

interface RegistrantInfo {
    ownerNameKo: string;
    ownerNameEn: string;
    phone: string;
    email: string;
    address: string;
}

interface CertificateProps {
    number: string;
    tier: string;
    issueDate: string;
    registrant: RegistrantInfo;
}

const TIER_COLORS: Record<string, string> = {
    VVIP: "#a855f7",
    DIAMOND: "#60a5fa",
    BLACK: "#6b7280",
    GOLD: "#eab308",
    SILVER: "#9ca3af",
    STANDARD: "#f3f4f6",
};

export default function Certificate({ number, tier, issueDate, registrant }: CertificateProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const tierColor = TIER_COLORS[tier] || TIER_COLORS.STANDARD;

    const handlePrint = () => {
        const printContent = cardRef.current?.innerHTML;
        const originalBody = document.body.innerHTML;
        if (!printContent) return;
        document.body.innerHTML = `<div style="font-family: 'Batang', 'Malgun Gothic', serif; padding: 48px;">${printContent}</div>`;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload();
    };

    const rows = [
        { label: "아미 넘버", value: `${number.slice(0, 4)}-${number.slice(4, 8)}`, highlight: true },
        { label: "등급", value: `${tier} CLASS`, highlight: true },
        { label: "소유자명", value: `${registrant.ownerNameKo} (${registrant.ownerNameEn})`, highlight: false },
        { label: "주소", value: registrant.address, highlight: false },
        { label: "전화번호", value: registrant.phone, highlight: false },
        { label: "이메일", value: registrant.email, highlight: false },
        { label: "발급일", value: issueDate, highlight: false },
    ];

    return (
        <div className="flex flex-col items-center animate-fade-in w-full">
            {/* Certificate Card */}
            <div
                ref={cardRef}
                className="w-full max-w-lg bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200"
            >
                {/* Top Accent Line */}
                <div className="h-2 w-full" style={{ backgroundColor: tierColor }} />

                {/* Header */}
                <div className="text-center px-8 py-6 border-b border-gray-200">
                    <p className="text-xs tracking-[0.3em] text-gray-500 mb-1 uppercase">Official BTS ARMY</p>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        아미 번호 발급 확인증
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Certificate of Army Number Registration</p>
                </div>

                {/* Number Display */}
                <div className="text-center py-6 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">Army Number</p>
                    <div
                        className="text-4xl font-black tracking-[0.2em] font-mono"
                        style={{ color: tierColor }}
                    >
                        {number.slice(0, 4)}-{number.slice(4, 8)}
                    </div>
                    <div
                        className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: tierColor + "22", color: tierColor }}
                    >
                        {tier} CLASS
                    </div>
                </div>

                {/* Info Table */}
                <div className="px-8 py-6">
                    <table className="w-full text-sm">
                        <tbody>
                            {rows.map(({ label, value, highlight }) => (
                                <tr key={label} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3 pr-4 text-gray-500 font-medium whitespace-nowrap align-top w-28">
                                        {label}
                                    </td>
                                    <td
                                        className={`py-3 break-all font-mono ${highlight ? "font-bold" : "text-gray-800"}`}
                                        style={highlight ? { color: tierColor } : {}}
                                    >
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Confirmation Text */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        위와 같이 BTS ARMY 번호가 등록되었음을 확인합니다.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        This certifies that the above Army Number has been officially registered.
                    </p>

                    {/* Issue Date + Seal */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-left">
                            <p className="text-xs text-gray-400">발행일 · Issue Date</p>
                            <p className="text-sm font-bold text-gray-700">{issueDate}</p>
                        </div>
                        {/* Seal */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full opacity-80">
                                <circle cx="40" cy="40" r="36" fill="none" stroke={tierColor} strokeWidth="3" />
                                <circle cx="40" cy="40" r="29" fill="none" stroke={tierColor} strokeWidth="1.5" />
                            </svg>
                            <div className="text-center z-10">
                                <p className="text-[6px] font-bold leading-tight" style={{ color: tierColor }}>BTS</p>
                                <p className="text-[5px] leading-tight text-gray-500">ARMY</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">발급기관</p>
                            <p className="text-sm font-bold text-gray-700">BTS ARMY HQ</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Accent */}
                <div className="h-1 w-full" style={{ backgroundColor: tierColor }} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-5 w-full max-w-lg">
                <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
                >
                    <Printer size={16} />
                    인쇄 / 저장
                </button>
                <button
                    onClick={() => window.location.href = "/my-certificates"}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 text-sm font-bold rounded-xl transition-all"
                    style={{ borderColor: tierColor, color: tierColor }}
                >
                    내 인증서 보기
                </button>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
                이 인증서는 법적 효력이 없습니다. 팬 프로젝트입니다.
            </p>
        </div>
    );
}
