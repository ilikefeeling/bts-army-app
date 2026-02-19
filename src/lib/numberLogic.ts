export type Tier = 'BLACK' | 'VVIP' | 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD';

export interface PricingConfig {
    BLACK: number;
    VVIP: number;
    DIAMOND: number;
    GOLD: number;
    SILVER: number;
    STANDARD: number;
}

export const DEFAULT_PRICING: PricingConfig = {
    BLACK: 0, // Auction / Contact
    VVIP: 1000,
    DIAMOND: 500,
    GOLD: 100,
    SILVER: 30,
    STANDARD: 0
};

export function classifyNumber(num: string): Tier {
    if (!/^\d{8}$/.test(num)) return 'STANDARD';

    // 1. BLACK TIER (Unique, Auction)
    // - 77777777 (The Ultimate 7)
    // - Debut Date exact: 130613xx (Maybe?) - Let's stick to strict logic for now
    if (num === "77777777") return 'BLACK';
    if (num.includes("130613")) return 'BLACK'; // BTS Debut Date contained

    // 2. VVIP TIER ($1,000)
    // - Solid: All digits same (11111111)
    if (/^(\d)\1{7}$/.test(num)) return 'VVIP';
    // - Sequential (Asc/Desc): 12345678, 87654321
    if ("0123456789".includes(num) || "9876543210".includes(num)) return 'VVIP';
    // - Millions: 10000000, 20000000...
    if (/^[1-9]0000000$/.test(num)) return 'VVIP';

    // 3. DIAMOND TIER ($500)
    // - Palindrome: 12344321
    const isPalindrome = num === num.split('').reverse().join('');
    if (isPalindrome) return 'DIAMOND';
    // - Significant Dates (Year + Date): 20130613 (Full Debut), Member Birthdays?
    // Regex for Year (19xx/20xx) + Month (01-12) + Day (01-31)
    if (/^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(num)) return 'DIAMOND';
    // - Rotator/Mirrored: 10011001 (ABBAABBA pattern)
    if (/^(\d)(\d)\2\1\1\2\2\1$/.test(num)) return 'DIAMOND';

    // 4. GOLD TIER ($100)
    // - Repeating Pairs: 12121212
    if (/^(\d{2})\1{3}$/.test(num)) return 'GOLD';
    // - Repeating Quads: 12341234
    if (/^(\d{4})\1$/.test(num)) return 'GOLD';
    // - 0000 Start/End: 0000xxxx or xxxx0000 or xxxx7777
    if (num.startsWith("0000") || num.endsWith("0000") || num.endsWith("7777")) return 'GOLD';

    // 5. SILVER TIER ($30)
    // - Birthday Format: YYMMDD + any 2 digits (e.g., 951013xx)
    if (/^\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{2}$/.test(num)) return 'SILVER';
    // - Triple End: xxxxx777, xxxxx000
    if (/(\d)\1{2}$/.test(num)) return 'SILVER';
    // - AA-BB-CC-DD Pattern
    if (/^(\d)\1(\d)\2(\d)\3(\d)\4$/.test(num)) return 'SILVER';

    return 'STANDARD';
}

export function getPrice(tier: Tier, config: PricingConfig = DEFAULT_PRICING): number {
    return config[tier] ?? DEFAULT_PRICING[tier];
}
