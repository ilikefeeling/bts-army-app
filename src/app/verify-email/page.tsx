"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState("Verifying your email...");
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
                        setStatus('success');
                        setMessage("Email verified successfully! Redirecting...");

                        // Redirect to home with verified state
                        const pendingNumber = window.localStorage.getItem('pendingArmyNumber') || "";
                        setTimeout(() => {
                            router.push(`/?verified=true&email=${encodeURIComponent(email)}&number=${pendingNumber}`);
                        }, 2000);
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
                        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Verified!</h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-army-purple text-white rounded-lg font-bold"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
