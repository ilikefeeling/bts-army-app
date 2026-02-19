export interface EventConfig {
    auth_guide: string;
    auth_answer: string;
    member_entry_min: number;
    member_entry_max: number;
    is_active?: boolean;
}

export interface PricingConfig {
    VVIP: number;
    DIAMOND: number;
    GOLD: number;
    STANDARD: number;
}
