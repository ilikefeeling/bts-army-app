"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import Certificate from "./Certificate";

interface PaymentModalProps {
    number: string;
    price: number;
    onClose: () => void;
}

// Minimal type definition since @paypal/react-paypal-js types might be complex to fully import without checking node_modules
interface OnApproveData {
    orderID: string;
    payerID: string | null;
}

export default function PaymentModal({ number, price, onClose }: PaymentModalProps) {
    const { t } = useLanguage();
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleApprove = async (data: any, actions: any) => {
        // Casting to any to avoid complex type matching for now, as we just need capture()
        setProcessing(true);
        try {
            const details = await actions.order.capture();
            // Transaction successful
            console.log("Transaction completed by " + details.payer.name.given_name);

            // Security Check: Ensure number wasn't taken during payment process
            const msgRef = doc(db, "army_numbers", number);
            const msgSnap = await getDoc(msgRef); // Use getDoc imported from firestore

            if (msgSnap.exists() && msgSnap.data().status === 'sold') {
                console.error("Number already sold!");
                setError(t.payment.error_claimed_refund);
                return;
            }

            // Save to Firestore
            // 1. Mark number as sold
            await setDoc(doc(db, "army_numbers", number), {
                number: number,
                status: 'sold',
                owner: details.payer.name.given_name,
                owner_email: details.payer.email_address, // Save payer email for external auth
                price: price,
                purchasedAt: new Date().toISOString(),
                transactionId: details.id
            });

            setSuccess(true);
        } catch (err) {
            console.error("Payment failed", err);
            setError(t.payment.error_processing_failed);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-army-gray border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X />
                </button>

                {!success ? (
                    <>
                        <h3 className="text-xl font-bold text-white mb-2">{t.payment.title}</h3>
                        <p className="text-gray-400 mb-6">
                            {t.payment.item_label}: <span className="text-army-gold font-mono font-bold">{number}</span>
                            <br />
                            {t.payment.price_label}: <span className="text-white font-bold">${price.toFixed(2)}</span>
                        </p>

                        {processing ? (
                            <div className="flex flex-col items-center py-8">
                                <Loader2 className="w-10 h-10 text-army-gold animate-spin mb-4" />
                                <p className="text-gray-300">{t.payment.processing}</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <PayPalScriptProvider options={{ clientId: "test", currency: "USD" }}>
                                    <PayPalButtons
                                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                intent: "CAPTURE",
                                                purchase_units: [{
                                                    amount: { value: price.toString(), currency_code: "USD" },
                                                    description: `Army Number ${number}`
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
                ) : (
                    <div className="flex flex-col items-center py-8 text-center animate-fade-in">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">{t.payment.success_title}</h3>
                        <p className="text-gray-400 mb-6">
                            {t.payment.success_msg} <span className="text-army-gold font-mono">{number}</span>.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-army-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            {t.payment.button_close}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
