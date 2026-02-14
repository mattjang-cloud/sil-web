/**
 * SIL UI Strings — ko / en / ja
 *
 * 모든 UI 텍스트를 여기에 모아서 언어 전환 시 자동 반영.
 */

export type Lang = "ko" | "en" | "ja";

const strings = {
  // ─── Navigation ───
  nav_home: { ko: "홈", en: "Home", ja: "ホーム" },
  nav_consultation: { ko: "AI 상담", en: "AI Consultation", ja: "AI 相談" },
  nav_products: { ko: "제품", en: "Products", ja: "製品" },
  nav_diary: { ko: "피부일기", en: "Skin Diary", ja: "肌日記" },
  nav_start: { ko: "분석 시작", en: "Start Analysis", ja: "分析開始" },

  // ─── Welcome ───
  welcome_title: { ko: "AI 피부 상담", en: "AI Skin Consultation", ja: "AI 肌相談" },
  welcome_desc: {
    ko: "5-Vector를 설정하면 가장 맞춤화된 상담을 받을 수 있어요. 바로 채팅을 시작할 수도 있습니다.",
    en: "Set up your 5 vectors for the most personalized experience, or jump straight into chatting.",
    ja: "5-Vectorを設定すると最もパーソナライズされた相談ができます。チャットにすぐ入ることもできます。",
  },
  welcome_start: { ko: "5-Vector 설정 시작", en: "Start 5-Vector Setup", ja: "5-Vector設定開始" },
  welcome_skip: { ko: "바로 채팅하기", en: "Skip to Chat", ja: "チャットへ" },

  // ─── Setup Wizard Steps ───
  step_persona: { ko: "상담사", en: "Advisor", ja: "アドバイザー" },
  step_skin_scan: { ko: "피부분석", en: "Skin Scan", ja: "肌分析" },
  step_environment: { ko: "환경", en: "Environment", ja: "環境" },
  step_lifestyle: { ko: "생활습관", en: "Lifestyle", ja: "生活習慣" },
  step_tpo: { ko: "TPO", en: "TPO", ja: "TPO" },
  step_theme: { ko: "테마", en: "Theme", ja: "テーマ" },

  // ─── Persona Selector ───
  persona_title: { ko: "상담사를 선택하세요", en: "Choose Your Advisor", ja: "アドバイザーを選んでください" },
  persona_desc: {
    ko: "각 인플루언서의 말투와 전문 분야가 달라요!",
    en: "Each influencer has a unique style and specialty!",
    ja: "各インフルエンサーの話し方と専門分野が異なります！",
  },

  // ─── Skin Scan ───
  skin_title: { ko: "피부 분석", en: "Skin Analysis", ja: "肌分析" },
  skin_desc: {
    ko: "셀카를 찍거나 사진을 업로드하면 AI가 피부를 분석합니다.",
    en: "Take a selfie or upload a photo for AI-powered skin analysis.",
    ja: "セルフィーを撮るか写真をアップロードするとAIが肌を分析します。",
  },
  skin_take_photo: { ko: "사진 촬영", en: "Take Photo", ja: "写真を撮る" },
  skin_upload: { ko: "사진 업로드", en: "Upload Photo", ja: "写真をアップ" },
  skin_analyzing: { ko: "Claude Vision으로 분석 중...", en: "Analyzing with Claude Vision...", ja: "Claude Visionで分析中..." },
  skin_wait: { ko: "10~20초 소요됩니다", en: "This may take 10-20 seconds", ja: "10〜20秒かかります" },
  skin_complete: { ko: "분석 완료!", en: "Analysis Complete!", ja: "分析完了！" },
  skin_type: { ko: "피부 타입", en: "Skin Type", ja: "肌タイプ" },
  skin_hydration: { ko: "수분", en: "Hydration", ja: "水分" },
  skin_oil: { ko: "유분", en: "Oil Level", ja: "油分" },
  skin_texture: { ko: "피부결", en: "Texture", ja: "肌質" },
  skin_issues: { ko: "감지된 이슈", en: "Detected Issues", ja: "検出された問題" },
  skin_continue: { ko: "계속하기 →", en: "Continue →", ja: "続ける →" },
  skin_retry: { ko: "다시 촬영", en: "Try Again", ja: "再撮影" },
  skin_skip: { ko: "건너뛰기", en: "Skip this step", ja: "スキップ" },
  skin_demo: { ko: "데모 데이터로 진행", en: "Skip with Demo Data", ja: "デモデータで続行" },

  // ─── Environment ───
  env_title: { ko: "환경", en: "Environment", ja: "環境" },
  env_desc: {
    ko: "현재 위치의 날씨, UV 지수, 공기질을 확인합니다.",
    en: "We'll check current weather, UV index, and air quality.",
    ja: "現在地の天気、UV指数、空気質を確認します。",
  },
  env_detect: { ko: "내 위치 감지", en: "Detect My Location", ja: "現在地を検出" },
  env_or_select: { ko: "또는 도시 선택", en: "Or select a city", ja: "または都市を選択" },
  env_season: { ko: "계절", en: "Season", ja: "季節" },
  env_spring: { ko: "봄 🌸", en: "Spring 🌸", ja: "春 🌸" },
  env_summer: { ko: "여름 ☀️", en: "Summer ☀️", ja: "夏 ☀️" },
  env_fall: { ko: "가을 🍂", en: "Fall 🍂", ja: "秋 🍂" },
  env_winter: { ko: "겨울 ❄️", en: "Winter ❄️", ja: "冬 ❄️" },

  // ─── Lifestyle ───
  life_title: { ko: "생활습관", en: "Lifestyle", ja: "生活習慣" },
  life_desc: {
    ko: "일상 습관을 알려주시면 맞춤 추천을 해드릴게요.",
    en: "Tell us about your daily habits for personalized recommendations.",
    ja: "日常の習慣を教えてください。パーソナライズされた推薦をします。",
  },
  life_sleep: { ko: "수면", en: "Sleep", ja: "睡眠" },
  life_stress: { ko: "스트레스", en: "Stress Level", ja: "ストレス" },
  life_exercise: { ko: "운동", en: "Exercise", ja: "運動" },
  life_continue: { ko: "계속하기", en: "Continue", ja: "続ける" },

  // ─── TPO ───
  tpo_title: { ko: "시간 / 장소 / 상황", en: "Time / Place / Occasion", ja: "時間 / 場所 / シーン" },
  tpo_desc: {
    ko: "상황에 따라 추천이 달라져요.",
    en: "Context matters for personalized advice.",
    ja: "状況に合わせて推薦が変わります。",
  },
  tpo_time: { ko: "시간", en: "Time", ja: "時間" },
  tpo_place: { ko: "장소", en: "Place", ja: "場所" },
  tpo_occasion: { ko: "상황", en: "Occasion", ja: "シーン" },

  // ─── Theme ───
  theme_title: { ko: "테마 & 스타일", en: "Theme & Style", ja: "テーマ＆スタイル" },
  theme_desc: {
    ko: "원하는 피부 방향을 선택하세요.",
    en: "Choose your aesthetic direction.",
    ja: "お好みの肌の方向性を選んでください。",
  },
  theme_intensity: { ko: "강도", en: "Intensity", ja: "強度" },
  theme_start: { ko: "상담 시작하기 →", en: "Start Consultation →", ja: "相談開始 →" },

  // ─── Chat ───
  chat_placeholder: {
    ko: "K-뷰티 전문가에게 질문하세요...",
    en: "Ask your K-Beauty expert...",
    ja: "K-ビューティー専門家に質問...",
  },
  chat_disclaimer: {
    ko: "SIL AI는 참고용입니다. 의학적 조언은 피부과 전문의와 상담하세요.",
    en: "SIL AI can make mistakes. Consult a dermatologist for medical advice.",
    ja: "SIL AIは参考用です。医学的アドバイスは皮膚科医にご相談ください。",
  },
  chat_greeting: {
    ko: "안녕하세요! 저는 {name}에요",
    en: "Hi! I'm {name}",
    ja: "こんにちは！{name}です",
  },
  chat_intro: {
    ko: "스킨케어, K-뷰티 제품, 성분, 루틴에 대해 무엇이든 물어보세요. 5-Vector 프로필을 활용해 맞춤 조언을 드릴게요.",
    en: "Ask me anything about skincare, K-Beauty products, ingredients, or routines. I'll use your 5-Vector profile for personalized advice.",
    ja: "スキンケア、K-ビューティー製品、成分、ルーティンについて何でも聞いてください。5-Vectorプロフィールを活用してアドバイスします。",
  },
  chat_vectors_badge: { ko: "{n}/5 벡터", en: "{n}/5 Vectors", ja: "{n}/5 ベクター" },

  // ─── General ───
  skip: { ko: "건너뛰기", en: "Skip", ja: "スキップ" },
  skip_all: { ko: "모두 건너뛰고 채팅으로 →", en: "Skip all and go to chat →", ja: "すべてスキップしてチャットへ →" },
  low: { ko: "낮음", en: "Low", ja: "低い" },
  medium: { ko: "보통", en: "Medium", ja: "普通" },
  high: { ko: "높음", en: "High", ja: "高い" },
  none: { ko: "안 함", en: "None", ja: "なし" },
  light: { ko: "가벼운", en: "Light", ja: "軽い" },
  moderate: { ko: "보통", en: "Moderate", ja: "適度" },
  active: { ko: "활발", en: "Active", ja: "活発" },
  subtle: { ko: "은은", en: "Subtle", ja: "控えめ" },
  bold: { ko: "강렬", en: "Bold", ja: "大胆" },
  detecting: { ko: "감지 중...", en: "Detecting...", ja: "検出中..." },
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Lang): string {
  const entry = strings[key];
  if (!entry) return key;
  return entry[lang] || entry["ko"];
}

export default strings;
