"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import IdentityGate from "@/app/components/IdentityGate";
import ArmyNumberSearch from "@/app/components/ArmyNumberSearch";
import PromoBanner from "@/app/components/PromoBanner";
import { FileText } from "lucide-react";
import { Suspense } from "react";

function HomeContent() {
  const [isVerified, setIsVerified] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // If returning from email verification
    const emailVerified = searchParams.get('verified');
    if (emailVerified === 'true') {
      setIsVerified(true);
      // The verified email and number are in query params if we need them to pre-open something
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-army-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-army-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-army-gold/10 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 w-full max-w-4xl">
        {!isVerified ? (
          <div className="flex flex-col items-center w-full">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-army-purple to-army-gold mb-8 tracking-tighter text-center">
              BTS ARMY NUMBER
            </h1>
            <IdentityGate onVerified={() => setIsVerified(true)} />

            <Link
              href="/my-certificates"
              className="mt-6 flex items-center justify-center gap-2 w-full max-w-md py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
            >
              <FileText size={18} />
              내 번호 확인하기 (발급 내역 조회)
            </Link>

            <PromoBanner className="mt-8 max-w-lg w-full" />
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {/* Verified Content - Dashboard */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-white">HQ COMMAND CENTER</h1>
              <div className="flex gap-3">
                <Link
                  href="/my-certificates"
                  className="flex items-center gap-2 bg-army-gold/10 border border-army-gold/40 hover:bg-army-gold/20 px-4 py-2 rounded-lg text-sm text-army-gold font-bold transition-all"
                >
                  <FileText size={15} />
                  내 인증서
                </Link>
                <div className="bg-army-purple/20 border border-army-purple/50 px-4 py-2 rounded-lg text-sm text-army-purple">
                  Status: <span className="font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="bg-army-gray/80 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-xl">
              <h2 className="text-xl text-army-gold mb-6 font-mono">SEARCH YOUR ARMY NUMBER</h2>

              {/* Search Interface */}
              <div className="mt-8">
                <ArmyNumberSearch
                  initialNumber={searchParams.get('number') || undefined}
                  initialVerified={searchParams.get('verified') === 'true'}
                  verifiedEmail={searchParams.get('email') || undefined}
                />
              </div>
            </div>

            {/* Promo Banner */}
            <PromoBanner className="mt-6" />
          </div>
        )}
      </div>

      <footer className="absolute bottom-4 text-center text-gray-600 text-xs z-10">
        © 2026 BTS Army Number. Unofficial Fan Project.
        {" · "}
        <Link href="/my-certificates" className="hover:text-army-gold underline transition-colors">
          내 인증서 조회
        </Link>
        <br />
        &quot;Dokdo is Korean Territory&quot;
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-army-dark flex items-center justify-center font-mono text-army-gold">LOADING HQ...</div>}>
      <HomeContent />
    </Suspense>
  );
}
