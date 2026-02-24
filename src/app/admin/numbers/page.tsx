"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPrice, Tier } from "@/lib/numberLogic";
import {
    Search,
    Download,
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    User,
    Hash,
    Crown,
    TrendingUp,
    Users,
    CreditCard,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ArmyNumber {
    id: string;
    number: string;
    owner: string;
    owner_email: string;
    phone: string;
    tier: string;
    purchasedAt: string;
    issueDate: string;
}

export default function AdminNumbersPage() {
    const [numbers, setNumbers] = useState<ArmyNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        vvip: 0,
        diamond: 0,
        regular: 0,
        revenue: 0
    });

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            // Simplified query to avoid index requirement
            const q = query(
                collection(db, "army_numbers"),
                where("status", "==", "sold"),
                limit(1000)
            );
            const querySnapshot = await getDocs(q);
            const data: ArmyNumber[] = [];
            let vvip = 0, diamond = 0, regular = 0;
            let estRevenue = 0;

            querySnapshot.forEach((doc) => {
                const item = { id: doc.id, ...doc.data() } as ArmyNumber;
                data.push(item);

                if (item.tier === 'VVIP') vvip++;
                else if (item.tier === 'DIAMOND') diamond++;
                else regular++;

                estRevenue += getPrice(item.tier as Tier);
            });

            // Sort client-side by purchasedAt (if exists) or ID
            data.sort((a, b) => (b.purchasedAt || b.id).localeCompare(a.purchasedAt || a.id));

            setNumbers(data);
            setStats({
                total: data.length,
                vvip,
                diamond,
                regular,
                revenue: estRevenue
            });
        } catch (err: any) {
            console.error("Error fetching admin data:", err);
            setError(`DB Access Error: ${err.message || 'Check connection'}. If you just created this project, an index might be pending.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string, num: string) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete record #${num}? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "army_numbers", id));
            setNumbers(prev => prev.filter(n => n.id !== id));
            alert("Deleted successfully.");
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed. Check permissions.");
        }
    };

    const filteredNumbers = numbers.filter(item =>
        (item.number || "").includes(searchTerm) ||
        (item.owner_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.owner || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ["ARMY Number", "Owner", "Email", "Phone", "Tier", "Issue Date"];
        const rows = numbers.map(n => [
            n.number,
            n.owner,
            n.owner_email,
            n.phone,
            n.tier,
            n.issueDate
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bts_army_numbers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-army-dark flex flex-col items-center justify-center font-mono">
                <Loader2 className="w-12 h-12 text-army-gold animate-spin mb-4" />
                <p className="text-army-gold text-lg tracking-widest animate-pulse">ACCESSING BTS HQ DATABASE...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-army-dark text-white p-4 md:p-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/" className="text-army-purple hover:underline text-sm flex items-center gap-1 mb-2">
                            <ChevronLeft size={14} /> Back to Site
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                            <Crown className="text-army-gold" size={36} />
                            ARMY HQ <span className="text-army-gold">CENTRAL</span>
                        </h1>
                        <p className="text-gray-400 mt-1 uppercase text-xs tracking-[0.2em]">Management Console v2.1</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 bg-army-gold text-black border border-white/10 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-lg shadow-yellow-900/20"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="max-w-7xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                {[
                    { label: "Total Recruits", value: stats.total, icon: Users, color: "text-blue-400" },
                    { label: "VVIP Elites", value: stats.vvip, icon: Crown, color: "text-purple-400" },
                    { label: "Diamond Rank", value: stats.diamond, icon: TrendingUp, color: "text-cyan-400" },
                    { label: "Revenue (Est.)", value: `$${stats.revenue.toLocaleString()}`, icon: CreditCard, color: "text-army-gold" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-5"
                    >
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table Section */}
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Table Filters */}
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Number, Name or Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-army-gold focus:ring-1 focus:ring-army-gold transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Filter size={16} />
                            <span>Showing {filteredNumbers.length} results</span>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                    <th className="py-4 px-6 border-b border-white/5 text-army-gold"><Hash size={14} className="inline mr-1" /> Number</th>
                                    <th className="py-4 px-6 border-b border-white/5"><User size={14} className="inline mr-1" /> Owner</th>
                                    <th className="py-4 px-6 border-b border-white/5"><Mail size={14} className="inline mr-1" /> Contact Info</th>
                                    <th className="py-4 px-6 border-b border-white/5">Tier</th>
                                    <th className="py-4 px-6 border-b border-white/5">Joined At</th>
                                    <th className="py-4 px-6 border-b border-white/5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredNumbers.map((user, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={user.id}
                                            className="group hover:bg-white/5 border-b border-white/5 transition-all"
                                        >
                                            <td className="py-5 px-6 font-mono font-bold text-lg tracking-wider group-hover:text-army-gold transition-colors">
                                                {user.number?.slice(0, 4)}-{user.number?.slice(4, 8)}
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="font-bold">{user.owner}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Verified Identity</div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Mail size={12} className="text-gray-500" /> {user.owner_email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <Phone size={11} className="text-gray-600" /> {user.phone}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${user.tier === 'VVIP' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                    user.tier === 'DIAMOND' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                        'bg-white/5 text-gray-400 border border-white/10'
                                                    }`}>
                                                    {user.tier}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-sm text-gray-500">
                                                {user.issueDate}
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(user.id, user.number)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredNumbers.length === 0 && (
                        <div className="py-20 text-center text-gray-500 italic">
                            <p>No matching recruits found in the central database.</p>
                            <p className="text-xs mt-2 not-italic">Tip: Check if Firestore rules permit listing documents.</p>
                        </div>
                    )}

                    <div className="p-6 bg-white/5 flex items-center justify-between border-t border-white/10">
                        <p className="text-xs text-gray-500">Showing {filteredNumbers.length} of {numbers.length} total certificates</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto mt-12 mb-8 text-center text-gray-600">
                <p className="text-xs uppercase tracking-[0.3em]">
                    Confidential · Private Access Only · BTS ARMY HQ Central Database
                </p>
            </footer>
        </div>
    );
}
