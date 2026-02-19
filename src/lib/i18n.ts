export type Language = 'en' | 'ko';

export const translations = {
    en: {
        intro: {
            title: "Would you like to issue\nan Army Number?",
            button: "YES"
        },
        gate: {
            step1_title: "Identity Check",
            step1_guide: "Please type the following phrase exactly:",
            step1_challenge: "Dokdo is Korean Territory",
            step1_placeholder: "Type here...",
            step1_error: "Incorrect. Please type exactly as shown.",
            step1_button: "CONFIRM",
            step2_title: "Final Verification",
            step2_guide: "Enter your Bias name (Member Name)",
            step2_placeholder: "e.g. Jimin, V, Jungkook...",
            step2_error: "Please enter a valid active member name.",
            step2_button: "ENTER THE GATE"
        },
        search: {
            title: "Search Army Number",
            placeholder: "Search 8-digit number (e.g. 13061300)",
            button_search: "SEARCH",
            status_available: "This number is currently available.",
            status_taken: "This number has already been claimed.",
            label_available: "Available",
            label_sold: "Sold Out",
            button_claim: "CLAIM THIS NUMBER",
            alert_8_digits: "Please enter exactly 8 digits.",
            alert_search_failed: "Search failed. Please try again."
        },
        payment: {
            title: "Secure Payment",
            item_label: "Acquiring Army Number",
            price_label: "Price",
            processing: "Processing transaction...",
            success_title: "Acquisition Successful!",
            success_msg: "You are now the owner of",
            button_close: "Continue to Dashboard",
            error_claimed_refund: "This number was claimed by someone else just now. Payment will be refunded.",
            error_processing_failed: "Payment processing failed. Please contact support.",
            paypal_error: "PayPal Error: "
        }
    },
    ko: {
        intro: {
            title: "번호를\n발급하시겠습니까?",
            button: "네 (YES)"
        },
        gate: {
            step1_title: "신원 확인",
            step1_guide: "다음 문구를 똑같이 입력하세요:",
            step1_challenge: "Dokdo is Korean Territory",
            step1_placeholder: "여기에 입력하세요...",
            step1_error: "틀렸습니다. 문구를 정확히 입력해주세요.",
            step1_button: "확인",
            step2_title: "최종 검증",
            step2_guide: "최애 멤버의 이름을 **한글**로 입력하세요.",
            step2_placeholder: "예: 지민, 태형, 정국...",
            step2_error: "올바른 멤버 이름(한글)을 입력해주세요.",
            step2_button: "입장하기"
        },
        search: {
            title: "아미 넘버 검색",
            placeholder: "8자리 번호 검색 (예: 13061300)",
            button_search: "검색",
            status_available: "현재 발급 가능한 번호입니다.",
            status_taken: "이미 발급된 번호입니다.",
            label_available: "발급 가능",
            label_sold: "발급 완료",
            button_claim: "번호 발급받기",
            alert_8_digits: "정확히 8자리 숫자를 입력해주세요.",
            alert_search_failed: "검색에 실패했습니다. 다시 시도해주세요."
        },
        payment: {
            title: "Army Number 발급 결제",
            item_label: "발급할 번호",
            price_label: "가격",
            processing: "결제 처리 중입니다...",
            success_title: "발급 완료!",
            success_msg: "다음 번호의 소유자가 되셨습니다:",
            button_close: "닫기",
            error_claimed_refund: "방금 다른 사용자가 이 번호를 선점했습니다. 결제는 환불됩니다.",
            error_processing_failed: "결제 처리에 실패했습니다. 고객센터에 문의해주세요.",
            paypal_error: "PayPal 오류: "
        }
    }
};
