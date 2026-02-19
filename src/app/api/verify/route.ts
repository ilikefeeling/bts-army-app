import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// For Sprint 1 MVP without service account JSON:
// We will use standard SDK but it might fail on server if not authenticated.

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
        }

        let { armyNumber, email } = body;

        // 1. Input Validation & Formatting
        if (!armyNumber || !email) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        // Strip hyphen to match DB key format (00000000)
        const cleanNumber = armyNumber.replace(/-/g, '');

        if (!/^\d{8}$/.test(cleanNumber)) {
            return NextResponse.json({ success: false, error: 'Invalid Format. Expected 8 digits or 0000-0000.' }, { status: 400 });
        }

        // 2. Initial Auth Check (Sprint 1: Public Ownership Check)
        // In later sprints, verifying a signed token or password would be more secure.
        // For now, we verify that the 'email' provided matches the 'owner' in DB.

        try {
            const docRef = doc(db, 'army_numbers', cleanNumber);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Case-insensitive email check
                if (data.owner_email && data.owner_email.toLowerCase() === email.toLowerCase()) {
                    return NextResponse.json({
                        success: true,
                        data: {
                            armyNumber: cleanNumber, // Return normalized ID
                            tier: data.tier,
                            owner: data.owner_email,
                            verifiedAt: new Date().toISOString()
                        }
                    });
                } else {
                    return NextResponse.json({ success: false, error: 'Ownership verification failed.' }, { status: 401 });
                }
            } else {
                return NextResponse.json({ success: false, error: 'Army Number not found or not claimed.' }, { status: 404 });
            }
        } catch (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ success: false, error: 'Database Connection Error' }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
