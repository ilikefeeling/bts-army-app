"use client";

import { useState } from "react";
import IdentityGate from "@/app/components/IdentityGate";
import ArmyNumberSearch from "@/app/components/ArmyNumberSearch";

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="min-h-screen bg-army-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-army-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-army-gold/10 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 w-full max-w-4xl">
        {!isVerified ? (
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-army-purple to-army-gold mb-8 tracking-tighter text-center">
              BTS ARMY NUMBER
            </h1>
            <IdentityGate onVerified={() => setIsVerified(true)} />
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {/* Verified Content - Dashboard Placeholder */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-white">HQ COMMAND CENTER</h1>
              <div className="flex gap-4">
                <div className="bg-army-purple/20 border border-army-purple/50 px-4 py-2 rounded-lg text-sm text-army-purple">
                  Status: <span className="font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="bg-army-gray/80 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-xl">
              <h2 className="text-xl text-army-gold mb-6 font-mono">SEARCH YOUR ARMY NUMBER</h2>

              {/* Search Interface */}
              <div className="mt-8">
                <ArmyNumberSearch />
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="absolute bottom-4 text-center text-gray-600 text-xs z-10">
        © 2026 BTS Army Number. Unofficial Fan Project.
        <br />
        &quot;Dokdo is Korean Territory&quot;
      </footer>
    </div>
  );
}
