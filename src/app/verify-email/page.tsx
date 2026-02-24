"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState("Verifying your email...");
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [pendingNumber, setPendingNumber] = useState("");
    const router = useRouter();

    useEffect(() => {
        const verify = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');

                if (!email) {
                    // Fallback: ask user for email if not found in same browser session
                    email = window.prompt('Please provide your email for confirmation');
                }

                if (email) {
                    try {
                        await signInWithEmailLink(auth, email, window.location.href);
                        window.localStorage.removeItem('emailForSignIn');

                        // Signal cross-browser tracking that it's verified
                        try {
                            const trackingRef = doc(db, 'email_verifications', email.trim().toLowerCase());
                            await setDoc(trackingRef, { status: 'verified', timestamp: Date.now() }, { merge: true });
                        } catch (e) {
                            console.error("Firestore sync failed, but verification succeeded", e);
                        }

                        setVerifiedEmail(email);
                        setPendingNumber(window.localStorage.getItem('pendingArmyNumber') || "");
                        setStatus('success');
                        setMessage("인증이 완료되었습니다!");
                    } catch (error) {
                        console.error("Verification failed", error);
                        setStatus('error');
                        setMessage("Verification failed. The link may have expired.");
                    }
                }
            } else {
                setStatus('error');
                setMessage("Invalid verification link.");
            }
        };

        verify();
    }, [router]);

    const handleFallbackContinue = () => {
        router.push(`/?verified=true&email=${encodeURIComponent(verifiedEmail)}&number=${pendingNumber}`);
    };

    return (
        <div className="min-h-screen bg-army-dark flex flex-col items-center justify-center p-4">
            <div className="bg-army-gray/80 backdrop-blur-sm border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-army-gold animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-white">{message}</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-black text-white mb-2">Verified!</h2>
                        <p className="text-gray-300 font-bold mb-2">{message}</p>
                        <p className="text-army-gold mb-6 text-sm">현재 창을 닫고, 원래 앱/화면으로 돌아가시면 자동으로 다음 단계가 진행됩니다.</p>

                        <div className="w-full border-t border-white/10 pt-6 mt-2">
                            <p className="text-xs text-gray-500 mb-3">원래 화면으로 돌아갈 수 없거나 진행이 안되시나요?</p>
                            <button
                                onClick={handleFallbackContinue}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm"
                            >
                                여기서 바로 계속하기 <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-army-purple text-white rounded-xl font-bold w-full transition-all hover:bg-purple-600"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
