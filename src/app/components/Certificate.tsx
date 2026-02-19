import { useRef } from "react";
import { Download } from "lucide-react";
import Image from "next/image";

interface CertificateProps {
    number: string;
    ownerName: string;
    issueDate: string;
    tier: string;
}

export default function Certificate({ number, ownerName, issueDate, tier }: CertificateProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        // Simple print for MVP, or html2canvas later
        window.print();
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <div
                ref={cardRef}
                className="relative w-full max-w-md aspect-[1.58/1] bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-army-gold flex flex-col items-center justify-between p-6 text-center select-none print:shadow-none print:border-black"
                style={{
                    backgroundImage: "linear-gradient(45deg, #000 0%, #1a1a1a 100%)"
                }}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-army-gold" />
                <div className="absolute bottom-0 right-0 w-full h-1 bg-army-gold" />
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20" />

                {/* Header */}
                <div className="mt-2">
                    <h3 className="text-army-gold text-xs tracking-[0.3em] font-bold uppercase">Official Army Identity</h3>
                    <div className="w-8 h-0.5 bg-army-purple mx-auto mt-2" />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center items-center py-4">
                    <div className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b ${tier === 'VVIP' ? 'from-yellow-200 via-yellow-400 to-yellow-600' : 'from-white via-gray-200 to-gray-400'} drop-shadow-lg tracking-widest font-mono`}>
                        {number}
                    </div>
                    {tier !== 'STANDARD' && (
                        <div className="mt-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[0.6rem] text-army-gold tracking-wider uppercase">
                            {tier} CLASS
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="w-full flex justify-between items-end text-left border-t border-white/10 pt-4 mt-2">
                    <div>
                        <p className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Issued To</p>
                        <p className="text-sm font-bold text-white uppercase">{ownerName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Date of Issue</p>
                        <p className="text-xs font-mono text-white/80">{issueDate}</p>
                    </div>
                </div>

                {/* Watermark/Logo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-5 pointer-events-none">
                    <svg viewBox="0 0 100 100" fill="currentColor" className="text-white">
                        <path d="M50 0L100 20L80 100L50 90L20 100L0 20L50 0Z" />
                    </svg>
                </div>
            </div>

            <p className="text-gray-400 text-xs mt-4 mb-2">
                This is your official Digital Identity Card.
            </p>

            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors border border-white/10"
            >
                <Download size={16} />
                Save Certificate
            </button>
        </div>
    );
}
