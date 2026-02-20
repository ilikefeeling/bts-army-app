"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Loader2, RefreshCw } from "lucide-react";

// ... (Existing AdminEventPage code remains same until SoldNumbersList)

// For MVP, simplistic auth check or none (since strictly internal URL)
// Production would require Admin Claims check here.

import { DEFAULT_PRICING, type PricingConfig } from "@/lib/numberLogic";
import { EventConfig } from "@/types";

export default function AdminEventPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [eventData, setEventData] = useState<EventConfig>({
        auth_guide: "",
        auth_answer: "",
        member_entry_min: 1,
        member_entry_max: 7,
        is_active: true
    });
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);

    useEffect(() => {
        async function fetchData() {
            try {
                const docRef = doc(db, "events", "launch_event");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as EventConfig;
                    if (data) {
                        setEventData(data);
                    }
                }

                const priceRef = doc(db, "settings", "pricing");
                const priceSnap = await getDoc(priceRef);
                if (priceSnap.exists()) {
                    setPricing(priceSnap.data() as PricingConfig);
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "events", "launch_event"), eventData);
            await setDoc(doc(db, "settings", "pricing"), pricing);
            alert("Configuration updated successfully!");
        } catch (error) {
            console.error("Error saving", error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-army-dark p-8 text-white">
            <h1 className="text-3xl font-bold mb-8 text-army-gold flex items-center gap-2">
                Admin: Identity Gate & Pricing
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Event Config */}
                <form onSubmit={handleSave} className="space-y-6 bg-army-gray p-8 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-army-purple mb-4">Event Configuration</h2>
                    <div>
                        <label className="block text-sm font-bold mb-2">Auth Guide Text</label>
                        <input
                            className="w-full bg-black/50 border border-white/20 rounded p-3 text-white"
                            value={eventData.auth_guide}
                            onChange={e => setEventData({ ...eventData, auth_guide: e.target.value })}
                            placeholder="e.g. Dokdo is Korean territory"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Auth Answer (Exact Match)</label>
                        <input
                            className="w-full bg-black/50 border border-white/20 rounded p-3 text-white"
                            value={eventData.auth_answer}
                            onChange={e => setEventData({ ...eventData, auth_answer: e.target.value })}
                            placeholder="e.g. 독도는 한국 땅"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Min Members</label>
                            <input
                                type="number"
                                className="w-full bg-black/50 border border-white/20 rounded p-3 text-white"
                                value={eventData.member_entry_min}
                                onChange={e => setEventData({ ...eventData, member_entry_min: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Max Members</label>
                            <input
                                type="number"
                                className="w-full bg-black/50 border border-white/20 rounded p-3 text-white"
                                value={eventData.member_entry_max}
                                onChange={e => setEventData({ ...eventData, member_entry_max: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={eventData.is_active}
                            onChange={e => setEventData({ ...eventData, is_active: e.target.checked })}
                            className="w-5 h-5 accent-army-gold"
                        />
                        <label>Event Active</label>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-bold text-gray-300 mb-3">📣 이벤트 공지 정보</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-400">이벤트 제목</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-sm"
                                    value={eventData.event_title || ""}
                                    onChange={e => setEventData({ ...eventData, event_title: e.target.value })}
                                    placeholder="예: BTS 정규 5집 'ARIRANG' 컴백 기념"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-400">이벤트 날짜</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-sm"
                                    value={eventData.event_date || ""}
                                    onChange={e => setEventData({ ...eventData, event_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-400">이벤트 공지 문구</label>
                                <textarea
                                    className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-sm h-20 resize-none"
                                    value={eventData.event_notice || ""}
                                    onChange={e => setEventData({ ...eventData, event_notice: e.target.value })}
                                    placeholder="랜딩 화면에 표시될 공지 문구"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ARIRANG Quick-fill Preset */}
                    <button
                        type="button"
                        onClick={() => setEventData({
                            auth_guide: "Please type 'ARIRANG' in Korean.",
                            auth_answer: "아리랑",
                            member_entry_min: 1,
                            member_entry_max: 7,
                            is_active: true,
                            event_title: "BTS 5th Album 'ARIRANG' Comeback Special",
                            event_date: "2026-03-21",
                            event_notice: "Celebrating the release of BTS 5th Studio Album 'ARIRANG' on March 21, 2026, and the Gwanghwamun Comeback Concert."
                        })}
                        className="w-full py-2 bg-army-gold/10 border border-army-gold/30 hover:bg-army-gold/20 text-army-gold text-sm font-bold rounded-lg transition-all"
                    >
                        🎤 ARIRANG 이벤트 프리셋 불러오기
                    </button>

                </form>

                {/* Pricing Config */}
                <div className="space-y-6 bg-army-gray p-8 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-army-gold mb-4">Tier Pricing ($ USD)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_PRICING).map((tier) => (
                            <div key={tier} className="bg-black/30 p-4 rounded-lg border border-white/5">
                                <label className="block font-bold text-gray-300 mb-2">{tier}</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-right focus:border-army-gold outline-none"
                                    value={pricing[tier as keyof PricingConfig]}
                                    onChange={e => setPricing({ ...pricing, [tier]: parseFloat(e.target.value) })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full max-w-md mx-auto bg-army-purple hover:bg-purple-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transform transition-transform hover:scale-105"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save All Configurations</>}
                </button>
            </div>

            {/* Sold Numbers List */}
            <SoldNumbersList />
        </div>
    );
}

function SoldNumbersList() {
    const [soldNumbers, setSoldNumbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSold = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "army_numbers"),
                where("status", "==", "sold")
            );
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            list.sort((a: any, b: any) => {
                const dateA = new Date(a.purchasedAt || 0).getTime();
                const dateB = new Date(b.purchasedAt || 0).getTime();
                return dateB - dateA;
            });

            setSoldNumbers(list);
        } catch (e) {
            console.error("Error fetching sold numbers", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSold();
    }, []);

    return (
        <div className="bg-army-gray p-8 rounded-xl border border-white/10 mt-8 mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-army-gold">Issued Army Numbers ({soldNumbers.length})</h2>
                <button
                    onClick={fetchSold}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    title="Refresh List"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-army-gray z-10 shadow-sm">
                        <tr className="text-gray-400 border-b border-white/10 text-sm uppercase tracking-wider">
                            <th className="p-3 font-medium">Number</th>
                            <th className="p-3 font-medium">Owner</th>
                            <th className="p-3 font-medium">Email</th>
                            <th className="p-3 font-medium">Price</th>
                            <th className="p-3 font-medium">Date (GMT)</th>
                        </tr>
                    </thead>
                    <tbody className="text-white divide-y divide-white/5">
                        {loading && soldNumbers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400 animate-pulse">Loading data...</td></tr>
                        ) : soldNumbers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No sold numbers found yet.</td></tr>
                        ) : (
                            soldNumbers.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-3 font-mono font-bold text-army-gold group-hover:text-yellow-300">{item.number}</td>
                                    <td className="p-3 font-medium">{item.owner || "Anonymous"}</td>
                                    <td className="p-3 text-sm text-gray-400 break-all">{item.owner_email || "-"}</td>
                                    <td className="p-3 font-medium text-green-400">${item.price}</td>
                                    <td className="p-3 text-sm text-gray-500 font-mono">
                                        {item.purchasedAt ? new Date(item.purchasedAt).toLocaleString() : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
