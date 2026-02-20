export interface EventConfig {
    auth_guide: string;
    auth_answer: string;
    member_entry_min: number;
    member_entry_max: number;
    is_active?: boolean;
    event_title?: string;      // 이벤트 제목 (예: BTS 5th Album ARIRANG 컴백)
    event_date?: string;       // 이벤트 날짜 (예: 2026-03-21)
    event_notice?: string;     // 이벤트 공지 문구
}

export interface PricingConfig {
    VVIP: number;
    DIAMOND: number;
    GOLD: number;
    STANDARD: number;
}
