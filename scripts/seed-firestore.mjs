// Seed script: run with `node seed-firestore.mjs` (requires service account key)
// OR: use the admin panel on the deployed app directly after deployment

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyChQ31VZtgTwhsk4_QEBKRt3Y25ugzcEMw",
    authDomain: "bts-army-a9935.firebaseapp.com",
    projectId: "bts-army-a9935",
    storageBucket: "bts-army-a9935.firebasestorage.app",
    messagingSenderId: "907376520978",
    appId: "1:907376520978:web:1caf6e6b01069fe9a74dcb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const eventData = {
    auth_guide: "Please type 'ARIRANG' in Korean.",
    auth_answer: "아리랑",
    member_entry_min: 1,
    member_entry_max: 7,
    is_active: true,
    event_title: "BTS 5th Album 'ARIRANG' Comeback Special",
    event_date: "2026-03-21",
    event_notice: "Celebrating the release of BTS 5th Studio Album 'ARIRANG' on March 21, 2026, and the Gwanghwamun Comeback Concert.",
};

await setDoc(doc(db, "events", "launch_event"), eventData);
console.log("✅ events/launch_event seeded");

const pricingData = {
    tiers: {
        STANDARD: 0,
        SILVER: 9.99,
        GOLD: 24.99,
        BLACK: 49.99,
        DIAMOND: 99.99,
        VVIP: 199.99,
    }
};

await setDoc(doc(db, "pricing", "current"), pricingData);
console.log("✅ pricing/current seeded");
