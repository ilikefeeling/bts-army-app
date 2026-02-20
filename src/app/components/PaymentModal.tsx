"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { X, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import Certificate from "./Certificate";
import RegistrationForm from "./RegistrationForm";
import { classifyNumber } from "@/lib/numberLogic";

interface PaymentModalProps {
    number: string;
    price: number;
    onClose: () => void;
}

interface RegistrantInfo {
    ownerName: string;
    phone: string;
    email: string;
}

// Modal step types
type ModalStep = 'payment' | 'registration' | 'certificate';

export default function PaymentModal({ number, price, onClose }: PaymentModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState<ModalStep>('payment');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [issueDate, setIssueDate] = useState("");

    // Store payer details from PayPal as prefills for the form
    const [payerEmail, setPayerEmail] = useState("");
    const [payerName, setPayerName] = useState("");

    // Final registrant data
    const [registrant, setRegistrant] = useState<RegistrantInfo | null>(null);

    const tier = classifyNumber(number);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleApprove = async (data: any, actions: any) => {
        setProcessing(true);
        try {
            const details = await actions.order.capture();

            // Security Check: Ensure number wasn't taken during payment
            const msgRef = doc(db, "army_numbers", number);
            const msgSnap = await getDoc(msgRef);
            if (msgSnap.exists() && msgSnap.data().status === 'sold') {
                setError(t.payment.error_claimed_refund);
                setProcessing(false);
                return;
            }

            // Store payer info from PayPal for pre-filling the form
            setPayerEmail(details.payer.email_address || "");
            setPayerName(details.payer.name.given_name || "");

            // Move to registration step
            setStep('registration');
        } catch (err) {
            console.error("Payment failed", err);
            setError(t.payment.error_processing_failed);
        } finally {
            setProcessing(false);
        }
    };

    const handleRegistrationComplete = async (formData: RegistrantInfo) => {
        setProcessing(true);
        try {
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            setIssueDate(date);
            setRegistrant(formData);

            // Save full registrant data to Firestore
            await setDoc(doc(db, "army_numbers", number), {
                number,
                status: 'sold',
                tier,
                owner: formData.ownerName,
                owner_email: formData.email,
                phone: formData.phone,
                purchasedAt: new Date().toISOString(),
                issueDate: date,
            });

            setStep('certificate');
        } catch (err) {
            console.error("Registration save failed", err);
            setError("Failed to save registration. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`bg-army-gray border border-white/10 rounded-2xl w-full relative shadow-2xl overflow-y-auto max-h-[95vh] transition-all ${step === 'certificate' ? 'max-w-lg' : 'max-w-md'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                >
                    <X />
                </button>

                <div className="p-6">
                    {/* Step: Payment */}
                    {step === 'payment' && (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">{t.payment.title}</h3>
                            <p className="text-gray-400 mb-6">
                                {t.payment.item_label}: <span className="text-army-gold font-mono font-bold">{number}</span>
                                <br />
                                {t.payment.price_label}: <span className="text-white font-bold">{price === 0 ? "FREE" : `$${price.toFixed(2)}`}</span>
                            </p>

                            {processing ? (
                                <div className="flex flex-col items-center py-8">
                                    <Loader2 className="w-10 h-10 text-army-gold animate-spin mb-4" />
                                    <p className="text-gray-300">{t.payment.processing}</p>
                                </div>
                            ) : price === 0 ? (
                                /* FREE tier — skip PayPal, go straight to registration */
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4 text-center w-full">
                                        <p className="text-green-400 font-bold text-lg">🎉 Free Issuance</p>
                                        <p className="text-gray-400 text-sm mt-1">No payment required. Proceed to registration.</p>
                                    </div>
                                    <button
                                        onClick={() => setStep('registration')}
                                        className="w-full py-3 bg-army-gold text-black font-black rounded-xl hover:brightness-110 transition-all text-base"
                                    >
                                        CLAIM THIS NUMBER →
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    intent: "CAPTURE",
                                                    purchase_units: [{
                                                        amount: { value: price.toString(), currency_code: "USD" },
                                                        description: `BTS Army Number ${number}`
                                                    }]
                                                });
                                            }}
                                            onApprove={handleApprove}
                                            onError={(err) => setError(t.payment.paypal_error + err)}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            )}
                            {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
                        </>
                    )}

                    {/* Step: Registration Form */}
                    {step === 'registration' && (
                        <>
                            {processing ? (
                                <div className="flex flex-col items-center py-12">
                                    <Loader2 className="w-10 h-10 text-army-gold animate-spin mb-4" />
                                    <p className="text-gray-300">인증서 발급 중...</p>
                                </div>
                            ) : (
                                <RegistrationForm
                                    number={number}
                                    tier={tier}
                                    payerEmail={payerEmail}
                                    payerName={payerName}
                                    onComplete={handleRegistrationComplete}
                                />
                            )}
                            {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
                        </>
                    )}

                    {/* Step: Certificate */}
                    {step === 'certificate' && registrant && (
                        <div className="py-4">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-black text-white mb-1">🎉 발급 완료!</h3>
                                <p className="text-gray-400 text-sm">
                                    이제 <span className="text-army-gold font-mono">{number}</span> 번호의 공식 소유자입니다.
                                </p>
                            </div>
                            <Certificate
                                number={number}
                                tier={tier}
                                issueDate={issueDate}
                                registrant={registrant}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
