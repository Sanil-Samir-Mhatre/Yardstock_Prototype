import { LanguageCode } from './yardstockEngine';

export interface Translations {
  navMarketplace: string;
  navSnapList: string;
  navSmartMatch: string;
  navCheckout: string;
  navSecurity: string;
  navMetrics: string;
  ctaSnapSurplus: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  voicePromptHint: string;
  radiusLabel: string;
  searchPlaceholder: string;
  allCategories: string;
  fuzzedLocationNotice: string;
  bookEscrowBtn: string;
  snapHeader: string;
  snapSubheader: string;
  humanLoopNotice: string;
  confirmPublishBtn: string;
  smartMatchHeader: string;
  smartMatchSubheader: string;
  escrowHeader: string;
  escrowSubheader: string;
  securityHeader: string;
  securitySubheader: string;
  metricsHeader: string;
  metricsSubheader: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    navMarketplace: 'Explore',
    navSnapList: 'Snap & Sell',
    navSmartMatch: 'Smart Match',
    navCheckout: 'Escrow & Truck',
    navSecurity: 'Trust & Safety',
    navMetrics: 'Impact & Stats',
    ctaSnapSurplus: 'Sell Surplus',
    heroKicker: 'Mumbai · Navi Mumbai · Thane Local Marketplace',
    heroTitle: 'Sell leftover site materials in 2 seconds. Buy local at up to 45% off.',
    heroSubtitle:
      'No typing needed. Just snap a photo or speak in English, Hindi, or Marathi. AI detects your material, suggests a fair market price, and protects every deal with OTP delivery escrow.',
    step1Title: '1. Snap or Speak',
    step1Desc: 'AI detects material, quantity & fair price from a single photo.',
    step2Title: '2. Match Nearby',
    step2Desc: 'Find verified surplus stock within 2–35 km of your site.',
    step3Title: '3. Safe OTP Escrow',
    step3Desc: 'Money stays safe until the mini-truck delivers & you share the OTP.',
    voicePromptHint: 'Voice Input (English / हिंदी / मराठी)',
    radiusLabel: 'Search Distance',
    searchPlaceholder: 'Search rebar, cement, tiles, AAC blocks, Vashi, Worli...',
    allCategories: 'All Items',
    fuzzedLocationNotice: 'Exact site address stays private (~600m) until Escrow is booked',
    bookEscrowBtn: 'Buy with Escrow & Book Truck',
    snapHeader: 'Snap a Photo to List in 2 Seconds',
    snapSubheader:
      'Take a photo or use your voice. Our Vision AI fills out the material, quantity, and fair price automatically — you just review and tap publish.',
    humanLoopNotice:
      'Quick Check: Please review or edit the AI-suggested quantity and price before posting.',
    confirmPublishBtn: 'Confirm & Publish Listing',
    smartMatchHeader: 'Smart Match for Your Project',
    smartMatchSubheader:
      'Tell us what your site needs and get instant nearby matches ranked by distance, price savings, and seller trust.',
    escrowHeader: 'Safe Escrow Checkout & Mini-Truck Booking',
    escrowSubheader:
      'Your payment is locked safely in escrow and only released to the seller when the mini-truck arrives and you verify the 6-digit delivery OTP.',
    securityHeader: 'Trust, Safety & AI Transparency',
    securitySubheader:
      'See how we block stolen photos, explain every seller trust score in plain English, and hide phone numbers in chat to keep transactions safe.',
    metricsHeader: 'Live Impact & AI Performance',
    metricsSubheader:
      'Real-time waste diverted, CO₂ saved, and AI accuracy across 300 local Mumbai & Navi Mumbai listings.',
  },
  hi: {
    navMarketplace: 'एक्सप्लोर',
    navSnapList: 'फोटो से बेचें',
    navSmartMatch: 'स्मार्ट मैच',
    navCheckout: 'एस्क्रो और ट्रक',
    navSecurity: 'भरोसा और सुरक्षा',
    navMetrics: 'इम्पैक्ट और आंकड़े',
    ctaSnapSurplus: 'सामान बेचें',
    heroKicker: 'मुंबई · नवी मुंबई · ठाणे लोकल मार्केटप्लेस',
    heroTitle: 'बचा हुआ निर्माण सामान 2 सेकंड में बेचें। 45% तक सस्ते में पास से खरीदें।',
    heroSubtitle:
      'टाइप करने की ज़रूरत नहीं। बस फोटो खींचें या हिंदी, मराठी या अंग्रेजी में बोलें। AI खुद सामान, मात्रा और सही रेट बता देगा — OTP डिलीवरी एस्क्रो की पूरी सुरक्षा के साथ।',
    step1Title: '1. फोटो लें या बोलें',
    step1Desc: 'AI एक फोटो से सामान, मात्रा और सही दाम पहचान लेता है।',
    step2Title: '2. पास में खोजें',
    step2Desc: 'अपनी साइट के 2–35 km के दायरे में वेरिफाइड स्टॉक पाएं।',
    step3Title: '3. सुरक्षित OTP एस्क्रो',
    step3Desc: 'जब सामान ट्रक से पहुंचे और आप OTP दें, तभी पेमेंट रिलीज़ होगा।',
    voicePromptHint: 'बोलकर लिखें (हिंदी / मराठी / EN)',
    radiusLabel: 'खोज की दूरी',
    searchPlaceholder: 'सरिया, सीमेंट, टाइल्स, AAC ब्लॉक्स, वाशी, अंधेरी खोजें...',
    allCategories: 'सभी सामान',
    fuzzedLocationNotice: 'एस्क्रो बुक होने तक सटीक पता (~600m) गोपनीय रहता है',
    bookEscrowBtn: 'एस्क्रो से खरीदें और ट्रक बुक करें',
    snapHeader: 'फोटो खींचें और 2 सेकंड में लिस्ट करें',
    snapSubheader:
      'कैमरे से फोटो लें या अपनी आवाज़ में बोलें। AI अपने आप सामान, मात्रा और सही कीमत भर देगा — बस चेक करें और पोस्ट करें।',
    humanLoopNotice:
      'एक नज़र डालें: पोस्ट करने से पहले कृपया AI द्वारा भरी गई मात्रा और कीमत कन्फर्म करें।',
    confirmPublishBtn: 'कन्फर्म करें और लिस्टिंग लाइव करें',
    smartMatchHeader: 'आपके प्रोजेक्ट के लिए स्मार्ट मैच',
    smartMatchSubheader:
      'अपनी ज़रूरत बताएं और दूरी, बचत और सेलर भरोसे के आधार पर पास के सबसे अच्छे विकल्प पाएं।',
    escrowHeader: 'सुरक्षित एस्क्रो और मिनी-ट्रक बुकिंग',
    escrowSubheader:
      'आपका पैसा एस्क्रो में सुरक्षित रहता है और डिलीवरी पर 6-अंकों का OTP देने के बाद ही सेलर को मिलता है।',
    securityHeader: 'भरोसा, सुरक्षा और AI पारदर्शिता',
    securitySubheader:
      'देखें कैसे हम नकली फोटो रोकते हैं, हर सेलर का ट्रस्ट स्कोर समझाते हैं और चैट को सुरक्षित रखते हैं।',
    metricsHeader: 'लाइव इम्पैक्ट और AI परफॉर्मेंस',
    metricsSubheader:
      'मुंबई और नवी मुंबई की 300 लिस्टिंग से बचाया गया कचरा, CO₂ बचत और AI सटीकता।',
  },
  mr: {
    navMarketplace: 'एक्सप्लोर करा',
    navSnapList: 'फोटोने विका',
    navSmartMatch: 'स्मार्ट मॅच',
    navCheckout: 'एस्क्रो व टेम्पो',
    navSecurity: 'विश्वास व सुरक्षा',
    navMetrics: 'इम्पॅक्ट व आकडेवारी',
    ctaSnapSurplus: 'साहित्य विका',
    heroKicker: 'मुंबई · नवी मुंबई · ठाणे लोकल मार्केटप्लेस',
    heroTitle: 'उरलेले बांधकाम साहित्य २ सेकंदात विका. ४५% पर्यंत सवलतीत जवळून खरेदी करा.',
    heroSubtitle:
      'टाईप करण्याची गरज नाही. फक्त फोटो काढा किंवा मराठी, हिंदी किंवा इंग्रजीत बोला. AI स्वतः साहित्य, प्रमाण आणि योग्य दर सांगेल — OTP डिलिव्हरी एस्क्रोच्या पूर्ण सुरक्षिततेसह.',
    step1Title: '१. फोटो काढा किंवा बोला',
    step1Desc: 'AI एका फोटोवरून साहित्य, संख्या आणि योग्य किंमत ओळखते.',
    step2Title: '२. जवळपास शोधा',
    step2Desc: 'तुमच्या साईटच्या २–३५ किमी परिसरात खात्रीशीर स्टॉक मिळवा.',
    step3Title: '३. सुरक्षित OTP एस्क्रो',
    step3Desc: 'टेम्पोने साहित्य पोहोचल्यावर तुम्ही OTP दिल्यावरच पैसे दिले जातात.',
    voicePromptHint: 'आवाजाने बोला (मराठी / हिंदी / EN)',
    radiusLabel: 'शोध अंतर',
    searchPlaceholder: 'सळई, सिमेंट, टाईल्स, AAC ठोकळे, वाशी, बेलापूर शोधा...',
    allCategories: 'सर्व साहित्य',
    fuzzedLocationNotice: 'एस्क्रो बुक होईपर्यंत अचूक पत्ता (~६०० मी.) गोपनीय राहतो',
    bookEscrowBtn: 'एस्क्रोसह खरेदी करा व टेम्पो बुक करा',
    snapHeader: 'फोटो काढा आणि २ सेकंदात जाहिरात करा',
    snapSubheader:
      'फोटो काढा किंवा आवाजाने बोला. आमचे AI आपोआप साहित्य, संख्या आणि योग्य किंमत भरेल — फक्त तपासा आणि प्रसिद्ध करा.',
    humanLoopNotice:
      'एकदा तपासा: जाहिरात प्रसिद्ध करण्यापूर्वी कृपया AI ने सुचवलेली संख्या आणि किंमत तपासा.',
    confirmPublishBtn: 'खात्री करा व जाहिरात प्रसिद्ध करा',
    smartMatchHeader: 'तुमच्या प्रकल्पासाठी स्मार्ट मॅच',
    smartMatchSubheader:
      'तुमची गरज सांगा आणि अंतर, बचत आणि विक्रेता विश्वासानुसार जवळचे सर्वोत्तम पर्याय पहा.',
    escrowHeader: 'सुरक्षित एस्क्रो आणि मिनी-ट्रक बुकिंग',
    escrowSubheader:
      'तुमचे पैसे एस्क्रोमध्ये सुरक्षित राहतात आणि साईटवर डिलिव्हरी झाल्यावर ६-अंकी OTP दिल्यानंतरच विक्रेत्याला मिळतात.',
    securityHeader: 'विश्वास, सुरक्षा आणि AI पारदर्शकता',
    securitySubheader:
      'आम्ही बनावट फोटो कसे रोखतो, प्रत्येक विक्रेत्याचा ट्रस्ट स्कोअर कसा ठरवतो आणि चॅट कशी सुरक्षित ठेवतो ते पहा.',
    metricsHeader: 'लाईव्ह इम्पॅक्ट आणि AI कामगिरी',
    metricsSubheader:
      'मुंबई आणि नवी मुंबईतील ३०० लिस्टिंगमधून वाचवलेला कचरा, CO₂ बचत आणि AI अचूकता.',
  },
};
