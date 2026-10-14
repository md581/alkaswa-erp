# Global AI Home Solution Platform — কৌশলগত গবেষণা রিপোর্ট (Strategic Research Report)

- **সংস্করণ:** ১.০ (Phase 1 — গবেষণা ও বিশ্লেষণ)
- **গবেষণার তারিখ:** ১৪ অক্টোবর ২০২৬
- **Implementation Status:** অনুমোদিত নয়। এই রিপোর্টে কোনো কোড, চূড়ান্ত PRD, database schema বা build prompt নেই।
- **সহায়ক ফাইল:** `00_research_plan_o_jachai_talika.md` (পরিকল্পনা), `02_verification_register.md` (দাবি যাচাই), `03_sources_appendix.md` (উৎস), `04_research_log.md` (কাঁচা প্রমাণ লগ)

> **পাঠকের জন্য সবচেয়ে গুরুত্বপূর্ণ সতর্কতা:** এই গবেষণা শুধুমাত্র অনলাইন desk research। কোনো গ্রাহক সাক্ষাৎকার, supplier আলোচনা, প্রতিযোগী পণ্যের hands-on test বা paid pilot করা হয়নি। উপরন্তু, এই environment-এ সরাসরি ওয়েবপেজ খোলা বন্ধ ছিল; সব তথ্য search tool-এর মাধ্যমে এসেছে (বিস্তারিত বিভাগ ৩-এ)। তাই প্রায় সব মূল্য ও বৈশিষ্ট্য-দাবি "Partially Verified" স্তরের।

---

## ১. Executive Summary ও এক-পাতার Decision Brief

### ১.১ মূল উপসংহার (তিন লাইনে)
1. **"AI দিয়ে ঘর ডিজাইন" নিজে আর পার্থক্য তৈরি করে না।** ছবি থেকে AI redesign কয়েক ডলারে বা বিনামূল্যে বহু টুলে পাওয়া যায়; IKEA ও Wayfair-এর মতো বড় retailer নিজেদের পণ্য দিয়ে এটি বিনামূল্যে দেয়; ChatGPT-র "shopping research" বিনামূল্যে budget-ভিত্তিক পণ্য তালিকা বানায়। (FACT — বিভাগ ৫)
2. **সম্ভাব্য ফাঁক হলো "নির্ভরযোগ্য স্থানীয় ডেটা + মাপ মিলিয়ে বাজেটসহ কেনার পরিকল্পনা"**, বিশেষত এমন বাজারে যেখানে retailer-দের product feed কোনো বড় AI assistant-এর কাছে নেই। এই ফাঁকটি আসল গ্রাহক-সমস্যা কিনা এবং কেউ এর জন্য টাকা দেবে কিনা — **এখনো প্রমাণিত নয়** (INSUFFICIENT EVIDENCE)।
3. **সুপারিশ: REVISE THE APPROACH → সীমিত "GO TO NEXT VALIDATION STAGE"।** পুরো global platform বা কোনো software তৈরি নয়; পরবর্তী ধাপ হলো ৩০ দিনের সস্তা যাচাই: গ্রাহক সাক্ষাৎকার, একটি শহরে একটি পণ্য-ক্যাটাগরির ডেটা অডিট, এবং হাতে-করা (concierge) সেবা দিয়ে কয়েকটি paid project-এর চেষ্টা।

### ১.২ Decision Brief (M1 অনুযায়ী ১০টি প্রশ্ন)

| # | প্রশ্ন | উত্তর | প্রমাণের স্তর |
|---|---|---|---|
| 1 | কোন সমস্যা আগে যাচাই করা উচিত? | "একটি নির্দিষ্ট ঘর (যেমন bedroom/living) সাজাতে চাওয়া মানুষ জানে না কোন **বাস্তবে কেনা যায় এমন** পণ্য তার **মাপ ও বাজেটে** মিলবে, এবং দোকান ঘুরে/Facebook পেজ ঘেঁটে তুলনা করতে অনেক সময় যায় ও ভুল হয়" — এই সমস্যার তীব্রতা ও টাকা দেওয়ার ইচ্ছা। | ASSUMPTION (যাচাইযোগ্য hypothesis) |
| 2 | কে এই সমস্যায় ভোগে? | প্রার্থী: (ক) নতুন/বিদ্যমান ফ্ল্যাটে এক-দুটি ঘর সাজাচ্ছেন এমন শহুরে মধ্যবিত্ত গৃহস্থ; (খ) ছোট interior design studio/freelance designer, যারা ক্লায়েন্টের জন্য পণ্য তালিকা ও কোটেশন বানান। কোনটি ভালো — **Insufficient evidence**; তুলনামূলক পরীক্ষা প্রয়োজন। | INSUFFICIENT EVIDENCE |
| 3 | কোন দেশে আগে পরীক্ষা? | **প্রধান প্রার্থী: বাংলাদেশ (ঢাকা)** — যাচাইয়ের জন্য, স্থায়ী সিদ্ধান্ত নয়। কারণ: (১) সেখানে বড় AI assistant/retailer-feed ecosystem-এর প্রমাণ পাওয়া যায়নি, ফলে "স্থানীয় যাচাইকৃত ডেটা"-র পার্থক্য সম্ভাব্যভাবে বেশি টেকসই; (২) US-এ প্রতিযোগিতা ও বিনামূল্যের বিকল্প অত্যন্ত শক্তিশালী। শর্ত: founder ঢাকায় উপস্থিত/সংযুক্ত — এটি **founder-এর নিশ্চিত করতে হবে**। | ANALYSIS (মাঝারি-নিম্ন আস্থা) |
| 4 | কোন product direction পরবর্তী পরীক্ষার যোগ্য? | **Option A-এর সংকীর্ণ রূপ:** "একটি ঘরের মাপ + বাজেট → স্থানীয়ভাবে কেনা যায় এমন যাচাইকৃত পণ্যের তালিকা + বিকল্প + concept image" — প্রথমে concierge (মানুষ দিয়ে, AI-সহায়তায়)। সমান্তরালে Option C (designer-দের জন্য) নিয়ে সাক্ষাৎকার। | RECOMMENDATION |
| 5 | বিদ্যমান বিকল্প থেকে পার্থক্য কী? | প্রস্তাবিত পার্থক্য: (১) একাধিক স্থানীয় retailer-এর পণ্য, মাপ ও দামের উৎস-তারিখসহ তথ্য; (২) ঘরের মাপের সাথে fit-check; (৩) বাজেট-সীমার মধ্যে বিকল্প; (৪) অনিশ্চয়তা স্পষ্টভাবে প্রকাশ। এটি **এখনো পার্থক্য হিসেবে প্রমাণিত নয়** — retailer নিজেরা বা Daraz এটি অনুকরণ করতে পারে। | ASSUMPTION |
| 6 | সুযোগের পক্ষে কী প্রমাণ? | (ক) US-এ মানব designer-সহ online "প্রতি রুম" সেবা ($159/room, Havenly) ২০২৬-এও চালু — অর্থাৎ কিছু মানুষ রুম-পরিকল্পনার জন্য টাকা দেয়; (খ) বাংলাদেশে Sheraspace ২০২০ থেকে অনলাইন consultation বিক্রি করেছে (Tk 2,800/session থেকে, ২০২০–২২-এর তথ্য); (গ) BD ফার্নিচার বাজার Tk 25,000–30,000 কোটি (সংবাদ উদ্ধৃতি); (ঘ) BD-তে ১৩৫.৯ মিলিয়ন internet subscription (জুন ২০২৬)। এগুলো **পরোক্ষ** প্রমাণ — এই নির্দিষ্ট পণ্যের চাহিদা প্রমাণ করে না। | FACT (পরোক্ষ) |
| 7 | ব্যর্থতার তিনটি সবচেয়ে গুরুতর কারণ | (১) **মূল্য দেওয়ার ইচ্ছা দুর্বল** — বিনামূল্যের বিকল্প (দোকানের salesperson, Facebook, ChatGPT, retailer app) "যথেষ্ট ভালো" মনে হতে পারে; (২) **ডেটা সংগ্রহ ও হালনাগাদ রাখার খরচ** — BD retailer-দের API/feed পাওয়া যায়নি, দাম দ্রুত বদলায় (যেমন রড ১০ দিনে Tk10,000/টন পর্যন্ত); (৩) **মানব-শ্রমনির্ভর মডেলের unit economics** — Modsy (~$73M তুলে ২০২২-এ বন্ধ) ও Homepolish (২০১৯-এ বন্ধ) এর সতর্কবার্তা। | ANALYSIS |
| 8 | কী অজানা? | গ্রাহক কে, কত ঘন ঘন সমস্যা, কত টাকা দেবে; BD retailer-রা ডেটা দেবে কিনা; ডেটা সংগ্রহের প্রকৃত খরচ; CAC; founder-এর অবস্থান, সময় ও মূলধন। | INSUFFICIENT EVIDENCE |
| 9 | Founder এখন কী করবেন? | বিভাগ ১৮-এর ৩০-দিনের পরিকল্পনা: ২০–৩০টি সাক্ষাৎকার (দুটি segment), ৫০–১০০ পণ্যের ডেটা অডিট (ঢাকা, একটি ক্যাটাগরি), ৪–৬টি retailer/designer-এর সাথে আলোচনা, এবং পূর্ব-নির্ধারিত মূল্যে ৫–১০টি concierge project বিক্রির চেষ্টা। | RECOMMENDATION |
| 10 | এখন কী বানানো/খরচ করা উচিত নয়? | App/website, global catalog, marketplace, contractor network, renovation cost engine, home profile, smart-home, multi-country localisation, paid ads campaign, AI model training/fine-tuning, যেকোনো দীর্ঘমেয়াদি software চুক্তি। | RECOMMENDATION |

### ১.৩ সবচেয়ে শক্তিশালী বিপরীত প্রমাণ (Strongest evidence against)
- US বাজারে design-to-purchase workflow-এর বড় অংশ ইতিমধ্যে বিনামূল্যে আছে (IKEA Kreativ, Wayfair Muse, ChatGPT shopping research), এবং বড় retailer-রা তাদের product feed সরাসরি OpenAI/Google-এর commerce protocol-এ দিচ্ছে। ফলে "verified product data" একটি ছোট startup-এর জন্য US-এ টেকসই পার্থক্য হওয়ার সম্ভাবনা কম।
- একই ধরনের মডেলে (3D design + কেনা যায় এমন পণ্য + মানব designer) ভালো তহবিলপ্রাপ্ত কোম্পানি ব্যর্থ হয়েছে (Modsy, Homepolish)।
- বাংলাদেশে অনুরূপ সেবা (Sheraspace) ২০২০ থেকে আছে, কিন্তু ২০২৫–২৬-এ এর বৃদ্ধি বা সক্রিয়তার প্রমাণ পাওয়া যায়নি — এটি হয় সীমিত চাহিদা, নয়তো শুধু তথ্যের অভাব নির্দেশ করে (অজানা)।
- বাংলাদেশে ২০২৫-এ ফ্ল্যাট বিক্রি উল্লেখযোগ্যভাবে কমেছে (developer-দের বক্তব্য) — "নতুন ফ্ল্যাটে ওঠা" trigger-এর পরিমাণ কমতে পারে।

---

## ২. Vision ও Scope

**দীর্ঘমেয়াদি vision (অপরিবর্তিত):** একটি Global AI Home Solution Platform যা ঘরের পরিকল্পনা, ডিজাইন, পণ্য, বাজেট, সংস্কার, পেশাদার ও রক্ষণাবেক্ষণ — বাড়ির জীবনচক্রের বিভিন্ন ধাপ সংযুক্ত করবে এবং বহু দেশে কাজ করবে।

**এই রিপোর্ট vision বাতিল বা প্রতিস্থাপন করছে না।** এটি শুধু প্রশ্ন তোলে: কোন সংকীর্ণ প্রথম workflow vision-এর দিকে প্রথম যাচাইযোগ্য ধাপ?

| স্তর | কী অন্তর্ভুক্ত | অবস্থা |
|---|---|---|
| দীর্ঘমেয়াদি vision | পুরো home lifecycle, বহু দেশ, marketplace, home profile | অনুমোদিত লক্ষ্য, বাস্তবায়ন অনুমোদিত নয় |
| প্রস্তাবিত প্রথম পরীক্ষা | এক শহর, এক ধরনের ঘর, এক পণ্য-ক্যাটাগরি গুচ্ছ, concierge সেবা | founder অনুমোদনের অপেক্ষায় |
| vision-এর সাথে সংযোগ | প্রথম পরীক্ষা থেকে পাওয়া (১) স্থানীয় পণ্য ডেটা, (২) retailer সম্পর্ক, (৩) গ্রাহকের প্রকৃত কেনাকাটার ফলাফল — এগুলো পরে renovation, পেশাদার সংযোগ ও home profile-এর ভিত্তি হতে পারে | ANALYSIS |

---

## ৩. গবেষণা পদ্ধতি ও সীমাবদ্ধতা (Methodology & Limitations)

### ৩.১ পদ্ধতি
- Master Prompt-এর Part 1–5 ও প্রাথমিক রিপোর্ট (Workstream K) পড়ে research map ও যাচাই তালিকা তৈরি (`00_...md`)।
- সিদ্ধান্তে প্রভাবের ক্রমে (L2) প্রায় ৪৫টি web search: গ্রাহক/WTP সংকেত → ডেটা প্রবেশাধিকার ও অধিকার → প্রতিযোগী ও মূল্য → AI সম্ভাব্যতা → বাজার → আইন।
- প্রতিটি দাবি `02_verification_register.md`-এ status সহ লিপিবদ্ধ।

### ৩.২ গুরুত্বপূর্ণ সীমাবদ্ধতা
| সীমাবদ্ধতা | প্রভাব |
|---|---|
| **সরাসরি page fetch বন্ধ:** environment-এর network policy houzz.com, planner5d.com, maket.ai, reimaginehome.ai, pwd.gov.bd, wikipedia.org সহ সব সাধারণ সাইটে সংযোগ প্রত্যাখ্যান করেছে। শুধু WebSearch কাজ করেছে, যা search index-এর পাতার সারাংশ দেয়। | Official pricing page নিজে পড়া যায়নি; বেশিরভাগ মূল্য aggregator (Capterra, PricingSaaS ইত্যাদি) থেকে। কোনো মূল্যকে "Verified" দেওয়া হয়নি যদি না একাধিক সাম্প্রতিক উৎস একমত হয়। |
| Search tool US-ভিত্তিক | বাংলাদেশের স্থানীয় উৎস (বিশেষত বাংলা ভাষার, Facebook-ভিত্তিক ব্যবসা) কম এসেছে। BD প্রতিযোগী ম্যাপ অসম্পূর্ণ হতে পারে। |
| কোনো বাস্তব গবেষণা নেই | সাক্ষাৎকার, product test, supplier আলোচনা, pilot — কিছুই করা হয়নি (Rule 13)। |
| Vendor-লিখিত তুলনা | AI interior app-এর বহু তুলনা প্রতিযোগী vendor লিখেছে (স্বার্থের সংঘাত)। |
| আইনি উৎস | বেশিরভাগ আইনি তথ্য law-firm বিশ্লেষণ থেকে, official gazette থেকে নয়। এটি আইনি পরামর্শ নয়। |

### ৩.৩ কভারেজ
- **দেশ:** বাংলাদেশ, US, UK, Australia (EU শুধু ভবিষ্যৎ সম্প্রসারণ প্রসঙ্গে)।
- **প্রতিযোগী পর্যালোচিত (২৫+):** Houzz/Houzz Pro, Planner 5D, Homestyler, Coohom (Manycore), Foyr Neo, Cedreo, Maket, REimagineHome, IKEA Kreativ, Wayfair Muse, Havenly, Modsy (বন্ধ), Homepolish (বন্ধ), Angi, Thumbtack, RoomGPT, Interior AI, Remodel AI, Collov AI, Spacely AI, ChatGPT shopping research, Renovio/ReformAI (estimate app), Sheba.xyz, Sheraspace, Navana Furniture, Berger/Asian Paints সেবা, Daraz; অযাচাইকৃত: Sampotti Design, Amara Group।
- **পর্যালোচিত হয়নি / অপর্যাপ্ত:** Hatil, Regal, Otobi, Akhtar-এর অনলাইন catalog বিস্তারিত; BD-র Facebook-ভিত্তিক interior designer বাজার; UK/AU-এর স্থানীয় প্রতিযোগী (যেমন UK-র নির্দিষ্ট renovation marketplace)।

---

## ৪. Evidence Register (সারসংক্ষেপ)

> সম্পূর্ণ দাবি-ভিত্তিক তালিকা: `02_verification_register.md`। এখানে সিদ্ধান্ত-প্রভাবক মূল বিষয়গুলো।

### ৪.১ FACT (উৎস-সমর্থিত; বেশিরভাগ search-index মাধ্যমে)
| ID | তথ্য | উৎস |
|---|---|---|
| F1 | US-এ মালিক-অধিকৃত বাড়ির সংস্কার/মেরামত ব্যয় ২০২৬ শেষে প্রায় $518 billion হবে বলে প্রক্ষেপণ; প্রবৃদ্ধি মধ্য-২০২৬-এ ২.১%, বছরশেষে ১.৬% | Harvard JCHS LIRA, সংশোধিত ১৫ এপ্রিল ২০২৬ |
| F2 | Houzz-এর US জরিপে (প্রায় ২২,০০০ উত্তরদাতা, Houzz ব্যবহারকারী) ২০২৪-এ median সংস্কার ব্যয় $20,000; ৯০% পেশাদার নিয়োগ করেছেন। UK: median £21,440, ৯৪% | Houzz & Home Study 2025 (trade press মাধ্যমে) |
| F3 | Havenly online "Full" ডিজাইন: $159/room (≤৪০০ বর্গফুট), অতিরিক্ত রুম $119 | Havenly help center (২০২৬) |
| F4 | IKEA Kreativ: ঘরের ছবি থেকে interactive replica, বিদ্যমান আসবাব মুছে IKEA পণ্য বসানো; ডিসেম্বর ২০২৪-এ ২৯টি IKEA বাজারে | IKEA newsroom; trade press |
| F5 | Wayfair Muse (ফেব্রুয়ারি ২০২৫): AI room image + Wayfair-এর shoppable পণ্য | Wayfair press release |
| F6 | ChatGPT shopping research (নভেম্বর ২০২৫): বিনামূল্যের ব্যবহারকারীসহ; OpenAI নিজেই দাম/প্রাপ্যতায় ভুলের সতর্কতা দিয়েছে | সংবাদ কভারেজ |
| F7 | Amazon PA-API 5 deprecated; Creators API প্রতিস্থাপন | Amazon official deprecation page |
| F8 | Amazon furniture/home improvement affiliate হার ২০২০-এ ৮% থেকে ৩%-এ কাটা হয়; Amazon-এর একটি official টেবিলে ৪% | Martech/Entrepreneur; Amazon help page |
| F9 | Google Maps: geocoding lat/lng সর্বোচ্চ ৩০ দিন cache | Google Maps Platform Service Specific Terms |
| F10 | Angi-র Q4 2025 রাজস্ব ~১০% কম; "network" lead ৭৮% কম | Angi IR |
| F11 | Modsy ~$73M তুলে জুন ২০২২-এ design service বন্ধ করে; Homepolish ২০১৯-এ বন্ধ | Fortune; Business of Home |
| F12 | বাংলাদেশ: জুন ২০২৬ শেষে ১৩৫.৯৪M internet subscription (১২০.৮৪M mobile) | BTRC (Financial Express মাধ্যমে) |
| F13 | বাংলাদেশ Personal Data Protection Ordinance 2025 উপদেষ্টা পরিষদে ৯ অক্টোবর ২০২৫-এ অনুমোদিত; consent, উদ্দেশ্য-প্রকাশ, cross-border নিয়ম | Dhaka Tribune, Daily Star, Mahbub & Partners |
| F14 | PWD Schedule of Rates 2022 — Part A Civil ও Part C Retrofitting খণ্ড বিদ্যমান; Civil-এর revised সংস্করণ আছে | MIST library catalog; bdservicerules.info |
| F15 | BD Digital Commerce Operation Guidelines 2021: একই শহরে ৫ দিন/অন্য শহরে ১০ দিনে ডেলিভারি; ব্যর্থ হলে ১০ দিনে refund | TBS, Daily Star |
| F16 | BD-তে রডের দাম ১০ দিনে Tk10,000/টন পর্যন্ত বেড়েছে (২০২৬) | TBS |
| F17 | Image generation API-র খরচ প্রতি ছবি প্রায় $0.02–$0.13 (মডেল ও মানভেদে) | একাধিক secondary pricing বিশ্লেষণ |
| F18 | Manycore Tech (Coohom/Kujiale) ১৭ এপ্রিল ২০২৬-এ Hong Kong-এ listed; রাজস্ব ২০২৫-এ ~৮২০M yuan | Wikipedia; Davis Polk; সংবাদ |

### ৪.২ ASSUMPTION (যাচাই হয়নি)
| ID | অনুমান | কেন বিবেচনা করা হচ্ছে |
|---|---|---|
| A1 | ঢাকার শহুরে গৃহস্থরা ঘর সাজানোর সময় মাপ-বাজেট-পণ্য মেলাতে উল্লেখযোগ্য কষ্ট পান | vision-এর মূল সমস্যা; কোনো সরাসরি প্রমাণ পাওয়া যায়নি |
| A2 | তারা এর জন্য এককালীন ফি দেবেন | Sheraspace-এর অস্তিত্ব একটি দুর্বল সংকেত মাত্র |
| A3 | BD retailer-রা ডেটা শেয়ার করবে বা referral fee দেবে | কোনো BD furniture retailer-এর affiliate/API পাওয়া যায়নি |
| A4 | Facebook/WhatsApp-এর মাধ্যমে সস্তায় গ্রাহক পাওয়া যাবে | BD-তে F-commerce প্রচলিত (Daily Star/DHL), কিন্তু CAC অজানা |
| A5 | AI ব্যবহার করে মানব designer-এর সময় এতটা কমবে যে concierge লাভজনক হবে | পরীক্ষা ছাড়া জানা সম্ভব নয় |
| A6 | Amazon-এর বাংলাদেশ marketplace নেই, তাই Amazon API BD-তে অপ্রাসঙ্গিক | পর্যালোচিত উৎসে BD marketplace পাওয়া যায়নি; official তালিকা দেখে নিশ্চিত করতে হবে |

### ৪.৩ INSUFFICIENT EVIDENCE
- BD-তে ঘর সাজানো/সংস্কারের বার্ষিক ঘটনার সংখ্যা; ফ্ল্যাট হস্তান্তরের সংখ্যা; গৃহস্থের গড় ফার্নিচার ব্যয়।
- BD interior design বাজারের নির্ভরযোগ্য আকার (Daily Star-এ "Tk ২০,০০০ কোটির বেশি" উদ্ধৃতি — পদ্ধতি অজানা)।
- AI-generated layout-এর মাত্রাগত নির্ভুলতা (কোনো peer-reviewed benchmark পাওয়া যায়নি)।
- যেকোনো segment-এর CAC, conversion, retention।
- Sampotti Design ও Amara Group-এর অস্তিত্ব/সক্ষমতা।

---

## ৫. Global Competitor Landscape (প্রতিযোগী পরিস্থিতি)

### ৫.১ Competitor category map

| Category | উদাহরণ (পর্যালোচিত) | শ্রেণিবিন্যাস (আমাদের প্রেক্ষিতে) |
|---|---|---|
| A — AI interior redesign | RoomGPT, Interior AI, Remodel AI, REimagineHome, Collov AI, Spacely AI, Homestyler AI | **Substitute / commoditised বৈশিষ্ট্য**; সম্ভাব্য AI supplier নয় (তারা app) |
| B — Floor plan ও 3D | Planner 5D, Homestyler, Coohom, Maket, Cedreo, Floorplanner | Adjacent competitor; সম্ভাব্য partner (Planner 5D-র B2B API আছে) |
| C — Professional design software | Houzz Pro, Foyr Neo, Coohom, Cedreo | Option C-তে direct competitor (US/UK) |
| D — Renovation cost | Houzz Pro (estimate), Renovio, RenovaPlana, ReformAI | Option B-তে adjacent; সবগুলো নতুন ও অযাচাইকৃত নির্ভুলতা |
| E — Product discovery | ChatGPT shopping research, Google Shopping, Daraz | **শক্তিশালী substitute** |
| F — Retailer-owned design | IKEA Kreativ, Wayfair Muse | Substitute (একক retailer); BD-তে সমতুল্য পাওয়া যায়নি |
| G — Home services marketplace | Angi, Thumbtack, Sheba.xyz | ভবিষ্যৎ partner বা competitor; প্রথম পর্যায়ে অপ্রাসঙ্গিক |
| H — Pro project management | Houzz Pro | Benchmark |
| I — Home maintenance | (এই রাউন্ডে গভীরভাবে পর্যালোচিত হয়নি) | দীর্ঘমেয়াদি; গবেষণা বাকি |
| J — Integrated AI home agent | Houzz (consumer + Pro + Shop), general AI assistants | দীর্ঘমেয়াদি হুমকি |
| BD human-service | Sheraspace, Interior Studio Ace, BD Interior, Design Tomorrow, Berger Experience Zone, Asian Paints Ezypainting | Substitute (মানব সেবা); সম্ভাব্য partner/গ্রাহক (designer segment) |

### ৫.২ যাচাইকৃত প্রতিযোগী প্রোফাইল (সংক্ষিপ্ত)

> "দাবি" = কোম্পানির নিজের বক্তব্য, স্বাধীনভাবে পরীক্ষিত নয়। অনুল্লেখিত বিষয় = "Not found in the reviewed public sources" (অনুপস্থিতির প্রমাণ নয়)।

**১. Houzz / Houzz Pro** — houzz.com
- লক্ষ্য গ্রাহক: Pro — interior designer, remodeler, contractor; consumer side — গৃহস্থ (ideas, directory, Shop)।
- সক্ষমতা (দাবি): 2D → editable 3D floor plan ও AR walkthrough; product photo → 3D model; মে ২০২৬-এ elevation, annotation, AI custom finish; 3D plan → estimate/proposal → AI project schedule; product clipper, selections, mood board, CRM।
- মূল্য: Design $99/মাস, Pro $199/মাস, Teams $399/মাস থেকে (Designfiles, সেপ্টেম্বর ২০২৬); অন্য উৎসে ভিন্ন tier নাম (Starter $99/Essential $159 — বার্ষিক billing)। **Partially Verified।**
- ভূগোল: US, UK, AU সহ বহু দেশ (Houzz UK Shop ২০১৮ থেকে)। BD — not found।
- কৌশলগত অর্থ: US/UK-তে Option C-তে প্রবেশ করলে সরাসরি Houzz Pro-র সাথে প্রতিযোগিতা। এর বৃহৎ পেশাদার নেটওয়ার্ক ও consumer traffic অনুকরণ করা কঠিন।

**২. Planner 5D** — planner5d.com
- লক্ষ্য: গৃহস্থ (freemium) ও পেশাদার; ব্যবসার জন্য API।
- সক্ষমতা: 2D/3D planning; Stable Diffusion-ভিত্তিক AI Design Generator (২০২৩); generic catalog (৮,০০০–১০,০০০+ item); B2B API — "floor plan output populated with your product catalogue", Enterprise-এ white-label ও e-commerce integration (দাবি)।
- মূল্য: Premium $19.99 মাসিক বা ~$4.99/মাস বার্ষিক; Professional $49.99 মাসিক বা $33.33/মাস বার্ষিক। **Partially Verified।**
- অর্থ: (ক) consumer-এর জন্য খুব সস্তা — homeowner subscription মূল্যের ছাদ নির্দেশ করে; (খ) B2B API সম্ভাব্য partner/প্রযুক্তি উৎস হতে পারে (শর্ত অজানা)।

**৩. Homestyler** — homestyler.com
- সক্ষমতা: floor plan, 3D, rendering, AI credit।
- মূল্য: Pro+ "$6.80/মাস থেকে" (সম্ভবত বার্ষিক billing), ৭৫ render/মাস, ১৮০ AI credit/মাস। **Partially Verified।** Manycore-এর সাথে সম্পর্ক — পর্যালোচিত উৎসে নিশ্চিত হয়নি।

**৪. Coohom (Manycore Tech)** — coohom.com
- Manycore Tech (Kujiale-এর বিদেশি সংস্করণ Coohom) ১৭ এপ্রিল ২০২৬-এ HK-তে listed; ২০২৫ রাজস্ব ~৮২০M yuan; চীনের spatial design software-এ ২৩.২% বাজার অংশ (তার নিজের উদ্ধৃত রিপোর্ট)।
- মূল্য: প্রাথমিক রিপোর্টের "$9/মাস" **Outdated/Contradicted** — PricingSaaS (জুলাই/আগস্ট ২০২৬) অনুযায়ী মাসিক মূল্য সরিয়ে "One-time pass only"।
- অর্থ: প্রচুর মূলধনসম্পন্ন, B2B furniture/manufacturer-কেন্দ্রিক প্রতিদ্বন্দ্বী; retailer-দের জন্য visualisation বিক্রিতে শক্তিশালী।

**৫. Foyr Neo** — foyr.com
- লক্ষ্য: interior designer। মূল্য: Basic $39, Standard $89, Premium $159 /মাস (PricingSaaS ২০২৬); বার্ষিকে কম। প্রাথমিক রিপোর্টের $33/$67/$103 — **Contradicted/Outdated।**

**৬. Cedreo** — cedreo.com
- লক্ষ্য: US home builder/remodeler। মূল্য: Free; Personal $139 **এককালীন প্রতি project**; Professional $129/মাস; Enterprise $159/user/মাস (Capterra/PricingSaaS ২০২৬)। **Partially Verified।** — pay-per-project মডেলের একটি বিদ্যমান উদাহরণ।

**৭. Maket** — maket.ai
- লক্ষ্য: গৃহস্থ ও পেশাদার; AI floor plan ও 3D render (Maket 2.0)। মূল্য: Homeowner $20/মাস (৩০০ credit), Pro $100/মাস (৩,০০০ credit), বার্ষিকে ১৭% ছাড় (৩ অক্টোবর ২০২৬-এর page উদ্ধৃত)। **Partially Verified।**

**৮. REimagineHome** — reimaginehome.ai
- লক্ষ্য: real estate (virtual staging) ও গৃহস্থ; CRMLS-এর মাধ্যমে MLS সদস্যদের credit — B2B বিতরণ চ্যানেল। দাবি: "furniture you can actually buy" দিয়ে staging; API আছে বলে উল্লেখ।
- মূল্য: তৃতীয় পক্ষে ~$14/$29/$49/$99 (credit ভিত্তিক), উৎসভেদে ভিন্ন। প্রাথমিক রিপোর্টের $19/$36/$59/$119 — **Unverified/Contradicted।**

**৯. IKEA Kreativ** — বিনামূল্যে; বিস্তারিত F4। একক-retailer catalog; ২৯ বাজার (২০২৪)। BD-তে IKEA-র সরাসরি retail উপস্থিতি — not found।

**১০. Wayfair Muse** — বিনামূল্যে; F5। US-কেন্দ্রিক।

**১১. Havenly** — US online interior design; $159/room; মানব designer + shoppable পণ্য। **US-এ Option A-র সবচেয়ে কাছের বিদ্যমান benchmark।**

**১২. Angi ও Thumbtack** — US home-services lead generation। Angi সংকুচিত হচ্ছে (F10); Thumbtack pro-দের কাছে প্রতি lead চার্জ করে (convert না হলেও), ২০২৪-এ ARR ~$400M (reported)। অর্থ: services marketplace পরিপক্ব, liquidity তৈরি অত্যন্ত ব্যয়বহুল — প্রথম পর্যায়ে এড়িয়ে চলা উচিত।

**১৩. ChatGPT shopping research / general AI** — বিনামূল্যে, budget-ভিত্তিক buyer's guide; স্বীকৃত দুর্বলতা দাম/প্রাপ্যতা নির্ভুলতা; ঘরের মাপের সাথে fit-check-এর প্রমাণ পাওয়া যায়নি। বড় retailer-রা Agentic Commerce Protocol (OpenAI/Stripe) ও Universal Commerce Protocol (Google; Wayfair সহ-উন্নয়নকারী) এর মাধ্যমে feed দিচ্ছে।

**১৪. Sheba.xyz (BD)** — ৩০০+ household/office সেবার marketplace; মে ২০২৫-এ ~US$2.9M Series A (BSRM Group ও Startup Bangladesh), মোট ~US$9.3M (তৃতীয় পক্ষ প্রোফাইল)। ২০২৬-এর শ্রম-অভিযোগ — Unverified। অর্থ: ভবিষ্যতে execution/সেবা partner হতে পারে; প্রথম পর্যায়ে প্রয়োজন নেই।

**১৫. Sheraspace (BD)** — ২০১৯-এ প্রতিষ্ঠিত; online interior consultation (ডিজাইন প্ল্যান + নিজে বাস্তবায়নের নির্দেশনা), Tk 2,800/session থেকে, ~১ সপ্তাহে ডেলিভারি (২০২০–২২ রিপোর্ট); B2B commercial consultation Tk 5,000 থেকে (২০২২); বাংলা ওয়েবসাইট (২০২২)। প্রাথমিক রিপোর্টের "BDT 3,800/6,000/8,500 প্রতি রুম" — **Unverified**। বর্তমান সক্রিয়তা — Unverified। **BD-তে Option A-র সবচেয়ে কাছের benchmark; founder-এর উচিত সরাসরি এদের বর্তমান অফার দেখা।**

**১৬. Navana Furniture (BD)** — nfl.navana.com; ২০০২ থেকে; ৭টি শোরুম; অনলাইন শপে EMI, Tk20,000-এর বেশিতে ফ্রি ডেলিভারি; search tool-এ products page-এ ~২০টি পণ্য দেখা গেছে (pagination সম্ভব)। "~৫০৯ ফলাফল" — **Unverified**। API/feed — not found।

**১৭. অন্যান্য BD** — Interior Studio Ace (Bashundhara; শুধু directory listing — সক্ষমতা Unverified); BD Interior, Design Tomorrow, iNEXTerior (directory); Berger Paints (৪০টি Experience Zone, interior decoration সেবা); Asian Paints BD (Ezypainting); বড় ফার্নিচার ব্র্যান্ড: Regal (১৫০+ outlet), HATIL (~৮০), Akhtar, Brothers, Partex, Nadia, Legacy (Daily Star ২০২৫)। **Sampotti Design ও Amara Group — কোনো উৎসে পাওয়া যায়নি (Unverified)।**

### ৫.৩ বৈশিষ্ট্য তুলনা matrix

চিহ্ন: **V** = পর্যালোচিত উৎসে সমর্থিত (বেশিরভাগ কোম্পানির দাবি; hands-on পরীক্ষিত নয়) · **P** = আংশিক · **N** = Not found in reviewed sources · **U** = Unverified/পরস্পরবিরোধী · **NA** = প্রযোজ্য নয়

| সক্ষমতা | Houzz Pro | Planner 5D | Homestyler | Coohom | Foyr Neo | Cedreo | Maket | REimagine | IKEA Kreativ | Wayfair Muse | Havenly | ChatGPT shop | Sheraspace | Sheba.xyz |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AI image redesign | V | V | V | P | P | N | V | V | P | V | N | N | N | NA |
| 2D floor plan | V | V | V | V | V | V | V | N | N | N | N | NA | P | NA |
| 3D visualisation | V | V | V | V | V | V | V | P | V | N | P | NA | P | NA |
| Measurement support | P | P | P | P | P | P | P | N | V (দাবি) | N | P | N | P | NA |
| Geometry preservation | U | U | U | U | U | U | U | U | U | U | NA | NA | NA | NA |
| Real-product matching | V (clipper) | P (B2B) | U | P | P | N | N | P (দাবি) | V (নিজস্ব) | V (নিজস্ব) | V | V | U | NA |
| Product dimensions | P | P | U | P | U | N | N | N | V | U | U | P | U | NA |
| Product price | P | N | N | U | U | N | N | N | V | V | V | P (ভুলের সতর্কতা) | U | NA |
| Availability | N | N | N | N | N | N | N | N | P | P | U | P | N | NA |
| Shopping list | V | N | N | P | P | N | N | N | P | P | V | V | U | NA |
| Budget planning | V | N | N | N | N | N | N | N | N | N | P | V | U | NA |
| Construction estimate | V | N | N | N | N | P | N | N | NA | NA | NA | N | N | N |
| Material quantity | P | N | N | N | N | N | N | N | NA | NA | NA | N | N | N |
| Professional discovery | V | N | N | N | N | N | N | N | N | N | V (নিজস্ব designer) | N | V (নিজস্ব) | V |
| Service booking | P | N | N | N | N | N | N | N | N | N | V | N | V | V |
| Quotation comparison | N | N | N | N | N | N | N | N | N | N | N | N | N | N |
| Project management | V | N | N | P | P | N | N | N | N | N | P | N | U | P |
| Actual expense tracking | P | N | N | N | N | N | N | N | N | N | N | N | N | N |
| Country localisation | P | P | P | P | U | P | U | U | V (২৯ বাজার) | N (US) | N (US) | P | V (BD, বাংলা) | V (BD) |
| Data source transparency | N | N | N | N | N | N | N | N | NA | NA | N | P | N | N |
| Professional approval workflow | P | N | N | N | N | N | N | N | N | N | V | N | V | NA |
| API / partner integration | U | V | U | P | U | N | N | P | N | N | N | V (ACP) | N | U |

**Matrix থেকে ANALYSIS:**
- কোনো পর্যালোচিত প্রতিযোগীর ক্ষেত্রেই "data source transparency" (দাম/মাপের উৎস ও তারিখ দেখানো) এবং "quotation comparison" পাওয়া যায়নি। এটি একটি সম্ভাব্য ফাঁক — তবে **এটি গবেষণার ফাঁকও হতে পারে** (Rule 9), এবং গ্রাহক এটিকে মূল্য দেয় কিনা অজানা।
- "Geometry preservation" কারও ক্ষেত্রেই স্বাধীনভাবে যাচাই হয়নি — hands-on test প্রয়োজন।

### ৫.৪ মূল্য তুলনা (K4 যাচাই সারসংক্ষেপ)

| পণ্য | প্রাথমিক রিপোর্টের দাবি | যাচাইয়ে পাওয়া (মুদ্রা USD যদি না উল্লেখ থাকে) | Billing | Status |
|---|---|---|---|---|
| Houzz Pro | $99/$199/$399 মাসিক | Design $99, Pro $199, Teams $399+; অন্য উৎসে Starter $99/Essential $159 (বার্ষিক) | মাসিক/বার্ষিক অস্পষ্ট | Partially Verified |
| Planner 5D | Premium $19.99, Pro $49.99 | ঠিক — কিন্তু এগুলো **মাসিক billing**; বার্ষিকে Premium ~$4.99, Pro ~$33.33/মাস | উভয় | Partially Verified |
| Homestyler | Pro+ $6.80 থেকে | $6.80 থেকে, ৭৫ render, ১৮০ AI credit | সম্ভবত বার্ষিক | Partially Verified |
| Coohom | Pro ~$9/মাস | মাসিক মূল্য সরানো হয়েছে, "One-time pass only" (২০২৬) | — | Outdated |
| REimagineHome | $19/$36/$59/$119 | ~$14/$29/$49/$99 (উৎসভেদে ভিন্ন) | মাসিক | Contradicted/Unverified |
| Foyr Neo | $33/$67/$103 | $39/$89/$159 (মাসিক); বার্ষিকে কম | উভয় | Contradicted/Outdated |
| Maket | Homeowner ~$20, Pro ~$100 | $20 (৩০০ credit), $100 (৩,০০০ credit) | মাসিক; বার্ষিকে −১৭% | Partially Verified |
| Sheraspace | BDT 3,800/6,000/8,500 প্রতি রুম | পাওয়া যায়নি; ২০২০–২২-এ consultation Tk 2,800/session থেকে | — | Unverified |
| Cedreo (নতুন) | — | Personal $139 এককালীন/project; Pro $129/মাস | — | Partially Verified |
| Havenly (নতুন) | — | $159/room | এককালীন | Partially Verified |

**সতর্কতা:** পেশাদার subscription মূল্য (Houzz Pro, Foyr) গৃহস্থের WTP-র প্রমাণ নয়। Consumer AI app-গুলোর মূল্য ($5–$30/মাস) দেখায় যে "শুধু AI ডিজাইন"-এর বাজারমূল্য কম।

### ৫.৫ Competitive differentiation — ১০টি প্রশ্নের উত্তর

| # | প্রশ্ন | উত্তর (লেবেলসহ) |
|---|---|---|
| 1 | কোন সক্ষমতা commoditised? | AI image redesign/style transfer, virtual staging, basic 2D/3D floor plan, generic furniture catalog — বহু টুলে $0–$30/মাস (FACT, vendor-লিখিত তুলনা সহ)। |
| 2 | কোনটি নির্ভরযোগ্যভাবে করা কঠিন? | (ক) ছবি থেকে সঠিক মাপ; (খ) generated image-এর আসবাবকে **হুবহু** কেনা যায় এমন পণ্যের সাথে মেলানো; (গ) একাধিক retailer-এর হালনাগাদ দাম/প্রাপ্যতা; (ঘ) স্থানীয় নির্মাণ খরচ (ANALYSIS, আংশিক FACT)। |
| 3 | কোন অংশ এখনো খণ্ডিত? | বহু-retailer তুলনা + মাপ-fit + বাজেট একসাথে; ডিজাইন → কোটেশন তুলনা → প্রকৃত খরচ ট্র্যাকিং (গৃহস্থের জন্য)। পর্যালোচিত উৎসে কেউ পুরোটা দেয় না — **কিন্তু এটি research gap হতে পারে**। |
| 4 | কে ইতিমধ্যে design + পণ্য + বাজেট + execution সংযুক্ত করে? | পেশাদারদের জন্য Houzz Pro (দাবি); গৃহস্থের জন্য Havenly (মানব designer); single-retailer হিসেবে IKEA/Wayfair। |
| 5 | কে দ্রুত অনুকরণ করতে পারে? | ChatGPT/Gemini (retailer feed সহ), Houzz, বড় BD retailer (নিজের catalog-এ), Daraz। Software বৈশিষ্ট্য সহজেই অনুকরণযোগ্য (ANALYSIS)। |
| 6 | কোন সুবিধার জন্য সম্পর্ক/ডেটা/অভিজ্ঞতা লাগে? | স্থানীয় retailer-দের সাথে লিখিত ডেটা চুক্তি; যাচাইকৃত মাপ/দাম; প্রকৃত কেনাকাটা ও প্রকল্প-খরচের ফলাফল ডেটা; স্থানীয় designer/কারিগর নেটওয়ার্ক — এগুলো সময় ও কার্যক্রম দাবি করে। |
| 7 | গ্রাহককে প্ল্যাটফর্ম ছাড়তে কী আটকাবে? | প্রথম পর্যায়ে প্রায় কিছুই না (এককালীন ব্যবহার)। দীর্ঘমেয়াদে: সংরক্ষিত ঘরের মাপ/প্রকল্প ইতিহাস (home profile) — কিন্তু এর মূল্য অপ্রমাণিত। |
| 8 | কেন ChatGPT/design app/retailer app/পেশাদারের বদলে আমাদের? | প্রস্তাবিত উত্তর (ASSUMPTION): (ক) ChatGPT-র তুলনায় স্থানীয়, উৎস-তারিখসহ যাচাইকৃত ডেটা ও মাপ-fit; (খ) retailer app-এর তুলনায় বহু-retailer তুলনা; (গ) পেশাদারের তুলনায় সস্তা ও দ্রুত। **এটিই প্রথম পরীক্ষার মূল প্রশ্ন।** |
| 9 | কোন প্রমাণ পার্থক্য খণ্ডন করবে? | (ক) সাক্ষাৎকারে গ্রাহকরা বলে দোকানের salesperson/Facebook-এই সমস্যা মিটে যায়; (খ) concierge-এর জন্য পূর্বনির্ধারিত মূল্যে প্রায় কেউ টাকা দেয় না; (গ) ডেটা অডিটে বেশিরভাগ পণ্যের মাপ/দাম পাওয়া যায় না বা অধিকার নেই; (ঘ) গ্রাহক তালিকা পেয়েও অন্য জায়গা থেকে কেনে এবং পরের বার ফেরে না। |
| 10 | নতুন প্রবেশকারীর বিশ্বাসযোগ্য সুযোগ আছে কি? | US/UK/AU-তে broad B2C হিসেবে: **দুর্বল** (ANALYSIS, মাঝারি আস্থা)। বাংলাদেশে: **সম্ভাব্য, কিন্তু অপ্রমাণিত** — কম প্রতিযোগিতা বনাম কম WTP ও কঠিন ডেটা। |

### ৫.৬ একই-পরিস্থিতিতে প্রতিযোগী পরীক্ষার protocol (Same-scenario Testing Protocol)

> এটি পরিকল্পনা; **কোনো পরীক্ষা করা হয়নি।** Founder বা একজন সহকারী করবেন।

**নির্বাচিত টুল (৮–১০টি):** Planner 5D, Homestyler, Coohom, Maket, REimagineHome, RoomGPT/Remodel AI (একটি), IKEA Kreativ (যেখানে উপলব্ধ), ChatGPT (shopping research + image), এবং বাংলাদেশের জন্য Sheraspace (যদি সক্রিয়) ও একটি স্থানীয় ফার্নিচার retailer-এর in-store/WhatsApp পরামর্শ (মানব baseline)।

**Scenario (দুটি সংস্করণ — BD ও US, একই কাঠামো):**
- ঘর: শোবার ঘর (master bedroom), অভ্যন্তরীণ মাপ ১২ ফুট × ১১ ফুট (৩.৬৬ মি × ৩.৩৫ মি), ছাদের উচ্চতা ১০ ফুট।
- দরজা: দেয়াল A-তে, কোণ থেকে ১ ফুট দূরে, ৩ ফুট চওড়া, ভেতরে খোলে।
- জানালা: দেয়াল B-তে (দরজার বিপরীত), ৫ ফুট চওড়া, মেঝে থেকে ৩ ফুট উঁচুতে; grill আছে।
- স্থায়ী বাধা: এক কোণে ১ ফুট × ১.৫ ফুট কলাম; দেয়াল C-তে বৈদ্যুতিক switch board (সরানো যাবে না); AC-র জন্য দেয়াল B-র উপরে জায়গা।
- বাজেট: BD — Tk ১,৫০,০০০ (আসবাব + পর্দা + আলো; শ্রম বাদে); US — $2,500। (এগুলো **পরীক্ষার ইনপুট**, বাজার-গড় নয়।)
- স্টাইল: হালকা কাঠের রং, minimal, পর্যাপ্ত storage।
- প্রয়োজনীয় আইটেম: খাট (স্থানীয় queen মাপ), wardrobe, দুটি side table, পর্দা, একটি ছাদ/দেয়াল বাতি, একটি rug।
- প্রয়োজনীয় output: (১) concept image, (২) মাপসহ layout, (৩) প্রতিটি আইটেমের নির্দিষ্ট কেনা যায় এমন পণ্য (নাম, মাপ, দাম, বিক্রেতা, লিংক), (৪) মোট বাজেট, (৫) বাজেটের মধ্যে বিকল্প, (৬) export/share।

**Scoring rubric (প্রতিটি ১–৫; anchors):**
| মানদণ্ড | ১ (খারাপ) | ৩ (মাঝারি) | ৫ (ভালো) | কীভাবে মাপবেন |
|---|---|---|---|---|
| Visual quality | অবাস্তব/বিকৃত | গ্রহণযোগ্য | পেশাদার মানের | ৩ জন স্বাধীন রেটারের গড় |
| Geometry preservation | দরজা/জানালা/কলাম হারিয়েছে বা সরেছে | ছোট বিচ্যুতি | সব স্থির উপাদান সঠিক | input ছবির সাথে overlay তুলনা |
| Measurement accuracy | কোনো মাপ নেই/ভুল | আনুমানিক | মাপ ±৫ সেমির মধ্যে | layout-এর মাপ বনাম প্রকৃত মাপ |
| Product match accuracy | কোনো বাস্তব পণ্য নেই | "দেখতে একইরকম" পণ্য | হুবহু SKU, মাপ মেলে | প্রতিটি আইটেম লিংক খুলে যাচাই |
| Price transparency | দাম নেই | দাম আছে, তারিখ/উৎস নেই | দাম + উৎস + তারিখ | লিংক থেকে দাম মিলিয়ে দেখা |
| Budget usefulness | বাজেট উপেক্ষিত | মোট আছে | বাজেটে মেলে + বিকল্প | মোট বনাম বাজেট |
| Ease of use | অসমাপ্ত/বিভ্রান্তিকর | সাহায্য নিয়ে সম্পূর্ণ | সহজে সম্পূর্ণ | পর্যবেক্ষকের নোট |
| Export quality | export নেই | ছবি শুধু | মাপসহ PDF/তালিকা | output ফাইল |
| Time required | — | — | — | মিনিটে (কাঁচা সংখ্যা) |
| Total cost | — | — | — | প্রকৃত খরচ (কাঁচা সংখ্যা) |
| Practical usability | এটি দিয়ে কেনা সম্ভব নয় | আংশিক | সরাসরি কেনাকাটা করা সম্ভব | ১ জন বাস্তব ক্রেতার মতামত |

**সংগ্রহ করতে হবে:** স্ক্রিনশট (শর্ত অনুমতি দিলে), সময়, খরচ, প্রতিটি পণ্য লিংক, ত্রুটির তালিকা। **সীমাবদ্ধতা:** এক scenario সব ব্যবহার প্রতিফলিত করে না; free plan-এ সীমিত বৈশিষ্ট্য; পরীক্ষকের দক্ষতা ফলাফলে প্রভাব ফেলে — তাই একই ব্যক্তি সব টুল পরীক্ষা করবেন এবং ক্রম randomise করবেন।

---

## ৬. Customer Segments ও Jobs-to-be-Done

### ৬.১ চাহিদা-প্রমাণের তিন স্তর (Demand-evidence framework)
| স্তর | উদাহরণ | কী প্রমাণ করে | কী প্রমাণ করে না |
|---|---|---|---|
| Level 1 — Stated interest | "ভালো আইডিয়া", survey-তে হ্যাঁ | সমস্যা বোঝা যায় | ব্যবহার বা অর্থপ্রদান |
| Level 2 — Observed engagement | ছবি/মাপ পাঠানো, workflow সম্পূর্ণ করা, ফেরত আসা | প্রকৃত আগ্রহ ও সময় বিনিয়োগ | টাকা দেওয়ার ইচ্ছা |
| Level 3 — Commercial commitment | অগ্রিম পেমেন্ট, deposit, paid pilot চুক্তি | WTP | স্কেলযোগ্য CAC/retention |

**বর্তমান অবস্থা:** এই প্রকল্পের কোনো segment-এর জন্য Level 1, 2 বা 3-এর **সরাসরি** প্রমাণ নেই। শুধু পরোক্ষ বাজার-সংকেত (প্রতিযোগীদের অস্তিত্ব ও মূল্য) আছে।

### ৬.২ Segment তুলনা

| বিষয় | A: বিদ্যমান ঘর পুনঃসজ্জা (গৃহস্থ) | B: সংস্কার পরিকল্পনা (গৃহস্থ) | C: নতুন বাড়ি পরিকল্পনা | D: Interior designer/studio | E: Contractor/builder | F: Retailer/manufacturer | G: Landlord |
|---|---|---|---|---|---|---|---|
| মূল সমস্যা (hypothesis) | কোন পণ্য মাপ ও বাজেটে মিলবে | খরচ অনুমান, উপকরণ, contractor বাছাই | layout, বাজেট, পেশাদার সমন্বয় | দ্রুত ডিজাইন, পণ্য তালিকা, কোটেশন, ক্লায়েন্ট অনুমোদন | estimate, উপকরণ পরিমাণ, কোটেশন | ক্রেতাকে visualise করানো, lead | মেরামত, tenant turnover |
| ঘটনার হার | বিরল (বছরে ≤১; অনুমান) | বিরল (কয়েক বছরে একবার) | জীবনে ১–২ বার | পুনরাবৃত্ত (প্রতি প্রকল্প) | পুনরাবৃত্ত | ধারাবাহিক | পুনরাবৃত্ত |
| ভুল সিদ্ধান্তের খরচ | মাঝারি (ভুল মাপের আসবাব) | উচ্চ | খুব উচ্চ | পেশাদার সুনাম | মার্জিন ক্ষতি | বিক্রি হারানো | মাঝারি |
| কে অর্থ দেয় | গৃহস্থ | গৃহস্থ | গৃহস্থ | studio | contractor | retailer | landlord |
| প্রয়োজনীয় ডেটা | পণ্যের মাপ/দাম/প্রাপ্যতা | উপকরণ ও শ্রম খরচ (দ্রুত বদলায়) | সব কিছু + নিয়মকানুন | পণ্য + supplier দাম | উপকরণ + শ্রম | নিজস্ব catalog (তাদের কাছেই) | সেবা প্রদানকারী |
| আস্থা/দায়ের ঝুঁকি | নিম্ন-মাঝারি | উচ্চ | খুব উচ্চ (কাঠামো, অনুমতি) | মাঝারি | উচ্চ | নিম্ন | মাঝারি |
| পুনরাবৃত্ত আয় | নিম্ন | নিম্ন | নিম্ন | **উচ্চ** | উচ্চ | **উচ্চ** | মাঝারি |
| প্রতিযোগিতা (US) | খুব উচ্চ | উচ্চ | উচ্চ | খুব উচ্চ (Houzz Pro ইত্যাদি) | উচ্চ | উচ্চ (Coohom, Planner 5D B2B) | উচ্চ |
| প্রতিযোগিতা (BD) | নিম্ন-মাঝারি (মানব সেবা, F-commerce) | নিম্ন (প্রথাগত contractor) | নিম্ন (স্থপতি/developer) | **অজানা** | অজানা | **অজানা** | নিম্ন |
| মূল্য দেখাতে সময় | দ্রুত (দিন) | ধীর (সপ্তাহ-মাস) | খুব ধীর | মাঝারি | মাঝারি | মাঝারি | মাঝারি |
| প্রত্যাখ্যানের কারণ | বিনামূল্যের বিকল্প "যথেষ্ট"; দোকানে গিয়ে দেখে কেনার অভ্যাস | অনুমানে আস্থা নেই | professional ছাড়া চলে না | বিদ্যমান টুল/অভ্যাস; ডেটা প্রবেশ ঝামেলা | ঝুঁকি, অভ্যাস | তাদের নিজস্ব IT; ROI অস্পষ্ট | ছোট বাজার |

(সারণির ঘটনার হার ও খরচ সংক্রান্ত ঘরগুলো **ANALYSIS/ASSUMPTION** — কোনো segment-এর জন্য পরিমাপিত তথ্য পাওয়া যায়নি, শুধু US-এ Houzz জরিপে ৯০% গৃহস্থ সংস্কারে পেশাদার নিয়োগ করেছেন — যা B ও C segment-এ "পেশাদারই প্রধান বিকল্প" নির্দেশ করে।)

### ৬.৩ Jobs-to-be-Done (JTBD) বিশ্লেষণ

| Segment | Job statement (hypothesis) | বর্তমান সমাধান (ঢাকা, ANALYSIS) | Hiring trigger |
|---|---|---|---|
| A | "যখন আমি নতুন বাসায় উঠি বা একটি ঘর নতুন করে সাজাতে চাই, আমি নিশ্চিত হতে চাই যে যা কিনব তা ঘরে আঁটবে, দেখতে ভালো লাগবে এবং বাজেটের মধ্যে থাকবে — যাতে টাকা নষ্ট না হয় ও বারবার দোকানে যেতে না হয়।" | শোরুম পরিদর্শন, Facebook পেজ, পরিবার/বন্ধুর পরামর্শ, স্থানীয় কাঠমিস্ত্রি দিয়ে বানানো, Daraz | বাসা বদল, বিয়ে, সন্তান, নতুন ফ্ল্যাট হস্তান্তর, উৎসব |
| D | "যখন ক্লায়েন্ট আমাকে একটি ঘরের কাজ দেয়, আমি দ্রুত কয়েকটি বিকল্প ডিজাইন ও পণ্য/উপকরণসহ বাজেট দেখাতে চাই — যাতে ক্লায়েন্ট দ্রুত অনুমোদন দেয় এবং আমার কম সময় লাগে।" | SketchUp/3ds Max/AutoCAD, Excel BOQ, supplier-এর WhatsApp, নিজস্ব অভিজ্ঞতা | নতুন প্রকল্প, ক্লায়েন্টের পরিবর্তন অনুরোধ |
| F | "আমি চাই ক্রেতা আমার পণ্য তার ঘরে কেমন দেখাবে তা দেখে আত্মবিশ্বাসের সাথে কিনুক — যাতে বিক্রি বাড়ে ও ফেরত কমে।" | শোরুম, Facebook ছবি, salesperson | — |

### ৬.৪ Customer interview guides (non-leading)

**সাধারণ নিয়ম:** অতীতের প্রকৃত আচরণ জিজ্ঞাসা করুন; আমাদের ধারণা বা "AI platform" উল্লেখ করবেন না যতক্ষণ না শেষ পর্যায়; প্রতিটি সাক্ষাৎকার ৩০–৪৫ মিনিট; সম্মতি নিয়ে রেকর্ড; একই template-এ নোট।

**গাইড ১ — গৃহস্থ (Segment A/B)**
1. গত ২–৩ বছরে আপনি কোনো ঘর সাজিয়েছেন বা সংস্কার করেছেন? সর্বশেষটির কথা বলুন।
2. কী কারণে কাজটি শুরু করলেন? (trigger)
3. প্রথমে কী করেছিলেন? কোথা থেকে ধারণা নিয়েছিলেন?
4. সবচেয়ে কঠিন সিদ্ধান্ত কোনটি ছিল? কেন?
5. মাপ কীভাবে নিয়েছিলেন? কোনো আসবাব কি ঘরে আঁটেনি বা ভুল মাপের হয়েছিল?
6. পণ্য ও দাম কোথা থেকে জেনেছিলেন? কয়টি দোকান/পেজ দেখেছিলেন? কত সময় লেগেছিল?
7. বাজেট কীভাবে ঠিক করেছিলেন? শেষে কত খরচ হয়েছে বাজেটের তুলনায়?
8. কিছু কি ভুল হয়েছিল? তাতে কত টাকা বা সময় নষ্ট হয়েছিল?
9. কোনো পেশাদার (designer, কাঠমিস্ত্রি, contractor) নিয়েছিলেন? কীভাবে খুঁজেছিলেন? কত দিয়েছিলেন?
10. কোনো app, ওয়েবসাইট বা সেবার জন্য কখনো টাকা দিয়েছেন? কোনটা?
11. পরের বার কী ভিন্নভাবে করবেন?
12. (শেষে) কেউ যদি আপনাকে ঘরের মাপ অনুযায়ী পণ্যের তালিকা দিত, কোন তথ্য দেখলে আপনি তা বিশ্বাস করতেন না?
13. আপনার কাজের কোনো ছবি, তালিকা বা কোটেশন দেখাতে পারবেন? (সম্মতি সাপেক্ষে)

**গাইড ২ — Interior designer/studio (Segment D)**
1. আপনার সর্বশেষ residential প্রকল্পটি শুরু থেকে শেষ পর্যন্ত কীভাবে হয়েছিল?
2. ক্লায়েন্টকে প্রথম প্রস্তাব দিতে কত সময় লাগে? কোন অংশে সবচেয়ে বেশি সময় যায়?
3. পণ্য/উপকরণের দাম কোথা থেকে নেন? কত ঘন ঘন দাম পুরোনো হয়ে যায়?
4. BOQ/কোটেশন কীভাবে বানান? কোন software?
5. ক্লায়েন্ট কত বার পরিবর্তন চায়? তাতে কী ঝামেলা হয়?
6. কোন software/subscription-এ বর্তমানে কত টাকা খরচ করেন? কে সিদ্ধান্ত নেয়?
7. supplier-রা কি আপনাকে commission দেয়? (সংবেদনশীল — ঐচ্ছিক)
8. গত বছর কোনো প্রকল্প কি বাজেট বা সময়ের কারণে হারিয়েছেন?
9. একটি নতুন টুল চেষ্টা করতে কী বাধা?

**গাইড ৩ — Furniture retailer/manufacturer (Segment F ও ডেটা partner)**
1. অনলাইনে আপনার বিক্রি কীভাবে হয় (ওয়েবসাইট, Facebook, Daraz, শোরুম)?
2. ক্রেতা কেনার আগে কোন প্রশ্নগুলো সবচেয়ে বেশি করে (মাপ, রং, ডেলিভারি)?
3. কত শতাংশ পণ্য ফেরত/বিনিময় হয় মাপ বা প্রত্যাশা না মেলায়?
4. পণ্যের তথ্য (মাপ, দাম, স্টক) কোথায় রাখেন? কে হালনাগাদ করে? কত ঘন ঘন?
5. অন্য প্ল্যাটফর্মে আপনার পণ্যের তথ্য দেখানোর বিষয়ে আপনার নীতি কী? ছবির মালিক কে?
6. কোনো referral/affiliate বা বিক্রয় কমিশন দেন? কোন শর্তে?
7. যোগ্য ক্রেতা (qualified lead) পেতে বর্তমানে কত খরচ করেন?

**রেকর্ডিং পদ্ধতি:** প্রতিটি সাক্ষাৎকারের পরে একটি স্প্রেডশিট সারি: segment, trigger, শেষ প্রকল্পের ব্যয়, সময়, ব্যবহৃত টুল/সেবা, অতীতে অর্থপ্রদান (হ্যাঁ/না, কত), সবচেয়ে বড় কষ্ট (উদ্ধৃতি), বিপরীত প্রমাণ (সমস্যা নেই বলে মনে হলে আলাদা কলাম), demand-evidence স্তর।

**নমুনা আকার:** প্রতিটি অগ্রাধিকার segment-এ ১০–১৫ জন (মোট ২০–৩০)। এটি **exploratory** গবেষণা — পরিসংখ্যানগতভাবে প্রতিনিধিত্বমূলক নয়; উদ্দেশ্য হলো সমস্যার ধরন, ভাষা ও বিদ্যমান ব্যয়ের প্যাটার্ন খোঁজা। নিয়োগ: শুধু বন্ধু/পরিবার নয়; অন্তত অর্ধেক অপরিচিত (Facebook গ্রুপ, শোরুমের বাইরে, designer রেফারেল), নইলে ইতিবাচক bias বাড়বে।

### ৬.৫ Segment অগ্রাধিকার ও sensitivity analysis

> নিচের রেটিং **বিচারভিত্তিক (subjective judgement)**, পরিমাপিত নয়। H=অনুকূল, M=মাঝারি, L=প্রতিকূল, ?=অজানা। শুধু শীর্ষ চারটি প্রার্থী দেখানো হলো (C, E, G প্রথম পর্যায়ে বাদ — উচ্চ দায়/ধীর মূল্য/অপ্রাসঙ্গিক)।

| মানদণ্ড | A (গৃহস্থ পুনঃসজ্জা) | B (সংস্কার) | D (designer) | F (retailer) | ভিত্তি |
|---|---|---|---|---|---|
| সমস্যার তীব্রতা | ? | M (US জরিপে উচ্চ ব্যয়) | ? | ? | মূলত অজানা |
| ব্যবহার ঘনত্ব | L | L | H | H | কাঠামোগত যুক্তি |
| বিদ্যমান ব্যয় | M (Havenly/Sheraspace আছে) | H (পেশাদার নিয়োগ) | M | M | পরোক্ষ |
| WTP প্রমাণ | L | L | L | L | কোনো সরাসরি প্রমাণ নেই |
| পৌঁছানো সহজ | M (Facebook) | M | H (সংখ্যায় কম, চিহ্নিতযোগ্য) | H | ASSUMPTION |
| ডেটা প্রাপ্যতা | M | L (দাম অস্থির) | M (designer-এর নিজস্ব supplier) | H (নিজস্ব catalog) | আংশিক FACT |
| প্রযুক্তিগত জটিলতা | M | H | M | M | ANALYSIS |
| আস্থা/দায় ঝুঁকি | H (কম ঝুঁকি) | L | M | H | ANALYSIS |
| মূল্য দেখানোর সময় | H | L | M | M | ANALYSIS |
| পুনরাবৃত্ত আয় | L | L | H | H | কাঠামোগত |
| vision-এ সম্প্রসারণ | H | H | M | M | ANALYSIS |

**Sensitivity (ওজন বদলালে কী হয়):**
- **দ্রুত শেখা ও কম দায়** বেশি গুরুত্ব পেলে → **A** এগিয়ে।
- **পুনরাবৃত্ত আয় ও কম CAC** বেশি গুরুত্ব পেলে → **D** বা **F** এগিয়ে।
- **ডেটা প্রাপ্যতা** সর্বোচ্চ গুরুত্ব পেলে → **F** (retailer-দের নিজস্ব catalog)।
- **vision-এর সাথে সংযোগ** সর্বোচ্চ হলে → A বা B।
- **উপসংহার:** পছন্দ ওজনের উপর অত্যন্ত সংবেদনশীল এবং WTP সব segment-এ অজানা → **একটি segment বেছে নেওয়ার মতো প্রমাণ নেই।** সুপারিশ: A ও D-কে সমান্তরালে সাক্ষাৎকারে তুলনা, এবং F-কে ডেটা-partner আলোচনার অংশ হিসেবে পরীক্ষা (সবচেয়ে ছোট পরীক্ষা যা অনিশ্চয়তা কমায়)।

---

## ৭. প্রাথমিক বাজার ও ভূগোল মূল্যায়ন (Country Selection)

### ৭.১ দেশভিত্তিক তথ্য সারসংক্ষেপ

| বিষয় | বাংলাদেশ | United States | United Kingdom | Australia |
|---|---|---|---|---|
| বাজার প্রেক্ষাপট | ফার্নিচার শিল্প Tk 25,000–30,000 কোটি (সংবাদ উদ্ধৃতি; পদ্ধতি অজানা); interior বাজার "Tk 20,000 কোটির বেশি" (Daily Star ২০২৫; পদ্ধতি অজানা) | মালিক-অধিকৃত সংস্কার ~$518B (২০২৬ প্রক্ষেপণ, JCHS) | Houzz UK: median £21,440, ৯৪% পেশাদার নিয়োগ (Houzz ব্যবহারকারী) | A&A মূল্য AUD 14.5B (২০২৫, ABS-ভিত্তিক FWPA); housing ব্যয়ের ৩৭% |
| ডিজিটাল গ্রহণ | ১৩৫.৯M internet subscription (৮৯% mobile); BBS: ৫৪.৮% পরিবারে internet | উচ্চ (এই রাউন্ডে উৎস সংগ্রহ হয়নি) | উচ্চ (উৎস সংগ্রহ হয়নি) | উচ্চ (উৎস সংগ্রহ হয়নি) |
| প্রতিযোগী শক্তি | AI-native প্রতিযোগী not found; মানব সেবা (Sheraspace, studio), F-commerce | খুব উচ্চ (IKEA, Wayfair, Houzz, Havenly, ChatGPT, Angi, Thumbtack) | উচ্চ (Houzz UK, IKEA, ChatGPT) | উচ্চ (IKEA, Houzz AU) |
| পণ্য ডেটা প্রবেশাধিকার | কোনো retailer API/feed/affiliate পাওয়া যায়নি; Daraz affiliate আছে (হার অযাচাইকৃত); হাতে সংগ্রহ বা চুক্তি লাগবে | Affiliate network (Amazon ৩–৪%, Wayfair ৫–৭% অযাচাইকৃত), কিন্তু কঠোর caching শর্ত; retailer-রা বড় AI-কে feed দিচ্ছে | Affiliate network বিদ্যমান (বিস্তারিত যাচাই হয়নি) | একই (যাচাই হয়নি) |
| নির্মাণ খরচ ডেটা | PWD SoR 2022 (সরকারি কাজের হার, বাজারদর নয়); দাম অস্থির | বহু বাণিজ্যিক উৎস (যাচাই হয়নি); BLS wage data ব্যবহার করে app আছে | যাচাই হয়নি | যাচাই হয়নি |
| পেমেন্ট | bKash, SSLCommerz (~১.১৫–২.৫% উৎসভেদে); recurring billing সমর্থন অজানা | পরিপক্ব | পরিপক্ব | পরিপক্ব |
| গোপনীয়তা আইন | PDPO 2025 (অনুমোদিত; কার্যকারিতা আইনজীবী দিয়ে নিশ্চিত করতে হবে) | রাজ্যভিত্তিক আইন + FTC (গবেষণা বাকি) | UK GDPR, DMCC Act 2024 | Privacy Act + ২০২৪ সংশোধনী (tort ২০২৫; automated decision প্রকাশ ডিসেম্বর ২০২৬) |
| ভোক্তা সুরক্ষা | Consumer Rights Protection Act 2009; Digital Commerce Guidelines 2021 | FTC Act §5, Endorsement Guides | DMCC Act (drip pricing, fake reviews এপ্রিল ২০২৫ থেকে) | ACL (গবেষণা বাকি) |
| ভাষা | বাংলা প্রয়োজন (Sheraspace বাংলা সাইট চালু করেছিল) | English | English | English |
| WTP সংকেত | কম পরম মূল্য; Tk 2,800/session (২০২০–২২) | $159/room (Havenly); app $5–$30/মাস | Houzz UK-এ উচ্চ পেশাদার নিয়োগ | যাচাই হয়নি |
| ঝুঁকি | কম ক্রয়ক্ষমতা; ২০২৫-এ ফ্ল্যাট বিক্রি কমেছে; দাম অস্থির; ডেটা নিজে সংগ্রহ | CAC অত্যন্ত উচ্চ (ASSUMPTION); বিনামূল্যের বিকল্প | একই | একই |

### ৭.২ স্বচ্ছ country scorecard

> **Missing score নীতি:** কোনো মানদণ্ডে প্রমাণ না থাকলে "?" — শূন্য নয় এবং গড় নয়। যে দেশে বেশি "?" আছে তাকে অন্যায়ভাবে এগিয়ে বা পিছিয়ে না দেওয়ার জন্য **সংখ্যাগত মোট স্কোর গণনা করা হয়নি।** শুধু গুণগত রেটিং (H/M/L) ও আস্থা দেওয়া হলো।

| মানদণ্ড | ওজন (প্রস্তাবিত) | BD | US | UK | AU | আস্থা | কী স্কোর বদলাবে |
|---|---|---|---|---|---|---|---|
| গ্রাহক সমস্যা ও চাহিদা | উচ্চ | ? | M (বড় ব্যয়, কিন্তু বিকল্প প্রচুর) | M | M | নিম্ন | সাক্ষাৎকার |
| গ্রাহকে পৌঁছানো | উচ্চ | M (Facebook-কেন্দ্রিক; founder-এর নেটওয়ার্ক?) | L (ব্যয়বহুল) | L | L | নিম্ন | CAC পরীক্ষা |
| প্রতিযোগিতা (কম = ভালো) | উচ্চ | H | L | L | L-M | মাঝারি | স্থানীয় প্রতিযোগী অনুসন্ধান |
| ডেটা প্রস্তুতি | উচ্চ | L (সংগঠিত feed নেই) | H (feed আছে) | H | M-H | মাঝারি | ডেটা অডিট |
| ডেটা লাইসেন্স সম্ভাব্যতা | উচ্চ | ? (চুক্তি সম্ভব কিনা অজানা) | M (affiliate, কিন্তু কঠোর শর্ত) | M | M | নিম্ন | retailer আলোচনা |
| Partner প্রাপ্যতা | মাঝারি | ? (founder-এর সম্পর্কের উপর নির্ভর) | M | M | M | নিম্ন | founder তথ্য |
| Monetisation সম্ভাবনা | উচ্চ | L-M (কম পরম মূল্য) | H (মূল্যস্তর উচ্চ) | H | H | মাঝারি | paid pilot |
| CAC | উচ্চ | ? (সম্ভবত কম পরম খরচ) | ? (সম্ভবত উচ্চ) | ? | ? | নিম্ন | বিজ্ঞাপন পরীক্ষা |
| নিয়ন্ত্রক বোঝা | মাঝারি | M (PDPO নতুন, অনিশ্চিত) | M | M-H | M | মাঝারি | আইনি পরামর্শ |
| Localisation জটিলতা | মাঝারি | M (বাংলা, Tk) | L | L | L | উচ্চ | — |
| পরিচালন সম্ভাব্যতা | উচ্চ | ? (founder-এর অবস্থানের উপর) | ? | ? | ? | নিম্ন | founder তথ্য |
| সম্প্রসারণ সম্ভাবনা | মাঝারি | M (দক্ষিণ এশিয়ার অনুরূপ বাজার — ASSUMPTION) | H | M | M | নিম্ন | — |

### ৭.৩ Sensitivity analysis (দেশ)
| পরিস্থিতি | কোন দেশ এগিয়ে | যুক্তি |
|---|---|---|
| ডেটা প্রস্তুতি বাজার আকারের চেয়ে গুরুত্বপূর্ণ | US/UK (ডেটা সহজ) — **কিন্তু** তখন পার্থক্যও কম, কারণ সবাই একই feed পায় | স্ববিরোধ: সহজ ডেটা = কম moat |
| CAC প্রধান সীমাবদ্ধতা | BD (যদি founder স্থানীয় হন) | স্থানীয় নেটওয়ার্ক, কম বিজ্ঞাপন খরচ (ASSUMPTION) |
| Founder-এর একটি দেশে partner আছে | সেই দেশ | Partner = ডেটা + বিতরণ |
| সীমিত মূলধন | BD (পরীক্ষার খরচ কম — ASSUMPTION) বা US-এ শুধু অনলাইন B2B niche | — |
| প্রথম পণ্য B2B | BD (designer/retailer — প্রতিযোগিতা অজানা) বা US-এ সরাসরি Houzz Pro-র সাথে লড়াই | US B2B design software পরিপক্ব |
| মূল্যস্তর সর্বোচ্চ গুরুত্ব | US/UK/AU | WTP পরম মূল্যে বেশি |

### ৭.৪ দেশ নির্বাচন সিদ্ধান্ত
- **প্রমাণ একটি দেশ চূড়ান্তভাবে বেছে নেওয়ার জন্য যথেষ্ট নয়।**
- **প্রধান প্রার্থী (যাচাইয়ের জন্য): বাংলাদেশ, ঢাকা শহর।** শর্ত: founder ঢাকায় উপস্থিত বা সেখানে কাজ করার সক্ষমতা আছে (founder decision F1)।
- **বিকল্প প্রার্থী:** US — শুধুমাত্র তখনই যদি founder একটি সংকীর্ণ niche (যেমন একটি নির্দিষ্ট পেশাদার গোষ্ঠী) ও বিতরণ চ্যানেলে প্রবেশাধিকার দেখাতে পারেন।
- **সবচেয়ে সস্তা প্রমাণ সংগ্রহ:** ঢাকায় সাক্ষাৎকার + ডেটা অডিট + concierge (বিভাগ ১৫); US-এর জন্য একই সময়ে কেবল desk-ভিত্তিক তুলনা চালিয়ে যাওয়া (খরচ ছাড়া)।
- **সিদ্ধান্ত নিয়ম (প্রস্তাবিত, founder অনুমোদনসাপেক্ষ):** ঢাকায় (১) অন্তত দুটি segment-এর একটিতে সমস্যা ও অতীত ব্যয়ের ধারাবাহিক প্রমাণ, (২) ডেটা অডিটে founder-নির্ধারিত সম্পূর্ণতা সীমা অর্জন, এবং (৩) পূর্বনির্ধারিত মূল্যে অন্তত কয়েকটি paid concierge project — তিনটিই পূরণ হলে ঢাকায় পরবর্তী ধাপ; না হলে বিভাগ ১৭-এর REVISE/STOP যুক্তি প্রয়োগ।

### ৭.৫ Global expansion নীতি
একটি দেশকে "supported" বলা যাবে তখনই যখন নিচের সবগুলো সত্য — শুধু মুদ্রা বা ভাষা যোগ করা যথেষ্ট নয়:
1. **Global product architecture:** একই core workflow ও ডেটা মডেল (দেশ-নিরপেক্ষ)।
2. **Country data coverage:** লক্ষ্য ক্যাটাগরিতে founder-নির্ধারিত সীমা পর্যন্ত যাচাইকৃত পণ্য ডেটা, পরিমাপিত staleness হার সহ।
3. **Country integrations:** অন্তত কয়েকটি লিখিত-অনুমতিপ্রাপ্ত ডেটা উৎস।
4. **Local partnerships:** retailer/designer partner নিশ্চিত (লিখিত)।
5. **Legal readiness:** স্থানীয় আইনজীবীর পর্যালোচনা (privacy, consumer, affiliate disclosure, tax)।
6. **Support readiness:** স্থানীয় ভাষায় সহায়তা ও refund প্রক্রিয়া।
7. **Unit economics:** সেই দেশে পরিমাপিত positive contribution margin।

---

## ৮. Global Data Engine সম্ভাব্যতা ও ডেটা অধিকার (Data Rights)

### ৮.১ মূল নীতি
তিনটি আলাদা প্রশ্ন — প্রতিটি উৎসের জন্য আলাদাভাবে উত্তর দিতে হবে:
1. **তথ্য আছে কি?** (information exists)
2. **প্রযুক্তিগতভাবে পাওয়া যায় কি?** (technical access — API, feed, পাতা)
3. **বাণিজ্যিকভাবে ব্যবহার, সংরক্ষণ ও পুনঃপ্রকাশের অনুমতি আছে কি?** (legal permission)

একটি পাবলিক ওয়েবসাইটে দাম দেখা যাওয়া মানে (৩) নম্বরের উত্তর "হ্যাঁ" নয়।

### ৮.২ ডেটা উৎস ও লাইসেন্সিং matrix

| উৎস | মালিক | কভারেজ | প্রবেশাধিকার | বাণিজ্যিক ব্যবহার | Store/cache | পুনঃপ্রকাশ | সীমাবদ্ধতা / ঝুঁকি | Status |
|---|---|---|---|---|---|---|---|---|
| Amazon Creators API (PA-API 5-এর উত্তরসূরি) | Amazon | Amazon marketplace-ভিত্তিক (দেশভেদে আলাদা) | Associates অ্যাকাউন্ট; তৃতীয় পক্ষ অনুযায়ী গত ৩০ দিনে ১০টি qualified sale | শুধু affiliate উদ্দেশ্যে (শর্তসাপেক্ষ) | তৃতীয় পক্ষ অনুযায়ী: ছবি cache নিষেধ, link ২৪ ঘণ্টা; দাম ≥প্রতি ২৪ ঘণ্টায় হালনাগাদ | Amazon শর্ত অনুযায়ী সীমিত | নতুন প্ল্যাটফর্মের sales-threshold সমস্যা; BD marketplace নেই (A6) | Partially Verified |
| Wayfair affiliate (CJ) | Wayfair | US/কিছু দেশ | CJ অ্যাকাউন্ট | affiliate | অজানা | অজানা | হার ৫–৭% (অযাচাইকৃত); cookie ৭ দিন | Unverified |
| Daraz affiliate | Daraz Bangladesh Ltd | BD (Daraz-এ বিক্রিত পণ্য) | অ্যাকাউন্ট | affiliate | অজানা | অজানা | হার অযাচাইকৃত (home ২–৫% দাবি); ফার্নিচারের মাপ/মান অসংগত হতে পারে | Unverified |
| Agentic commerce feed (OpenAI ACP, Google UCP) | Merchant → AI platform | মূলত US | merchant-রা AI platform-কে দেয় | তৃতীয় startup-এর জন্য নয় | NA | NA | এটি startup-এর ডেটা উৎস নয়, বরং প্রতিযোগীর সুবিধা | Partially Verified |
| Planner 5D B2B API | Planner 5D | বৈশ্বিক | বাণিজ্যিক চুক্তি | চুক্তিসাপেক্ষ | চুক্তিসাপেক্ষ | — | শর্ত ও মূল্য অজানা | Partially Verified (অস্তিত্ব) |
| BD retailer ওয়েবসাইট (Navana, HATIL, Regal ইত্যাদি) | প্রতিটি retailer | BD | পাবলিক পাতা; API/feed not found | **অনুমতি ছাড়া ধরে নেওয়া যাবে না** | চুক্তি প্রয়োজন | ছবি/বর্ণনা — retailer-এর কপিরাইট সম্ভাব্য | Scraping-এর আইনগত অবস্থা ও site terms পর্যালোচনা প্রয়োজন | Unverified |
| লিখিত retailer/supplier চুক্তি | চুক্তি অনুযায়ী | চুক্তি অনুযায়ী | আলোচনা | চুক্তি অনুযায়ী | চুক্তি অনুযায়ী | চুক্তি অনুযায়ী | **সবচেয়ে টেকসই কিন্তু ধীর ও সম্পর্ক-নির্ভর** | পরীক্ষা বাকি |
| PWD Schedule of Rates 2022 (+revised) | GoB (PWD) | BD সরকারি কাজ | প্রকাশিত নথি | সরকারি নথি — পুনর্ব্যবহারের শর্ত যাচাই প্রয়োজন | — | — | সরকারি tender হার, বাজারের খুচরা বা contractor কোটেশন নয়; ২০২২ ভিত্তি; দাম দ্রুত বদলায় | Partially Verified |
| Google Maps Platform | Google | বৈশ্বিক | API key, বাণিজ্যিক মূল্য | শর্তসাপেক্ষ | lat/lng সর্বোচ্চ ৩০ দিন; place_id cache অনুমোদিত | সীমিত | শুধু Google map-এ প্রদর্শন সংক্রান্ত শর্ত পর্যালোচনা প্রয়োজন | Partially Verified |
| OpenStreetMap | OSM contributors | বৈশ্বিক | উন্মুক্ত | ODbL (attribution ও share-alike) | হ্যাঁ (শর্তসাপেক্ষ) | share-alike শর্ত | এই রাউন্ডে official উৎস পড়া হয়নি | Unverified |
| গ্রাহক-প্রদত্ত ডেটা (ছবি, মাপ, রসিদ) | গ্রাহক | — | সম্মতি | সম্মতির পরিধি অনুযায়ী | retention নীতি অনুযায়ী | না (সম্মতি ছাড়া) | PDPO 2025/GDPR — training-এ ব্যবহারের জন্য আলাদা সম্মতি প্রয়োজন হতে পারে | নীতি নির্ধারণ বাকি |

### ৮.৩ পণ্য ডেটার attribute — MVP-তে কী অপরিহার্য

| Attribute | MVP (concierge) | পরে | কারণ |
|---|---|---|---|
| পণ্যের নাম, ব্র্যান্ড/বিক্রেতা, model/SKU (যদি থাকে) | অপরিহার্য | — | identity ছাড়া "বাস্তব পণ্য" দাবি করা যায় না |
| মাপ (W×D×H) ও একক | অপরিহার্য | — | মূল মূল্য-প্রস্তাব: ঘরে আঁটবে কিনা |
| দাম, মুদ্রা, "দাম দেখার তারিখ" | অপরিহার্য | — | বাজেট |
| প্রাপ্যতা (stock/made-to-order) ও lead time | অপরিহার্য | — | Navana-র মতো "made to order" সাধারণ |
| পণ্যের URL/শোরুম | অপরিহার্য | — | যাচাইযোগ্যতা |
| উপকরণ/finish/রং | অপরিহার্য (সংক্ষিপ্ত) | বিস্তারিত পরে | স্টাইল মিল |
| ডেলিভারি এলাকা ও ফি | গুরুত্বপূর্ণ | — | মোট খরচ |
| ছবি | ঐচ্ছিক (লিংক) | লাইসেন্স পেলে | কপিরাইট ঝুঁকি |
| Return policy, warranty | পরে | হ্যাঁ | — |
| Tax treatment | পরে | হ্যাঁ | BD খুচরা মূল্য সাধারণত VAT-সহ (ASSUMPTION — যাচাই প্রয়োজন) |
| Assembly/compatibility | পরে | হ্যাঁ | — |

### ৮.৪ নির্মাণ ও সংস্কার ডেটা — মূল্যের ধরন আলাদা রাখা
| মূল্যের ধরন | অর্থ | কোথায় ব্যবহারযোগ্য | কোথায় নয় |
|---|---|---|---|
| সরকারি Schedule of Rates (PWD) | সরকারি কাজের tender-এর ভিত্তিমূল্য (নির্দিষ্ট বছর, specification) | ঐতিহাসিক তুলনা, আনুমানিক range-এর একটি নোঙর | গৃহস্থের বর্তমান কোটেশন হিসেবে |
| Supplier list price | প্রস্তুতকারক/পরিবেশকের তালিকা মূল্য | উপকরণ তুলনা | চূড়ান্ত খরচ (পরিবহন, ছাড়, শ্রম বাদ) |
| খুচরা মূল্য | দোকানের দাম (তারিখসহ) | পণ্য বাজেট | পাইকারি/প্রকল্প মূল্য |
| পাইকারি মূল্য | বড় পরিমাণে | contractor-এর হিসাব | গৃহস্থের ছোট কেনাকাটা |
| Contractor quotation | নির্দিষ্ট scope-এর প্রস্তাব | প্রকৃত তুলনার সর্বোত্তম ভিত্তি | অন্য scope-এ সরাসরি প্রয়োগ |
| ঐতিহাসিক লেনদেন | অতীতের প্রকৃত দাম | প্রবণতা | বর্তমান দাম |
| চূড়ান্ত প্রকল্প খরচ | সব মিলিয়ে প্রকৃত ব্যয় | estimate-এর নির্ভুলতা মাপা | ভিন্ন প্রকল্পে অন্ধ প্রয়োগ |

**প্রতিটি খরচ-রেকর্ডে লাগবে:** তারিখ, স্থান, একক, মান/grade, scope (শ্রম/পরিবহন/অপচয়/VAT অন্তর্ভুক্ত কিনা), উৎস।
**FACT-ভিত্তিক সতর্কতা:** BD-তে রড ১০ দিনে Tk10,000/টন পর্যন্ত বেড়েছে (২০২৬) — অর্থাৎ নির্মাণ উপকরণের ক্ষেত্রে সপ্তাহ-পুরোনো দামও বিভ্রান্তিকর হতে পারে। একজন স্থপতির মতে interior কাজ ~Tk 2,000/বর্গফুট "কিছু ক্ষেত্রে" — এটি একটি মন্তব্য, benchmark নয়।

### ৮.৫ স্থানীয় নিয়মকানুন (Regulation) সনাক্তকরণ
- ঢাকায় ভবন অনুমতি RAJUK দেয়; ব্যবহার-পরিবর্তনে অনুমোদন লাগে (Dhanmondi ঘটনা); অনুমোদিত নকশা লঙ্ঘন ব্যাপক (RAJUK-উদ্ধৃত "১০টির মধ্যে ৯টি")। ঢাকার বাইরে ভিন্ন কর্তৃপক্ষ (CDA, KDA, পৌরসভা — এই রাউন্ডে যাচাই হয়নি)।
- **Interior renovation-এ আলাদা অনুমতি লাগে কিনা — Insufficient Evidence।** BNBC 2020-এর alteration বিধান পড়া হয়নি।
- **সিদ্ধান্ত:** MVP কোনো কাঠামোগত, বৈদ্যুতিক, প্লাম্বিং বা অনুমতি-সংক্রান্ত পরামর্শ দেবে না। ভবিষ্যতে নিয়ম-রেকর্ডে লাগবে: দেশ, অঞ্চল/শহর, কর্তৃপক্ষ, ভবনের ধরন, নিয়মের সংস্করণ, কার্যকর তারিখ, উৎস নথি, "পেশাদার ব্যাখ্যা প্রয়োজন" flag।

### ৮.৬ ডেটা মান ও provenance মডেল (ধারণাগত — schema নয়)

প্রস্তাবিত ক্ষেত্রগুলোর প্রয়োজনীয়তা বিশ্লেষণ:
| ক্ষেত্র | প্রয়োজন কেন | MVP-তে (স্প্রেডশিটে) |
|---|---|---|
| record_id, entity_type (product/price/cost/service/regulation) | পরিচয় ও ধরন | হ্যাঁ |
| country_code, region_or_city | স্থানীয়তা | হ্যাঁ (শুধু ঢাকা) |
| source_name, source_reference (URL/চুক্তি নং) | যাচাইযোগ্যতা | হ্যাঁ |
| collected_at, last_checked_at | freshness | হ্যাঁ |
| effective_from / effective_to | মূল্য/নিয়মের মেয়াদ | price-এর জন্য ঐচ্ছিক; নিয়মের জন্য অপরিহার্য |
| currency, unit_of_measure, tax_treatment | তুলনাযোগ্যতা | হ্যাঁ |
| verification_status (নিচের ৭টি অবস্থা) | আস্থা প্রকাশ | হ্যাঁ |
| license_status, usage_restrictions | আইনি নিরাপত্তা | হ্যাঁ — **সবচেয়ে উপেক্ষিত কিন্তু জরুরি** |
| staleness_policy | কখন পুনরায় যাচাই | পরিমাপের পরে নির্ধারণ |
| quality_note, change history | নিরীক্ষা | ঐচ্ছিক |

**ANALYSIS:** MVP পর্যায়ে এটি একটি স্প্রেডশিটে রাখা যথেষ্ট। Database নকশা ডেটা অডিট ও workflow স্থির হওয়ার পরে।

### ৮.৭ দামের নির্ভরযোগ্যতা প্রকাশ (Price reliability states)
| অবস্থা | গ্রাহককে কী দেখানো হবে |
|---|---|
| ১. Current verified price | "Tk X — [বিক্রেতা], [তারিখ]-এ যাচাইকৃত" |
| ২. Published price with known date | "Tk X — [উৎস]-এ [তারিখ]-এ প্রকাশিত; বর্তমান দাম ভিন্ন হতে পারে" |
| ৩. Supplier quotation | "Tk X — [সরবরাহকারী]-র কোটেশন, মেয়াদ [তারিখ] পর্যন্ত" |
| ৪. Estimated range | "আনুমানিক Tk X–Y; ভিত্তি: [অনুমানগুলো]" |
| ৫. Historical price | "[তারিখ]-এ Tk X ছিল; বর্তমান দাম অজানা" |
| ৬. Unverified | "দাম যাচাই করা যায়নি" |
| ৭. Unavailable | "তথ্য পাওয়া যায়নি" — **কখনো চুপচাপ পুরোনো দাম ব্যবহার নয়** |

**Freshness নিয়ম:** কোনো সর্বজনীন মেয়াদ উদ্ভাবন করা হচ্ছে না। পরিবর্তে **পরিমাপ:** অডিটের একই নমুনা ২ ও ৪ সপ্তাহ পরে পুনরায় পরীক্ষা করে প্রতিটি attribute-এর (দাম, স্টক, মাপ) পরিবর্তন-হার মাপা হবে; সেই হার থেকে ক্যাটাগরি-ভিত্তিক মেয়াদ প্রস্তাব করা হবে। (Amazon-এর ক্ষেত্রে চুক্তিগত ২৪ ঘণ্টা নিয়ম আলাদা — এটি চুক্তির শর্ত, বাজারের পরিবর্তন-হার নয়।)

### ৮.৮ ডেটা সম্ভাব্যতা অডিট (Data Feasibility Audit) নকশা
- **পরিধি:** ঢাকা; একটি ক্যাটাগরি গুচ্ছ — শোবার ঘরের আসবাব (খাট, wardrobe, side table) — কারণ এগুলোর মাপ fit-check-এ সবচেয়ে গুরুত্বপূর্ণ এবং বাজেটের বড় অংশ (ASSUMPTION)।
- **নমুনা:** ৫০–১০০টি পণ্য, অন্তত ৫–৬টি ভিন্ন উৎস থেকে (বড় ব্র্যান্ডের ওয়েবসাইট, Daraz, Facebook-ভিত্তিক নির্মাতা, শোরুম পরিদর্শন)। কেন এই আকার: এক ব্যক্তি ১–২ সপ্তাহে হাতে করতে পারে; প্রতিটি উৎস থেকে যথেষ্ট সংখ্যা যাতে উৎসভেদে সম্পূর্ণতার পার্থক্য দেখা যায়। এটি পরিসংখ্যানগত অনুমানের জন্য নয়, সম্ভাব্যতা যাচাইয়ের জন্য।
- **প্রতিটি পণ্যের জন্য রেকর্ড:** identity, মাপ, দাম, মুদ্রা/VAT, প্রাপ্যতা, ডেলিভারি, উৎস-অনুমতি (site terms/লিখিত অনুমতি), তারিখ, আস্থা।
- **মাপকাঠি:** (১) সম্পূর্ণ রেকর্ডের শতাংশ (মাপ + দাম + প্রাপ্যতা সব আছে); (২) প্রতি পণ্যে হাতে সংগ্রহের সময় (মিনিট); (৩) ২ ও ৪ সপ্তাহে পরিবর্তন-হার; (৪) কতগুলো উৎসের terms বাণিজ্যিক পুনর্ব্যবহার অনুমতি দেয় বা লিখিত অনুমতি দিতে রাজি।
- **গ্রহণযোগ্যতার সীমা (প্রস্তাব — founder অনুমোদন সাপেক্ষ, পরীক্ষার আগে স্থির করতে হবে):** যেমন "≥৭০% পণ্যে মাপ + দাম দুটোই যাচাইযোগ্য" এবং "অন্তত ২টি উৎস লিখিতভাবে ডেটা ব্যবহারের অনুমতি দিতে রাজি"। এই সংখ্যাগুলো উদাহরণ; কোনো শিল্প-মানদণ্ড থেকে নেওয়া নয়।
- **সিদ্ধান্ত:** অডিট সফল না হলে কোনো বড় catalog বানানো হবে না।

### ৮.৯ ডেটা আর্কিটেকচার কৌশল (ধারণাগত)
| বিকল্প | সুবিধা | অসুবিধা | উপযুক্ততা |
|---|---|---|---|
| ১. একক কেন্দ্রীয় global catalog | সরলতা | দেশভেদে পণ্য, দাম, অধিকার আলাদা — বাস্তবসম্মত নয় | না |
| ২. দেশভিত্তিক আলাদা catalog | স্থানীয় নির্ভুলতা | logic পুনরাবৃত্তি, সম্প্রসারণ ধীর | স্বল্পমেয়াদে চলে |
| ৩. **Hybrid: global canonical schema + local source adapter** | একই ব্যবসায়িক logic, দেশভেদে উৎস/মুদ্রা/একক/আইন | প্রাথমিক নকশা-খরচ | **দীর্ঘমেয়াদে সুপারিশকৃত** (ANALYSIS) |

**কোনটি global, কোনটি স্থানীয়:** Global — পণ্যের ধরন (taxonomy), মাপের একক রূপান্তর, workflow, provenance কাঠামো, verification state। স্থানীয় — পণ্য, দাম, মুদ্রা, VAT, ডেলিভারি, ভাষা, নিয়মকানুন, সেবা প্রদানকারী, পেমেন্ট, ডেটা লাইসেন্স।
**কিন্তু:** MVP-তে কোনো আর্কিটেকচার বানানো হবে না; স্প্রেডশিট-ই যথেষ্ট।

### ৮.১০ Data moat মূল্যায়ন
| সম্ভাব্য সুবিধা | প্রতিযোগীর পক্ষে পুনরুৎপাদন | কী লাগে | মূল্যায়ন |
|---|---|---|---|
| পাবলিক ওয়েবসাইট থেকে catalog | সহজ | সময় | moat নয় |
| লাইসেন্সকৃত, normalised স্থানীয় catalog | মাঝারি | চুক্তি, রক্ষণাবেক্ষণ | দুর্বল-মাঝারি; retailer অন্যকেও দিতে পারে |
| যাচাইকৃত মাপ ও fit-তথ্য | মাঝারি | প্রক্রিয়া | মাঝারি |
| Supplier সম্পর্ক (exclusive নয়) | মাঝারি-কঠিন | সময়, বিশ্বাস | মাঝারি |
| প্রকৃত প্রকল্প খরচ (budget vs actual) | কঠিন | বহু সম্পন্ন প্রকল্প + সম্মতি | **সম্ভাব্য শক্তিশালী — কিন্তু বহু বছর ও বড় পরিমাণ লাগবে** |
| পণ্য-প্রতিস্থাপন জ্ঞান (কোনটার বিকল্প কোনটা) | মাঝারি | ব্যবহার ডেটা | মাঝারি |
| সুপারিশ-কার্যকারিতা (কোন সুপারিশ কেনা হয়েছে, ফেরত হয়নি) | কঠিন | conversion tracking + সম্মতি | সম্ভাব্য, দীর্ঘমেয়াদি |

**শর্ত:** গ্রাহকের ছবি, floor plan বা প্রকল্প রেকর্ড AI training-এ স্বয়ংক্রিয়ভাবে ব্যবহার করা যাবে না; আলাদা, স্পষ্ট সম্মতি ও মুছে ফেলার অধিকার প্রয়োজন (PDPO 2025/GDPR)। **উপসংহার:** শুরুতে কোনো data moat নেই; moat হলে তা হবে কার্যক্রম ও সময়ের ফল, প্রথম দিনের সম্পদ নয়।

---

## ৯. পণ্য বিকল্প ও MVP সুপারিশ

### ৯.১ চারটি বিকল্পের তুলনা

| মানদণ্ড | A: AI redesign + বাস্তব পণ্য + বাজেট | B: সংস্কার পরিকল্পনা ও খরচ | C: পেশাদার design/sourcing assistant | D: সম্পূর্ণ Home Agent |
|---|---|---|---|---|
| সমস্যার তীব্রতা | অজানা (সম্ভবত মাঝারি) | উচ্চ (বড় ব্যয়) | অজানা | বিচ্ছিন্ন |
| ব্যবহারের ঘনত্ব | নিম্ন | নিম্ন | উচ্চ | মাঝারি (দাবি) |
| বিদ্যমান বিকল্প | প্রচুর ও বিনামূল্যে (US); BD-তে মানব সেবা | পেশাদার (US ৯০% নিয়োগ) | Houzz Pro, Foyr, Coohom (US); BD অজানা | কেউ সম্পূর্ণ নয় |
| প্রতিযোগিতার চাপ | US: খুব উচ্চ; BD: নিম্ন-মাঝারি | মাঝারি | US: খুব উচ্চ | ভবিষ্যতে বড় প্রযুক্তি কোম্পানি |
| ডেটা প্রাপ্যতা | মাঝারি (পণ্য) | নিম্ন (অস্থির দাম, শ্রম) | মাঝারি (designer-এর supplier) | খুব নিম্ন |
| লাইসেন্স সম্ভাব্যতা | অজানা | অজানা | মাঝারি | খুব কঠিন |
| প্রযুক্তিগত অসুবিধা | মাঝারি (concierge-এ কম) | উচ্চ | মাঝারি | খুব উচ্চ |
| মূল্য দেখানোর সময় | দ্রুত | ধীর | মাঝারি | খুব ধীর |
| WTP প্রমাণ | পরোক্ষ (Havenly, Sheraspace) | পরোক্ষ (পেশাদার নিয়োগ) | পরোক্ষ (pro subscription) | নেই |
| গ্রাহক অর্জন | মাঝারি | মাঝারি | সহজতর (চিহ্নিতযোগ্য গোষ্ঠী) | কঠিন |
| আস্থার প্রয়োজন | মাঝারি | উচ্চ | মাঝারি | উচ্চ |
| নিরাপত্তা/দায় | নিম্ন | উচ্চ | মাঝারি | উচ্চ |
| পরিচালন প্রয়োজন | মাঝারি (মানব যাচাই) | উচ্চ | মাঝারি | খুব উচ্চ |
| Contribution margin | অজানা | অজানা | সম্ভাব্য ভালো (software) | অজানা |
| পুনরাবৃত্তি | নিম্ন | নিম্ন | উচ্চ | দাবি করা উচ্চ |
| vision-এ সম্প্রসারণ | উচ্চ | উচ্চ | মাঝারি | — |

**Sensitivity:**
- দ্রুত শেখা, কম দায় ও vision-সংযোগ অগ্রাধিকার পেলে → **A**।
- পুনরাবৃত্ত আয় ও কম CAC অগ্রাধিকার পেলে → **C**।
- বড় টিকিট ও সর্বোচ্চ সমস্যা-তীব্রতা অগ্রাধিকার পেলে → B, কিন্তু ডেটা ও দায় ঝুঁকি একে প্রথম পণ্য হিসেবে দুর্বল করে।
- D কোনো ওজনেই প্রথম পণ্য হিসেবে যুক্তিসঙ্গত নয়: এটি A–C সবগুলোর সব নির্ভরতা একসাথে বহন করে।

### ৯.২ প্রস্তাবিত MVP hypothesis (সংকীর্ণ Option A, concierge আকারে)
- **লক্ষ্য ব্যবহারকারী:** ঢাকায় বসবাসকারী, একটি নির্দিষ্ট ঘর (শোবার/বসার ঘর) ১–৩ মাসের মধ্যে সাজাতে চান, বাজেট নির্দিষ্ট — (segment A)।
- **নির্দিষ্ট সমস্যা:** "কোন বাস্তব, এখন কেনা যায় এমন পণ্য আমার ঘরের মাপে আঁটবে এবং বাজেটে থাকবে?"
- **প্রারম্ভিক ইনপুট:** ঘরের ছবি (৩–৪টি কোণ থেকে), টেপ দিয়ে মাপা দৈর্ঘ্য-প্রস্থ-উচ্চতা, দরজা/জানালার অবস্থান (হাতে আঁকা স্কেচ গ্রহণযোগ্য), বাজেট, স্টাইল, কোন আইটেম লাগবে, এলাকা।
- **মূল workflow:** (১) intake ফর্ম → (২) মাপ যাচাই (প্রয়োজনে প্রশ্ন) → (৩) মানুষ AI-সহায়তায় ১–২টি layout ও concept → (৪) যাচাইকৃত উৎস থেকে প্রতিটি আইটেমের ২–৩টি বাস্তব পণ্য (মাপ, দাম, তারিখ, উৎস) → (৫) বাজেট-সারণি ও বিকল্প → (৬) PDF/WhatsApp-এ ডেলিভারি → (৭) ২–৪ সপ্তাহ পরে ফলো-আপ: কী কিনেছেন, কোথা থেকে, কী মেলেনি।
- **প্রত্যাশিত output:** মাপসহ সরল layout, concept image (স্পষ্টভাবে "ধারণাচিত্র, মাপ-নির্ভুল নয়" লেবেলসহ), পণ্য তালিকা (উৎস-তারিখ-অনিশ্চয়তাসহ), বাজেট সারণি।
- **মানব পর্যালোচনা বিন্দু:** মাপ-যাচাই, প্রতিটি পণ্যের fit-check, চূড়ান্ত তালিকা পাঠানোর আগে।
- **Failure case:** মাপ অসম্পূর্ণ; বাজেটে কোনো উপযুক্ত পণ্য নেই; পণ্যটি পরে stock-এ নেই; concept image-এর আসবাব বাস্তবে নেই।
- **সাফল্যের মাপকাঠি:** বিভাগ ৯.৪।
- **স্পষ্ট বর্জন (Exclusions):** কাঠামোগত/বৈদ্যুতিক/প্লাম্বিং পরামর্শ, contractor নিয়োগ, অর্থ গ্রহণ করে পণ্য বিক্রি (marketplace), নির্মাণ খরচ, app।

**বিকল্প hypothesis (সমান্তরালে শুধু সাক্ষাৎকারে):** Option C — ঢাকার ছোট interior studio-র জন্য "পণ্য তালিকা + BOQ + ক্লায়েন্ট প্রস্তাব" সহায়তা।

### ৯.৩ MVP / Next-stage / Long-term তালিকা
| স্তর | বৈশিষ্ট্য | নির্ভরতা |
|---|---|---|
| **MVP (concierge)** | intake ফর্ম; মাপ যাচাই; AI concept image (লেবেলসহ); হাতে-যাচাই পণ্য তালিকা (স্প্রেডশিট-ভিত্তিক ডেটা); বাজেট সারণি; PDF/WhatsApp ডেলিভারি; ফলো-আপ সাক্ষাৎকার; পূর্বনির্ধারিত মূল্যে পেমেন্ট (bKash/ব্যাংক) | — |
| **Next stage** (MVP মূল্য প্রমাণ করলে) | ওয়েব intake ও স্বয়ংক্রিয় তালিকা খসড়া; retailer partner-দের লিখিত ডেটা feed; referral/affiliate চুক্তি; designer-দের জন্য একই টুল (Option C); একাধিক ক্যাটাগরি | MVP-তে WTP ও ডেটা অডিট সফল |
| **Long-term vision** | renovation cost intelligence; contractor/সেবা সংযোগ (Sheba.xyz-এর মতো partner); home profile; budget vs actual ট্র্যাকিং; বহু শহর/দেশ; smart-home | Next stage-এ unit economics প্রমাণিত; আইনি প্রস্তুতি |

### ৯.৪ MVP সাফল্যের মাপকাঠি
| মাপকাঠি | কীভাবে মাপবেন | সীমা নির্ধারণ |
|---|---|---|
| Task completion | intake থেকে ডেলিভারি পর্যন্ত সম্পূর্ণ প্রকল্প / শুরু হওয়া প্রকল্প | founder পরীক্ষার আগে স্থির করবেন |
| User understanding | গ্রাহক নিজের ভাষায় তালিকার অনিশ্চয়তা ব্যাখ্যা করতে পারেন কিনা | গুণগত |
| Measurement reliability | ডেলিভারির পরে গ্রাহকের পুনঃমাপ বনাম আমাদের ব্যবহৃত মাপ | পার্থক্যের বণ্টন রেকর্ড |
| Product match quality | তালিকার কতটি পণ্য ডেলিভারির দিন বাস্তবে পাওয়া গেল ও মাপ মিলল | % |
| Price transparency | তালিকার দাম বনাম ক্রয়ের দিন প্রকৃত দাম | পার্থক্যের % |
| Budget usefulness | গ্রাহকের প্রকৃত ব্যয় বনাম বাজেট | গুণগত + সংখ্যা |
| Paid conversion | মূল্য জানানোর পরে কত জন পরিশোধ করলেন | **সবচেয়ে গুরুত্বপূর্ণ** |
| Refund/complaint | সংখ্যা ও কারণ | — |
| Cost per successful project | মোট মানব-ঘণ্টা × ঘণ্টাপ্রতি খরচ + AI + অন্যান্য / সফল প্রকল্প | বিভাগ ১২ |
| Support burden | প্রতি প্রকল্পে বার্তা/কল সংখ্যা | — |

**নিয়ম:** সব সীমা পরীক্ষা শুরুর আগে লিখে রাখতে হবে; পরে বদলানো যাবে না (নইলে confirmation bias)।

### ৯.৫ বৈশিষ্ট্য-ভিত্তিক কৌশল এড়ানো — প্রধান বৈশিষ্ট্যগুলোর যুক্তি
| বৈশিষ্ট্য | কোন সমস্যা | প্রমাণ | সবচেয়ে সরল পরীক্ষা | বাদ দিলে কী হয় |
|---|---|---|---|---|
| AI concept image | কল্পনা করতে সাহায্য | commoditised; মূল্য অপ্রমাণিত | concierge-এ দেওয়া/না-দেওয়া তুলনা (A/B) | সম্ভবত সামান্য ক্ষতি — **পরীক্ষা করুন** |
| মাপ-fit check | ভুল মাপের আসবাব | অপ্রমাণিত (সাক্ষাৎকারে জিজ্ঞাসা) | concierge | মূল প্রস্তাব দুর্বল |
| বহু-retailer পণ্য তালিকা | দোকান ঘোরার সময় | অপ্রমাণিত | concierge | প্রস্তাব retailer app-এর সমতুল্য |
| বাজেট সারণি | অতিরিক্ত ব্যয় | অপ্রমাণিত | concierge | ChatGPT-র সমতুল্য |
| 3D/AR | আত্মবিশ্বাস | IKEA/Planner 5D দেয় | এখন নয় | MVP-তে সম্ভবত অপ্রয়োজনীয় |
| Home profile | পুনরাবৃত্ত কাজ কমানো | অপ্রমাণিত | এখন নয় | MVP-তে ক্ষতি নেই |

---

## ১০. প্রযুক্তিগত ও AI সম্ভাব্যতা

### ১০.১ ছবি ও geometry নির্ভরযোগ্যতা
- **FACT (সীমিত):** ControlNet-এর মতো কৌশল ছবির কাঠামো (edge/depth) বজায় রাখতে সাহায্য করে, কিন্তু কিছু মাপে না — মাপ "visual guess"; open model-এ পুনরাবৃত্ত আসবাব ও অসমঞ্জস অনুপাত দেখা যায় (RoomDiffusion, arXiv 2409.03198)। মাত্রাগত নির্ভুলতার কোনো peer-reviewed benchmark পাওয়া যায়নি।
- **FACT (সীমিত):** LiDAR room scan-এ উৎসভেদে ~১–৩ সেমি থেকে ২.৫–১০ সেমি ত্রুটি রিপোর্ট হয়েছে (review ও ফোরাম; peer-reviewed নয়)। LiDAR সব ফোনে নেই।
- **ANALYSIS:** MVP-তে মাপের উৎস হবে **ব্যবহারকারীর টেপ-মাপ** (বা মানুষের যাচাই), AI ছবি নয়।

**Output স্তর ও প্রয়োজনীয় যাচাই:**
| Output স্তর | বর্ণনা | কখন দেওয়া যাবে | MVP-তে |
|---|---|---|---|
| ১. Concept visualisation | মেজাজ/স্টাইল ধারণা | স্পষ্ট লেবেলসহ সবসময় | হ্যাঁ |
| ২. Approximate layout | আনুমানিক অবস্থান | লেবেল "আনুমানিক" | হ্যাঁ |
| ৩. User-measured layout | ব্যবহারকারীর মাপভিত্তিক | মাপ যাচাই ও উৎস উল্লেখসহ | হ্যাঁ |
| ৪. Professionally verified drawing | পেশাদার যাচাইকৃত | যোগ্য পেশাদারের স্বাক্ষর | না |
| ৫. Construction/permit-ready | নির্মাণ/অনুমতির জন্য | লাইসেন্সপ্রাপ্ত পেশাদার ও কর্তৃপক্ষ | **কখনো AI-এর দাবি নয়** |

### ১০.২ বাস্তব পণ্য মেলানো (Real-product matching) কৌশল
1. **উল্টো ক্রম:** প্রথমে মাপ ও বাজেট দিয়ে যাচাইকৃত তালিকা থেকে পণ্য বাছাই, তারপর (ঐচ্ছিক) সেই পণ্য দিয়ে concept — "AI-আঁকা আসবাব খুঁজে বের করা"-র চেয়ে বেশি নির্ভরযোগ্য (ANALYSIS)।
2. **মেলানোর তিন স্তর** গ্রাহককে স্পষ্টভাবে দেখানো: (ক) Exact match — একই SKU/model; (খ) Close alternative — মাপ ও কার্যকারিতা মেলে, দেখতে কাছাকাছি; (গ) Visual inspiration only — কোনো যাচাইকৃত পণ্য নেই।
3. **মাপ-সংঘাত পরীক্ষা:** পণ্যের footprint + চলাচলের ফাঁকা জায়গা (দরজা খোলার পরিধি, wardrobe-এর দরজা) বনাম ঘরের মাপ — MVP-তে হাতে।
4. **Variant ও অপ্রাপ্যতা:** প্রতিটি আইটেমে ২–৩টি বিকল্প; "made to order" ও lead time লিখতে হবে।
5. **ছবির লাইসেন্স না থাকলে:** লিংক দিন, ছবি নয়।
6. **নিয়ম:** AI image-এ যা দেখা যাচ্ছে তা কেনা যায় — এমন ইঙ্গিত দেওয়া যাবে না যদি না যাচাইকৃত exact match থাকে।

### ১০.৩ খরচ-অনুমানের নির্ভরযোগ্যতা (Option B-এর জন্য, ভবিষ্যৎ)
অনিশ্চয়তার উৎস: মাপের ত্রুটি, উপকরণের grade, অপচয়, শ্রম, পরিবহন, স্থাপন, VAT/কর, contractor overhead, লুকানো ক্ষতি, সাইটের অবস্থা, দামের পরিবর্তন (BD-তে দ্রুত), scope পরিবর্তন।
**প্রকাশের নিয়ম:** সবসময় range (নিম্ন–উচ্চ), অন্তর্ভুক্ত/বহির্ভূত তালিকা, মূল্যের তারিখ ও উৎস, এবং "এটি কোটেশন নয়" বিবৃতি। **সুপারিশ:** Option B MVP-তে নয়।

### ১০.৪ AI provider কৌশল
| বিকল্প | সুবিধা | অসুবিধা |
|---|---|---|
| একক provider | সরল | vendor lock-in, মূল্য/নীতি পরিবর্তনের ঝুঁকি (যেমন পুরোনো image model অবসরের খবর — Unverified) |
| বহু বিশেষায়িত provider + task routing | মান ও খরচ অপ্টিমাইজ | জটিলতা |
| Open-source/self-hosted | গোপনীয়তা, খরচ নিয়ন্ত্রণ | পরিচালন বোঝা, মান |
**সুপারিশ (MVP):** কোনো provider-এর সাথে প্রযুক্তিগত প্রতিশ্রুতি নয়; concierge-এ যেকোনো সাধারণ টুল হাতে ব্যবহার করুন, কিন্তু **গ্রাহকের ছবি আপলোডের আগে সেই টুলের বর্তমান data-use শর্ত পড়ুন** (training-এ ব্যবহার হয় কিনা)। পরে portability-র জন্য একটি পাতলা abstraction স্তর।
**খরচ সংকেত:** image API প্রতি ছবি ~$0.02–$0.13 (secondary উৎস) — প্রতি প্রকল্পে ২০টি ছবিতেও কয়েক ডলারের কম। AI খরচ সম্ভবত প্রধান খরচ নয় (ANALYSIS)।

### ১০.৫ নিরাপত্তা ও গোপনীয়তা ঝুঁকি ও নিয়ন্ত্রণ (পর্যায়-উপযুক্ত)
| ঝুঁকি | MVP নিয়ন্ত্রণ | পরবর্তী নিয়ন্ত্রণ |
|---|---|---|
| ঘরের ছবি (মানুষ, চিঠি, পর্দা দেখা যেতে পারে) | আপলোডের আগে নির্দেশনা: মানুষ/নথি সরিয়ে ছবি; সম্মতি ফর্ম | স্বয়ংক্রিয় মুখ/লেখা blur |
| ঠিকানা | শুধু এলাকা (থানা/ward) সংগ্রহ, পূর্ণ ঠিকানা নয় | identity ও project ডেটা পৃথক |
| ক্রয় ইতিহাস | ঐচ্ছিক, সম্মতিসাপেক্ষ | encryption, access log |
| তৃতীয় পক্ষ AI | data-use শর্ত পর্যালোচনা; training-opt-out যেখানে সম্ভব | DPA চুক্তি |
| Prompt injection (ভবিষ্যতে tool-ব্যবহারকারী agent) | MVP-তে প্রযোজ্য নয় | সীমিত tool অনুমতি, input sanitisation |
| অননুমোদিত প্রবেশ | ভাগ করা ড্রাইভে সীমিত অ্যাক্সেস, 2FA | RBAC, audit log |
| Retention | প্রকল্প শেষে নির্দিষ্ট সময় পরে মুছে ফেলা (সময় founder নির্ধারণ করবেন) | স্বয়ংক্রিয় deletion |
| Incident | একটি সরল লিখিত পরিকল্পনা: কে, কী করবে, কাকে জানাবে | আইনানুগ breach notification |

### ১০.৬ মূল্যায়ন কাঠামো (Evaluation metrics)
| মাপকাঠি | পরিমাপ | প্রমাণ | সিদ্ধান্তে প্রভাব |
|---|---|---|---|
| Measurement fidelity | ব্যবহৃত মাপ বনাম পুনঃমাপ | ফলো-আপ | মাপ-সংগ্রহ পদ্ধতি বদলানো |
| Geometry preservation | concept-এ স্থির উপাদান ঠিক আছে কিনা (checklist) | মানব রেটার | concept বাদ বা লেবেল |
| Product match rate | exact/close/none অনুপাত | অডিট | ডেটা উৎস বিস্তার |
| Price freshness | তালিকা বনাম ক্রয়-দিনের দাম | ফলো-আপ | staleness নীতি |
| Budget deviation | প্রকৃত ব্যয় − বাজেট | ফলো-আপ | বাজেট পদ্ধতি |
| Task completion | সম্পূর্ণ / শুরু | লগ | workflow সরলীকরণ |
| Correction rate | গ্রাহক কতবার সংশোধন চাইলেন | লগ | মানব-সময় |
| Failure/complaint/refund | সংখ্যা ও কারণ | লগ | Go/Stop |
| Latency | intake থেকে ডেলিভারি সময় | লগ | পরিচালন |
| Cost per successful project | বিভাগ ১২ সূত্র | timesheet | unit economics |

### ১০.৭ ধারণাগত আর্কিটেকচার নীতি (ভবিষ্যতের জন্য; অনুমোদিত আর্কিটেকচার নয়)
global পণ্য মডেল; দেশ-ভিত্তিক ডেটা adapter; প্রতিটি রেকর্ডে উৎস ও লাইসেন্স; AI orchestration (model-নিরপেক্ষ); workflow ও ব্যবসায়িক নিয়ম আলাদা; মানব অনুমোদনের সীমানা স্পষ্ট; auditability; গ্রাহক ডেটা বিচ্ছিন্নতা; নিরাপদ integration; ডেটা-মান পর্যবেক্ষণ।

---

## ১১. ব্যবসায়িক মডেল ও Monetisation

### ১১.১ মডেল তুলনা
| মডেল | কে টাকা দেয় / কেন | WTP প্রমাণ | মার্জিন সম্ভাবনা | প্রধান ঝুঁকি | এখন? |
|---|---|---|---|---|---|
| ১. Freemium | গৃহস্থ, premium বৈশিষ্ট্যের জন্য | US app $5–$30/মাস — কম মূল্যস্তর | AI খরচ কম হলে ভালো | বিনামূল্যের বিকল্প; কম conversion | না (প্রথমে) |
| ২. **Pay-per-project** | গৃহস্থ, একটি ঘরের পরিকল্পনার জন্য | Havenly $159/room; Cedreo $139/project; Sheraspace Tk 2,800/session (২০২০–২২) — পরোক্ষ | মানব-সময়ের উপর নির্ভর | মানব খরচ; এককালীন | **হ্যাঁ — প্রাথমিক পরীক্ষা** |
| ৩. গৃহস্থ subscription | — | ঘটনা বিরল → দুর্বল যুক্তি | — | churn | না |
| ৪. B2B SaaS (designer/contractor) | studio, সময় বাঁচানো ও বেশি প্রকল্প জয় | US-এ pro subscription বিদ্যমান; BD অজানা | ভালো | বিদ্যমান অভ্যাস | **দ্বিতীয় পরীক্ষা (সাক্ষাৎকার)** |
| ৫. Affiliate | retailer, বিক্রির জন্য | Amazon ৩–৪%, Wayfair ৫–৭%, Daraz অযাচাইকৃত | কম, অনিশ্চিত | tracking, ফেরত, কম হার | সম্পূরক মাত্র |
| ৬. Retailer subscription/software fee | retailer, visualisation/lead | Planner 5D/Coohom এই বাজারে আছে | ভালো | বিক্রয় চক্র দীর্ঘ | পরে |
| ৭. Qualified lead fee | retailer/পেশাদার | Angi/Thumbtack মডেল — US-এ সংকুচিত | মাঝারি | lead মান বিরোধ | পরে |
| ৮. Marketplace commission | বিক্রেতা | — | GMV-র ছোট অংশ | দায়, liquidity, ফেরত | না |
| ৯. Managed service | গৃহস্থ (সম্পূর্ণ কাজ) | Sheraspace, studio-রা করে | মানব-নির্ভর | পরিচালন জটিলতা | না |
| ১০. Enterprise/white-label | retailer/developer | Planner 5D Enterprise | ভালো | বিক্রয়, কাস্টমাইজেশন | পরে |
| ১১. Hybrid | — | — | — | মনোযোগ বিভাজন | সময়ের সাথে |

### ১১.২ রাজস্ব কৌশল
- **প্রাথমিক (পরীক্ষার জন্য):** Pay-per-project concierge — নির্দিষ্ট, পূর্বঘোষিত মূল্য (মূল্য-স্তর founder নির্ধারণ করবেন; benchmark হিসেবে Sheraspace-এর পুরোনো Tk 2,800 থেকে Havenly-র $159 পর্যন্ত বিস্তৃত পরিসর আছে — কিন্তু এগুলো ভিন্ন বাজার/সময়, সরাসরি প্রযোজ্য নয়)। দুটি মূল্য-স্তর পরীক্ষা করে মূল্য-সংবেদনশীলতা শেখা যায়।
- **দ্বিতীয় (পরে পরীক্ষা):** designer-দের জন্য মাসিক টুল ফি, অথবা retailer-দের কাছ থেকে referral fee (লিখিত চুক্তি)।
- **দীর্ঘমেয়াদি সম্ভাবনা:** retailer software/lead fee, সেবা-partner commission, enterprise।
- **স্থগিত/প্রত্যাখ্যাত (এখন):** marketplace, গৃহস্থ subscription, বিজ্ঞাপন।

### ১১.৩ শুধু affiliate কি যথেষ্ট? — না (ANALYSIS, উচ্চ আস্থা)
**Illustrative (কাল্পনিক ইনপুট — FACT নয়):**
`প্রতি প্রকল্পে affiliate আয় = তালিকার মূল্য × ক্রয়-অনুপাত (আমাদের লিংক দিয়ে) × অনুমোদিত অনুপাত (ফেরত/বাতিল বাদে) × commission হার`
- উদাহরণ: তালিকা Tk 1,50,000 × ২০% × ৯০% × ৩% = **Tk 810** প্রতি প্রকল্প।
- এই অঙ্ক এক ঘণ্টার মানব-কাজের খরচও সম্ভবত মেটাবে না (ASSUMPTION), এবং BD furniture retailer-দের affiliate প্রোগ্রাম পাওয়াই যায়নি। US-এ Amazon-এর ৩–৪% ও ২৪-ঘণ্টা শর্তও একই সিদ্ধান্তের দিকে নির্দেশ করে।
- **উপসংহার:** প্রত্যক্ষ গ্রাহক-অর্থপ্রদান (বা B2B fee) প্রয়োজন; affiliate সম্পূরক।

---

## ১২. Unit Economics ও Scenario Analysis

> **কোনো প্রকৃত ইনপুট নেই।** নিচে সূত্র ও ভেরিয়েবল; উদাহরণ সংখ্যা স্পষ্টভাবে "ILLUSTRATIVE"।

### ১২.১ ভেরিয়েবল
| ভেরিয়েবল | প্রতীক | উৎস (কীভাবে পাবেন) |
|---|---|---|
| প্রতি প্রকল্প মূল্য | P | founder নির্ধারণ; paid pilot |
| Affiliate/referral আয় প্রতি প্রকল্প | R_aff | উপরের সূত্র; retailer চুক্তি |
| মানব সময় প্রতি প্রকল্প (ঘণ্টা) | H | concierge timesheet |
| ঘণ্টাপ্রতি মানব খরচ | W | স্থানীয় বেতন/চুক্তি |
| AI খরচ প্রতি প্রকল্প | C_ai | ছবি সংখ্যা × প্রতি ছবি মূল্য (~$0.02–$0.13, secondary) + text |
| ডেটা রক্ষণাবেক্ষণ খরচ (মাসিক) | D_m | অডিট-ভিত্তিক সময় পরিমাপ |
| পেমেন্ট ফি হার | f | provider (bKash/SSLCommerz ~১.১৫–২.৫%, উৎসভেদে) |
| Refund হার | r | pilot |
| Support সময় | S (ঘণ্টা) | লগ |
| CAC | CAC | বিজ্ঞাপন/outreach খরচ ÷ paid গ্রাহক |
| স্থির মাসিক খরচ | F | founder |
| প্রতি মাসে প্রকল্প | N | pilot |

### ১২.২ সূত্র
- রাজস্ব প্রতি প্রকল্প: `Rev = P × (1 − r) + R_aff`
- পরিবর্তনশীল খরচ প্রতি প্রকল্প: `VC = (H + S) × W + C_ai + P × f + (D_m ÷ N)`
  (ডেটা রক্ষণাবেক্ষণ প্রকল্পসংখ্যার সাথে আংশিক স্থির — এখানে প্রকল্পপ্রতি ভাগ করা হয়েছে; প্রকৃতপক্ষে এটি semi-fixed)
- Contribution প্রতি প্রকল্প: `CM = Rev − VC`; Contribution margin: `CM% = CM ÷ Rev`
- CAC payback (প্রকল্পে): `CAC ÷ CM` — এককালীন গ্রাহকের ক্ষেত্রে এটি ≤১ হওয়া প্রয়োজন, নইলে প্রতিটি গ্রাহকে ক্ষতি।
- Break-even: `N_be = F ÷ CM` (শুধু CM > 0 হলে অর্থবহ)
- LTV: **গণনা করা হচ্ছে না** — পুনরাবৃত্তি/retention-এর কোনো প্রমাণ নেই।
- মাসিক নগদ প্রয়োজন: `F + N × VC + মার্কেটিং − N × Rev`

### ১২.৩ ILLUSTRATIVE scenario (কাল্পনিক — সিদ্ধান্তের জন্য নয়, শুধু সংবেদনশীলতা বোঝাতে)
ধরা যাক (সব ASSUMPTION): P = Tk 5,000; r = ৫%; R_aff = Tk 0 (রক্ষণশীল); W = Tk 500/ঘণ্টা; C_ai ≈ Tk 200; f = ২%; D_m ভাগ = Tk 300।

| Scenario | H + S (ঘণ্টা) | VC (Tk) | Rev (Tk) | CM (Tk) | CM% |
|---|---|---|---|---|---|
| রক্ষণশীল | 10 | 10×500 + 200 + 100 + 300 = **5,600** | 4,750 | **−850** | −১৮% |
| ভিত্তি | 6 | 6×500 + 600 = **3,600** | 4,750 | **1,150** | ২৪% |
| আশাবাদী | 3 | 3×500 + 600 = **2,100** | 4,750 | **2,650** | ৫৬% |

(হিসাব যাচাই: রক্ষণশীল VC = 5,000 + 200 + 100 + 300 = 5,600 ✓; ভিত্তি 3,000 + 600 = 3,600 ✓; আশাবাদী 1,500 + 600 = 2,100 ✓; Rev = 5,000 × 0.95 = 4,750 ✓)

**এই উদাহরণ থেকে শিক্ষা (ANALYSIS):**
1. **সবচেয়ে সংবেদনশীল ভেরিয়েবল হলো মানব-সময় (H + S)** — AI খরচ নয়। প্রতিটি অতিরিক্ত ঘণ্টা contribution সরাসরি কমায়।
2. CAC যদি এই CM-এর চেয়ে বেশি হয় (যেমন ভিত্তি scenario-তে Tk 1,150-এর বেশি), প্রতিটি নতুন গ্রাহকে ক্ষতি — এককালীন মডেলে পুনরাবৃত্তি ছাড়া উদ্ধার নেই।
3. তাই concierge pilot-এর প্রধান কাজ: প্রকৃত **H, S, P-তে conversion ও CAC** মাপা।

### ১২.৪ Sensitivity (গুণগত)
| পরিবর্তন | প্রভাব | কোন প্রমাণ এটি প্রতিস্থাপন করবে |
|---|---|---|
| কম conversion | CAC বাড়ে | pilot |
| বেশি CAC | প্রতি গ্রাহকে ক্ষতি | outreach পরীক্ষা |
| কম commission | R_aff নগণ্য | retailer চুক্তি |
| AI/ডেটা খরচ বেশি | মাঝারি প্রভাব (AI ছোট, ডেটা বড় হতে পারে) | অডিট সময় পরিমাপ |
| পুরোনো/ভুল ডেটা | refund ও support বাড়ে | ফলো-আপ |
| উচ্চ support | CM কমে | লগ |
| কম পুনরাবৃত্তি | LTV = এককালীন | ফলো-আপ |
| supplier onboarding বিলম্ব | ডেটা কভারেজ কম | retailer আলোচনা |
| মুদ্রা/পেমেন্ট সীমা | subscription কঠিন | provider docs |
| পণ্য অপ্রাপ্যতা | match rate কমে | অডিট |

---

## ১৩. TAM, SAM ও SOM

### ১৩.১ কেন সংখ্যা দেওয়া হচ্ছে না
নির্ভরযোগ্য bottom-up ইনপুট (লক্ষ্য গৃহস্থের সংখ্যা, বছরে কত জন ঘর সাজান, প্রতি লেনদেনে WTP) কোনো লক্ষ্য দেশের জন্য পাওয়া যায়নি। Top-down সংখ্যা (US সংস্কার $518B; BD ফার্নিচার Tk 25,000–30,000 কোটি) এই প্ল্যাটফর্মের রাজস্ব সুযোগ **নয়** — এগুলো ভোক্তার মোট ব্যয়, যার একটি ক্ষুদ্র অংশ পরিকল্পনা-সেবার জন্য ব্যয় হয়। এগুলো TAM হিসেবে ব্যবহার করলে বিভ্রান্তিকর অতিরঞ্জন হবে (Rule 10)।

### ১৩.২ Bottom-up কাঠামো (পূরণযোগ্য)
- **TAM (একক: বছরে পরিকল্পনা-সেবার রাজস্ব, টাকা):** `লক্ষ্য দেশে শহুরে গৃহস্থ সংখ্যা × বছরে ঘর সাজানো/সংস্কার করেন এমন অনুপাত × পরিকল্পনা-সহায়তার জন্য টাকা দিতে ইচ্ছুক অনুপাত × গড় মূল্য` + B2B: `designer/retailer সংখ্যা × বার্ষিক fee`
- **SAM:** TAM-কে সীমিত করুন: (ঢাকা) × (অনলাইনে সেবা নিতে স্বচ্ছন্দ) × (আমাদের ডেটা-কভারেজের ক্যাটাগরি) × (pay-per-project মডেল)।
- **SOM:** `বাস্তব বিতরণ ক্ষমতা (মাসে কত প্রকল্প মানুষ সামলাতে পারে) × pilot-এ পরিমাপিত conversion × ১২ মাস × P`।
- **প্রয়োজনীয় ডেটা:** BBS খানা ও আয়-ব্যয় জরিপ (শহুরে খানা সংখ্যা ও আসবাব ব্যয়), REHAB/RAJUK (নতুন ফ্ল্যাট হস্তান্তর), সাক্ষাৎকার (ঘটনার হার), pilot (conversion, P)।
- **দ্বৈত গণনার ঝুঁকি:** একই গৃহস্থ A ও B উভয় segment-এ; designer-এর ক্লায়েন্ট ও সরাসরি গৃহস্থ — আলাদা রাখতে হবে।
- **SOM-এর বাস্তব সীমা (ANALYSIS):** concierge পর্যায়ে SOM কার্যত মানব-ক্ষমতা দ্বারা সীমিত, বাজার আকার দ্বারা নয়।

---

## ১৪. আইনি, গোপনীয়তা ও পরিচালনগত ঝুঁকি

> এটি কৌশলগত পরিকল্পনার জন্য; **আইনি পরামর্শ নয়।** "নিশ্চিত" = উৎসে স্পষ্ট; "সম্ভাব্য" = প্রযোজ্য হতে পারে; "আইনজীবী প্রয়োজন" = বিশেষজ্ঞ পর্যালোচনা ছাড়া সিদ্ধান্ত নয়।

### ১৪.১ বিচারব্যবস্থা-ভিত্তিক মূল আইনি বিষয়
| বিচারব্যবস্থা | বিষয় | নিয়ম/উৎস | অবস্থা | ব্যবহারিক প্রভাব |
|---|---|---|---|---|
| বাংলাদেশ | ব্যক্তিগত ডেটা | Personal Data Protection Ordinance 2025 (অনুমোদন ৯ অক্টো ২০২৫; ৫৭ ধারা; consent; উদ্দেশ্য-প্রকাশ; cross-border নিয়ম; কিছু ধারা ১৮ মাস পরে) | অনুমোদন নিশ্চিত; বর্তমান কার্যকারিতা ও ২০২৬-এর সংসদীয় অবস্থা — **আইনজীবী প্রয়োজন** | লিখিত সম্মতি, উদ্দেশ্য, retention, প্রত্যাহারের উপায়; বিদেশি AI provider-এ ছবি পাঠানো = cross-border transfer হতে পারে |
| বাংলাদেশ | ই-কমার্স | Digital Commerce Operation Guidelines 2021 (ডেলিভারি ৫/১০ দিন, refund ১০ দিন, compliance officer) | ২০২১ সংস্করণ নিশ্চিত; পরে সংশোধন — Unverified | marketplace/পণ্য বিক্রি না করলে সরাসরি প্রযোজ্য নাও হতে পারে; সেবা বিক্রিতে refund নীতি স্পষ্ট রাখুন |
| বাংলাদেশ | ভোক্তা অধিকার | Consumer Rights Protection Act 2009 | সম্ভাব্য প্রযোজ্য | বিভ্রান্তিকর দাম/দাবি এড়ানো |
| বাংলাদেশ | নির্মাণ | RAJUK/BNBC 2020 | interior-এ প্রযোজ্যতা — Insufficient Evidence | কাঠামোগত/বৈদ্যুতিক পরামর্শ বর্জন |
| US | Affiliate disclosure | FTC Endorsement Guides (16 CFR 255; ২৯ জুন ২০২৩ সংশোধন) | নিশ্চিত (law-firm বিশ্লেষণ মাধ্যমে) | "clear and conspicuous" প্রকাশ; advertiser-এর দায় |
| US | Privacy | রাজ্যভিত্তিক আইন | এই রাউন্ডে গবেষণা হয়নি | US-এ প্রবেশের আগে প্রয়োজন |
| UK | ভোক্তা | DMCC Act 2024 — drip pricing ও fake reviews (৬ এপ্রিল ২০২৫ থেকে); subscription নিয়ম (২০২৬ প্রত্যাশিত, অবস্থা Unverified) | আংশিক নিশ্চিত | মোট মূল্য শুরুতেই দেখানো; ভুয়া review নিষিদ্ধ |
| UK/EU | Privacy | UK GDPR/GDPR; ঘরের ছবি ঠিকানাসহ personal data হতে পারে (Irish DPC case study) | সম্ভাব্য | lawful basis, DPIA বিবেচনা |
| Australia | Privacy | Privacy and Other Legislation Amendment Act 2024: statutory tort (১০ জুন ২০২৫); automated decision প্রকাশ (১০/১১ ডিসেম্বর ২০২৬) | law-firm উৎসে নিশ্চিত | AI-সহায়িত সিদ্ধান্ত privacy policy-তে প্রকাশ |
| EU (ভবিষ্যৎ) | AI-generated content | EU AI Act Article 50 (২ আগস্ট ২০২৬ থেকে) | নিশ্চিত (law-firm) | EU-তে গেলে AI image চিহ্নিতকরণ |
| সব | Data/API চুক্তি | Amazon (২৪ ঘণ্টা, ছবি cache নিষেধ — তৃতীয় পক্ষ), Google Maps (৩০ দিন) | আংশিক নিশ্চিত | স্থায়ী catalog-এ এই ডেটা রাখা যাবে না |
| সব | কপিরাইট | retailer-এর পণ্যছবি ও বর্ণনা | সম্ভাব্য | অনুমতি ছাড়া ছবি কপি নয়; লিংক দিন |

### ১৪.২ পণ্যের সীমানা (Product boundaries)
| সহায়তার ধরন | স্বয়ংক্রিয় করা যায়? | প্রয়োজনীয় নিয়ন্ত্রণ |
|---|---|---|
| দৃশ্যগত অনুপ্রেরণা | হ্যাঁ | "ধারণাচিত্র" লেবেল |
| Layout পরামর্শ | হ্যাঁ, সতর্কতাসহ | মাপের উৎস ও অনিশ্চয়তা |
| পণ্য সুপারিশ | হ্যাঁ | উৎস, তারিখ, affiliate প্রকাশ |
| আনুমানিক উপকরণ পরিমাণ | পরে, সতর্কতাসহ | range ও অনুমান |
| সংস্কার খরচ অনুমান | পরে, সতর্কতাসহ | "কোটেশন নয়" |
| Contractor সুপারিশ | পরে | যাচাই প্রক্রিয়া, দায়-সীমা চুক্তি, আইনজীবী |
| পেশাদার design deliverable | মানব পেশাদার দ্বারা | যোগ্যতা |
| নির্মাণ নির্দেশনা | না | — |
| কাঠামোগত/বৈদ্যুতিক/প্লাম্বিং/নিরাপত্তা পরামর্শ | **না** | লাইসেন্সপ্রাপ্ত পেশাদার |

### ১৪.৩ Privacy-by-design (MVP পর্যায়ে ব্যবহারিক)
- ছবি/মাপ নেওয়ার আগে লিখিত (ডিজিটাল) সম্মতি: কী, কেন, কতদিন, কে দেখবে, কোন তৃতীয় পক্ষ (AI provider) — এবং training-এ ব্যবহার **হবে না** (আলাদা opt-in ছাড়া)।
- ন্যূনতম ডেটা: পূর্ণ ঠিকানা নয়, এলাকা; মানুষ/নথি ছাড়া ছবি।
- পরিচয় ডেটা (নাম, ফোন) ও প্রকল্প ডেটা আলাদা ফোল্ডারে।
- সীমিত অ্যাক্সেস (শুধু প্রকল্পে যুক্ত ব্যক্তি), 2FA।
- Retention: প্রকল্প শেষে নির্দিষ্ট সময়ে মুছে ফেলা; গ্রাহক অনুরোধে আগেই।
- তৃতীয় পক্ষ AI: ব্যবহারের আগে তার **বর্তমান official শর্ত** পড়ে নিশ্চিত হতে হবে — এই রিপোর্টে কোনো provider-এর গোপনীয়তা নিশ্চয়তা যাচাই করা হয়নি।
- Incident: কে সিদ্ধান্ত নেবে, কাকে জানাতে হবে (আইনজীবীর সাথে নির্ধারণ)।

### ১৪.৪ আইনি ও পরিচালনগত ঝুঁকি রেজিস্টার
| ID | ঝুঁকি | বাজার/workflow | প্রমাণ | সম্ভাবনা | প্রভাব | নিয়ন্ত্রণ | অবশিষ্ট | মালিক | আইনজীবী? |
|---|---|---|---|---|---|---|---|---|---|
| L1 | সম্মতি ছাড়া ঘরের ছবি প্রক্রিয়াকরণ | BD/সব | PDPO 2025 consent বিধান | মাঝারি (নিয়ন্ত্রণ না থাকলে) | উচ্চ | সম্মতি ফর্ম, ন্যূনতম ডেটা | নিম্ন | Founder | হ্যাঁ |
| L2 | বিদেশি AI provider-এ ছবি পাঠানো = cross-border transfer | BD | PDPO cross-border নিয়ম | মাঝারি | মাঝারি-উচ্চ | provider শর্ত পর্যালোচনা; সম্মতিতে উল্লেখ | মাঝারি | Founder | হ্যাঁ |
| L3 | retailer ডেটা/ছবি অননুমোদিত ব্যবহার | BD | কোনো API/লাইসেন্স পাওয়া যায়নি | উচ্চ (scraping করলে) | উচ্চ | লিখিত অনুমতি; লিংক-মাত্র | নিম্ন | Founder | সম্ভবত |
| L4 | বিভ্রান্তিকর দাম/প্রাপ্যতা দাবি | সব | BD দাম অস্থির | উচ্চ | মাঝারি | তারিখ ও অবস্থা লেবেল | নিম্ন-মাঝারি | Founder | না |
| L5 | অপ্রকাশিত affiliate সম্পর্ক | US/UK/BD | FTC Guides; DMCC | মাঝারি | মাঝারি | স্পষ্ট প্রকাশ | নিম্ন | Founder | না |
| L6 | layout/মাপ ভুলে গ্রাহকের আর্থিক ক্ষতি | সব | geometry অনিশ্চয়তা | মাঝারি | মাঝারি | মাপ-যাচাই, দায়-সীমা শর্ত | মাঝারি | Founder | হ্যাঁ (শর্তাবলি) |
| L7 | কাঠামোগত/বৈদ্যুতিক পরামর্শে দুর্ঘটনা | সব | RAJUK লঙ্ঘন ব্যাপক | নিম্ন (বর্জন করলে) | Critical | এসব পরামর্শ সম্পূর্ণ বর্জন | নিম্ন | Founder | হ্যাঁ |
| L8 | Refund/বিরোধ | সব | — | মাঝারি | নিম্ন-মাঝারি | পূর্বঘোষিত refund নীতি | নিম্ন | Founder | না |
| L9 | ডেটা ফাঁস | সব | — | নিম্ন-মাঝারি | উচ্চ | অ্যাক্সেস নিয়ন্ত্রণ, retention | নিম্ন | Founder | incident হলে |
| L10 | Amazon/Maps শর্ত লঙ্ঘন (ভবিষ্যৎ) | US | ২৪ ঘণ্টা/৩০ দিন নিয়ম | মাঝারি | মাঝারি (অ্যাকাউন্ট বাতিল) | শর্ত অনুযায়ী নকশা | নিম্ন | ভবিষ্যৎ টিম | না |

(সম্ভাবনা/প্রভাব রেটিং বিচারভিত্তিক — কোনো ঘটনার ঐতিহাসিক হার পরিমাপ করা হয়নি।)

---

## ১৫. Go-to-Market ও যাচাই পরীক্ষা (Validation Experiments)

### ১৫.১ প্রাথমিক গ্রাহক ও ব্যবহারের ক্ষেত্র
- **প্রমাণ একটি segment বেছে নেওয়ার জন্য যথেষ্ট নয়** (বিভাগ ৬.৫)। তাই সবচেয়ে ছোট তুলনামূলক পরীক্ষা: segment A (ঢাকার গৃহস্থ) বনাম segment D (ঢাকার ছোট interior studio)।
- Trigger (A): নতুন বাসায় ওঠা, বিয়ে, সন্তান, ঘর পুনর্বিন্যাস। Trigger (D): নতুন ক্লায়েন্ট প্রকল্প।
- বর্তমান বিকল্পের খরচ: সময় (দোকান ঘোরা), ভুল কেনাকাটা, designer ফি — **সাক্ষাৎকারে পরিমাপ করতে হবে।**
- সবচেয়ে ছোট সম্পূর্ণ workflow: বিভাগ ৯.২-এর concierge।
- অর্থপ্রদানের যোগ্য ফলাফল: "আমার ঘরে আঁটবে এমন, বাজেটের মধ্যে, এখন কেনা যায় এমন তালিকা — দ্রুত"।

### ১৫.২ পরীক্ষাসমূহ
| ID | নাম | Hypothesis | অংশগ্রহণকারী | পদ্ধতি | সম্পদ | প্রাথমিক মাপকাঠি | সাফল্য/ব্যর্থতার সীমা | পরের সিদ্ধান্ত | Bias/সীমাবদ্ধতা |
|---|---|---|---|---|---|---|---|---|---|
| E1 | সমস্যা সাক্ষাৎকার | A ও/বা D segment-এ সমস্যা বাস্তব, পুনরাবৃত্ত ও এতে ইতিমধ্যে অর্থ/সময় ব্যয় হয় | ১০–১৫ গৃহস্থ + ১০–১৫ designer | গাইড ১ ও ২ | founder-এর সময় | অতীত ব্যয়/সময়/ভুলের নির্দিষ্ট ঘটনার সংখ্যা | **পরীক্ষার আগে founder লিখবেন** (যেমন: "অর্ধেকের বেশি সাক্ষাৎকারে একটি নির্দিষ্ট অতীত সমস্যা ও ব্যয়") | segment বাছাই বা STOP | নিয়োগ bias; সৌজন্য bias |
| E2 | প্রতিযোগী workflow পরীক্ষা | বিদ্যমান টুল BD scenario-তে বাস্তব পণ্য-তালিকা দিতে পারে না | ৮–১০টি টুল | বিভাগ ৫.৬ protocol | ১–২ দিন; কিছু paid trial (founder অনুমোদন) | rubric স্কোর | — (বর্ণনামূলক) | পার্থক্য দাবি টিকে কিনা | একজন পরীক্ষক; free plan সীমা |
| E3 | ডেটা অডিট | ঢাকায় শোবার ঘরের আসবাবের যাচাইযোগ্য মাপ+দাম সংগ্রহ সম্ভব ও টেকসই | ৫০–১০০ পণ্য | বিভাগ ৮.৮ | ১–২ সপ্তাহ, ১ জন | সম্পূর্ণতার %, সময়/পণ্য, পরিবর্তন-হার | founder-নির্ধারিত (৮.৮-এর উদাহরণ) | catalog পদ্ধতি বা STOP/REVISE | উৎস নির্বাচন bias |
| E4 | Retailer/designer partner আলোচনা | কিছু retailer ডেটা দিতে/referral দিতে রাজি | ৪–৬ retailer, ৩–৫ studio | গাইড ৩ | founder | লিখিত আগ্রহ/অনুমতি | যেমন "অন্তত ২টি লিখিত অনুমতি" (founder স্থির করবেন) | ডেটা কৌশল | মৌখিক আগ্রহ ≠ চুক্তি |
| E5 | Concierge MVP (paid) | গৃহস্থ পূর্বঘোষিত মূল্যে পরিকল্পনা কিনবেন | E1-এর বাইরের নতুন সম্ভাব্য গ্রাহক | Facebook/রেফারেল-এ অফার; ৫–১০টি প্রকল্পের লক্ষ্য | founder + ১ সহকারী (প্রয়োজনে) | paid conversion; H+S; গ্রাহক সন্তুষ্টি | পরীক্ষার আগে founder লিখবেন | Gate 5 | ছোট নমুনা; founder-এর ব্যক্তিগত নেটওয়ার্ক |
| E6 | মূল্য পরীক্ষা | দুটি মূল্যস্তরে conversion ভিন্ন | E5-এর মধ্যে | ভিন্ন সময়ে ভিন্ন মূল্য | — | conversion প্রতি মূল্য | — | মূল্য নির্ধারণ | ছোট নমুনায় শব্দ (noise) |
| E7 | ফলো-আপ ফলাফল | তালিকা প্রকৃত কেনাকাটায় সাহায্য করেছে | E5 গ্রাহক | ২–৪ সপ্তাহ পরে সাক্ষাৎকার | — | কতটি পণ্য কেনা হয়েছে, মাপ মিলেছে, বাজেট বিচ্যুতি | — | পণ্য-মূল্য প্রমাণ | স্মৃতি bias |
| E8 | Designer টুল আগ্রহ (Option C) | studio-রা BOQ/পণ্য-তালিকা সহায়তার জন্য fee দেবে | ৩–৫ studio | একটি প্রকৃত প্রকল্পে হাতে সহায়তা, তারপর মূল্য প্রস্তাব | founder | প্রতিশ্রুতি (Level 3) | founder স্থির করবেন | Option C অগ্রসর বা বাদ | — |

**মনে রাখুন:** sign-up, like, survey উৎসাহ বা বিনামূল্যে ব্যবহার বাণিজ্যিক সম্ভাব্যতার প্রমাণ নয়।

### ১৫.৩ Concierge বনাম স্বয়ংক্রিয় prototype
| | Concierge (মানুষ + সাধারণ টুল) | স্বয়ংক্রিয় prototype |
|---|---|---|
| যা পরীক্ষা করে | চাহিদা, WTP, প্রয়োজনীয় ডেটা, প্রকৃত workflow, মানব-সময় | স্কেলযোগ্যতা, UX, স্বয়ংক্রিয় নির্ভুলতা |
| যা পরীক্ষা করে না | স্বয়ংক্রিয় মান ও খরচ | (যদি চাহিদা না থাকে) কিছুই অর্থবহ নয় |
| খরচ | কম (software নেই) | উচ্চ (উন্নয়ন) |
| **সুপারিশ** | **প্রথমে** | চাহিদা ও ডেটা প্রমাণিত হলে |

### ১৫.৪ যাচাইয়ের ক্রম ও নির্ভরতা
```
সপ্তাহ ১–২ (সমান্তরাল):  E1 সাক্ষাৎকার  |  E2 প্রতিযোগী পরীক্ষা  |  E3 ডেটা অডিট শুরু  |  আইনজীবীর সাথে প্রাথমিক আলাপ
সপ্তাহ ২–৩:              E4 partner আলোচনা (E3-এর প্রাথমিক ফলাফল হাতে নিয়ে)
সপ্তাহ ৩–৪:              E5/E6 concierge অফার (E1-এ সমস্যা নিশ্চিত হলে; সম্মতি ফর্ম প্রস্তুত হলে)
সপ্তাহ ৫–৮ (৩০ দিনের পরে): E7 ফলো-আপ, E3-এর ৪-সপ্তাহ পুনঃপরীক্ষা, unit economics পর্যালোচনা → Gate সিদ্ধান্ত
```
সময়সীমাগুলো **পরিকল্পনা-অনুমান** — founder-এর সময় ও নেটওয়ার্কের উপর নির্ভরশীল।

### ১৫.৫ Founder ও AI-এর দায়িত্ব (I9)
| ঝুঁকিস্তর | কাজ | কে |
|---|---|---|
| নিম্ন — AI অনুমোদিত সীমায় করতে পারে | পাবলিক গবেষণা সংগঠিত করা, উৎস থেকে তথ্য বের করা, তুলনা সারণি, সাক্ষাৎকারের প্রশ্ন খসড়া, সরবরাহকৃত ইনপুটে সূত্র গণনা, অসংগতি চিহ্নিত করা, সারাংশ | Claude |
| মাঝারি — AI সুপারিশ করে, founder পর্যালোচনা করেন | segment বাছাই, পরীক্ষার অগ্রাধিকার, ব্যবসায়িক মডেল, অস্পষ্ট প্রতিক্রিয়ার ব্যাখ্যা, ডেটা provider সুপারিশ, MVP পরিধি, বাণিজ্যিক সম্ভাব্যতা অনুমান | Claude → Founder |
| উচ্চ — স্পষ্ট মানব অনুমোদন | চুক্তি/partnership, অর্থ ব্যয়/বাজেট, আইনি/মূল্য/নিরাপত্তা দাবি প্রকাশ, সংবেদনশীল গ্রাহক ডেটা শেয়ার, পেমেন্ট সংগ্রহ শুরু, আইনি/পেশাদার compliance সিদ্ধান্ত, আর্কিটেকচার/বাস্তবায়ন প্রতিশ্রুতি, ব্যবসা শুরু/বন্ধ | Founder (প্রয়োজনে বিশেষজ্ঞ) |

---

## ১৬. সমন্বিত ঝুঁকি রেজিস্টার (Consolidated Risk Register)

| # | ঝুঁকি | প্রমাণ | প্রভাব | প্রশমন | মালিক | আগাম সতর্কসংকেত | সিদ্ধান্ত-ট্রিগার |
|---|---|---|---|---|---|---|---|
| R1 | জরুরি সমস্যা নেই | সরাসরি প্রমাণ নেই | Critical | E1 | Founder | সাক্ষাৎকারে নির্দিষ্ট অতীত ঘটনা কম | পূর্বনির্ধারিত সীমার নিচে → segment বদল বা STOP |
| R2 | দুর্বল WTP | consumer AI app $5–$30; বিনামূল্যের বিকল্প | Critical | E5/E6 | Founder | অফারে সাড়া কম | paid conversion সীমার নিচে → REVISE (B2B) |
| R3 | শক্তিশালী incumbent | IKEA, Wayfair, Houzz, ChatGPT (US) | উচ্চ | US এড়িয়ে চলা; স্থানীয় ফোকাস | Founder | BD-তে বড় retailer-এর নিজস্ব AI টুল ঘোষণা | পার্থক্য পুনর্মূল্যায়ন |
| R4 | সহজ অনুকরণ | software বৈশিষ্ট্য | উচ্চ | সম্পর্ক + ডেটা + ফলাফল ডেটা | Founder | — | — |
| R5 | ভুল/অনুপলব্ধ পণ্য ডেটা | BD-তে API/feed নেই; দাম অস্থির | উচ্চ | E3; তারিখ-লেবেল | Founder | অডিটে কম সম্পূর্ণতা | সীমার নিচে → ক্যাটাগরি বদল বা STOP |
| R6 | ডেটা রক্ষণাবেক্ষণ অটেকসই | হাতে সংগ্রহ | উচ্চ | পরিবর্তন-হার পরিমাপ; partner feed | Founder | প্রতি পণ্যে বেশি সময় | unit economics নেতিবাচক → REVISE |
| R7 | মাপ/ডিজাইন অবিশ্বাস্য | geometry benchmark নেই | মাঝারি | ব্যবহারকারীর মাপ; লেবেল | Founder | ফলো-আপে মাপ-অমিল | concept image বাদ |
| R8 | AI খরচ > মূল্য | image ~$0.02–$0.13 | নিম্ন | — | — | — | — |
| R9 | উচ্চ CAC | অজানা | উচ্চ | জৈব চ্যানেল, রেফারেল | Founder | প্রতি paid গ্রাহকে খরচ > CM | REVISE |
| R10 | দুর্বল পুনরাবৃত্তি | ঘটনা বিরল | উচ্চ | B2B বিবেচনা | Founder | — | LTV ≈ এককালীন হলে B2B দিকে |
| R11 | কম contribution margin | Modsy/Homepolish সতর্কবার্তা | উচ্চ | মানব-সময় মাপা ও কমানো | Founder | H+S উচ্চ | নেতিবাচক CM → REVISE/STOP |
| R12 | Supplier নির্ভরতা | — | মাঝারি | একাধিক উৎস | Founder | একটি উৎসে অতিনির্ভরতা | — |
| R13 | Marketplace liquidity | Angi সংকোচন | উচ্চ (যদি marketplace করা হয়) | marketplace না করা | Founder | — | — |
| R14 | আইনি/লাইসেন্স সীমা | বিভাগ ১৪ | উচ্চ | আইনজীবী; লিখিত অনুমতি | Founder | — | — |
| R15 | Privacy/cyber incident | — | উচ্চ | ১০.৫ | Founder | — | incident হলে কাজ স্থগিত |
| R16 | অনিরাপদ/বিভ্রান্তিকর সুপারিশ | — | Critical | ১৪.২ সীমানা | Founder | — | — |
| R17 | অতিরিক্ত মানব হস্তক্ষেপ | concierge প্রকৃতি | উচ্চ | সময় পরিমাপ | Founder | — | স্বয়ংক্রিয়করণের পথ না পেলে REVISE |
| R18 | অকাল বহু-দেশ সম্প্রসারণ | — | উচ্চ | ৭.৫ নীতি | Founder | — | — |
| R19 | Founder সক্ষমতা | অজানা | উচ্চ | পরিধি সংকীর্ণ রাখা | Founder | সময়সূচি পিছিয়ে যাওয়া | পরিকল্পনা পুনর্বিন্যাস |
| R20 | Scope creep | vision বিস্তৃত | উচ্চ | Gate নিয়ম; "এখন নয়" তালিকা | Founder | MVP-তে নতুন বৈশিষ্ট্য যোগের চাপ | Gate পর্যালোচনা |
| R21 | BD আবাসন মন্দা (ট্রিগার কম) | ২০২৫-এ ফ্ল্যাট বিক্রি ৪০–৭০% কম (developer বক্তব্য) | মাঝারি | ভাড়াটিয়া ও বিদ্যমান বাসিন্দা অন্তর্ভুক্ত | Founder | গ্রাহক খোঁজা কঠিন | segment সংজ্ঞা বদল |

---

## ১৭. Go / Revise / Stop সিদ্ধান্ত

### ১৭.১ Decision gates
| Gate | প্রশ্ন | প্রয়োজনীয় প্রমাণ | ন্যূনতম ফলাফল | ব্যর্থতার শর্ত | সিদ্ধান্তদাতা | বর্তমান অবস্থা |
|---|---|---|---|---|---|---|
| 1 — সমস্যা | নির্দিষ্ট, পুনরাবৃত্ত, গুরুত্বপূর্ণ সমস্যা আছে? | E1 | founder-নির্ধারিত (পরীক্ষার আগে) | অতীত ব্যয়/কষ্টের প্রমাণ কম | Founder | **খোলা** |
| 2 — গ্রাহক ও বাজার | একটি segment ও ভূগোল অগ্রাধিকার পায়? | E1, E2 | একটি segment স্পষ্টভাবে শক্তিশালী | কোনো segment স্পষ্ট নয় | Founder | **খোলা** (প্রার্থী: ঢাকা; A বনাম D) |
| 3 — ডেটা | ন্যূনতম ডেটা অধিকারসহ গ্রহণযোগ্য খরচে পাওয়া যায়? | E3, E4 | founder-নির্ধারিত সম্পূর্ণতা + লিখিত অনুমতি | কম সম্পূর্ণতা বা অনুমতি নেই | Founder | **খোলা** |
| 4 — পণ্য | workflow গ্রহণযোগ্য নির্ভুলতা ও মানব-সময়ে কাজ করে? | E5, E7 | match rate ও H+S সীমার মধ্যে | গ্রাহক তালিকা ব্যবহার করতে পারেন না | Founder | **খোলা** |
| 5 — বাণিজ্যিক | গ্রাহক/partner টেকসই শর্তে টাকা দেয়? | E5, E6, E8 | positive CM; CAC < CM | কেউ টাকা দেয় না বা CM নেতিবাচক | Founder | **খোলা** |
| 6 — পরিচালন ও আইন | দায়িত্বশীল, নিরাপদ ও আইনানুগভাবে দেওয়া যায়? | আইনজীবী পর্যালোচনা | সম্মতি, শর্তাবলি, refund নীতি প্রস্তুত | অমীমাংসিত আইনি বাধা | Founder + আইনজীবী | **খোলা** |
| 7 — সীমিত launch | সীমিত launch-এর জন্য যথেষ্ট প্রমাণ? | Gate 1–6 | সব পাস | কোনো একটি ব্যর্থ | Founder | ভবিষ্যৎ |

### ১৭.২ তিনটি সম্ভাব্য সিদ্ধান্তের মূল্যায়ন
| সিদ্ধান্ত | পক্ষে প্রমাণ | বিপক্ষে প্রমাণ |
|---|---|---|
| **GO (বড় আকারে build)** | বড় বাজার; AI খরচ কম; BD-তে AI-native প্রতিযোগী not found | কোনো সরাসরি চাহিদা/WTP প্রমাণ নেই; ডেটা অধিকার অনিশ্চিত — **প্রত্যাখ্যাত** |
| **REVISE + সীমিত পরবর্তী যাচাই** | পরোক্ষ WTP সংকেত (Havenly, Sheraspace, Cedreo per-project); স্থানীয় ডেটা-ফাঁক সম্ভাব্য; পরীক্ষা সস্তা | WTP অপ্রমাণিত; Modsy/Homepolish; US-এ প্রতিযোগিতা — **সুপারিশকৃত** |
| **STOP** | US-এ প্রতিযোগিতা অত্যন্ত তীব্র; AI redesign commoditised | এখনো কোনো critical blocker প্রমাণিত হয়নি; সংকীর্ণ স্থানীয় পরীক্ষা সস্তায় করা যায় — **এখন অযৌক্তিক** |

### ১৭.৩ চূড়ান্ত সুপারিশ: **REVISE THE APPROACH — এবং একটি সীমিত GO TO NEXT VALIDATION STAGE**

**কী সংশোধন (Revise):**
1. **"Global platform থেকে শুরু" → "এক শহর, এক ধরনের ঘর, এক ক্যাটাগরি গুচ্ছ থেকে শুরু"** (vision অপরিবর্তিত)।
2. **"AI design" কেন্দ্র → "যাচাইকৃত স্থানীয় পণ্য + মাপ-fit + বাজেট" কেন্দ্র**; AI concept image শুধু সহায়ক।
3. **"Affiliate/marketplace" → "প্রত্যক্ষ pay-per-project (পরীক্ষা) + সম্ভাব্য B2B"**।
4. **"Software আগে" → "Concierge আগে"**।
5. **প্রাথমিক রিপোর্টের কিছু মূল্য-দাবি সংশোধন** (Coohom, Foyr, REimagineHome, Sheraspace — বিভাগ ৫.৪)।

**পরবর্তী ধাপের সর্বোচ্চ প্রতিশ্রুতি (যা বর্তমান প্রমাণ ন্যায্যতা দেয়):**
- ৩০ দিনের desk + field validation (বিভাগ ১৮); কোনো software উন্নয়ন নয়; কোনো দীর্ঘমেয়াদি চুক্তি নয়।
- খরচ: founder-এর সময়, কিছু প্রতিযোগী টুলের ছোট trial, সাক্ষাৎকারদাতাদের সম্ভাব্য সৌজন্য (চা/ছোট উপহার), এবং আইনজীবীর সাথে একটি প্রাথমিক পরামর্শ — সব খরচ founder অনুমোদনসাপেক্ষ (এই রিপোর্ট কোনো অঙ্ক নির্ধারণ করছে না)।

**বড় প্রতিশ্রুতির (যেমন prototype উন্নয়ন) আগে প্রয়োজনীয় প্রমাণ:** Gate 1, 3 পাস এবং Gate 5-এ অন্তত প্রাথমিক Level 3 প্রমাণ (কয়েকটি paid concierge প্রকল্প, positive contribution সম্ভাবনা)।

**আস্থা:** মাঝারি-নিম্ন — কারণ সুপারিশটি মূলত "কী জানি না" তার উপর দাঁড়িয়ে; এটি একটি **শেখার সিদ্ধান্ত**, বিনিয়োগ সিদ্ধান্ত নয়।

**কী এই সুপারিশ বদলাবে:**
- সাক্ষাৎকারে গৃহস্থের সমস্যা দুর্বল কিন্তু designer-দের শক্তিশালী → Option C-তে পরিবর্তন।
- ডেটা অডিটে সম্পূর্ণতা খুব কম ও retailer-রা অসহযোগী → BD-তে Option A দুর্বল; B2B (retailer-এর নিজস্ব catalog) বা STOP বিবেচনা।
- Founder ঢাকায় কাজ করতে না পারলে → ভূগোল পুনর্বিবেচনা।
- কেউ পূর্বঘোষিত মূল্যে টাকা না দিলে → STOP বা মৌলিক REVISE।

### ১৭.৪ কৌশলগত পথ তুলনা (J4) ও Strategic Decision Matrix (M2)
| পথ | লক্ষ্য গ্রাহক | সমস্যা | গ্রাহক মূল্য | প্রতিযোগিতা | ডেটা সম্ভাব্যতা | প্রযুক্তিগত সম্ভাব্যতা | Monetisation প্রমাণ | জটিলতা | আইনি ঝুঁকি | যাচাইয়ের সময় | প্রধান অজানা | সুপারিশ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ১. সংকীর্ণ গৃহস্থ design + পণ্য-আবিষ্কার (BD) | ঢাকার গৃহস্থ | মাপ-বাজেট-পণ্য মেলানো | অজানা | নিম্ন-মাঝারি | মাঝারি (হাতে) | উচ্চ (concierge) | পরোক্ষ | নিম্ন | নিম্ন | দ্রুত | WTP, ডেটা খরচ | **পরীক্ষা করুন (প্রধান)** |
| ১ক. একই, US-এ | US গৃহস্থ | একই | মাঝারি | খুব উচ্চ | উচ্চ কিন্তু সবার জন্য | উচ্চ | Havenly | মাঝারি | মাঝারি | মাঝারি | CAC | এখন নয় |
| ২. সংস্কার পরিকল্পনা ও খরচ | গৃহস্থ | খরচ অনুমান | উচ্চ (যদি নির্ভুল) | মাঝারি | নিম্ন (BD) | মাঝারি | পরোক্ষ | উচ্চ | উচ্চ | ধীর | ডেটা নির্ভুলতা | পরে |
| ৩. পেশাদার design/sourcing assistant | studio/designer | সময়, BOQ, প্রস্তাব | অজানা | BD অজানা; US উচ্চ | মাঝারি | উচ্চ | পরোক্ষ (pro SaaS) | মাঝারি | নিম্ন-মাঝারি | মাঝারি | BD studio-দের WTP | **সমান্তরাল সাক্ষাৎকার** |
| ৪. B2B ডেটা/software (retailer) | ফার্নিচার retailer | visualisation, lead | অজানা | Planner 5D/Coohom (বৈশ্বিক) | উচ্চ (তাদের ডেটা) | মাঝারি | পরোক্ষ | মাঝারি | নিম্ন | মাঝারি-ধীর | retailer-দের বাজেট | partner আলোচনায় যাচাই |
| ৫. পর্যায়ক্রমিক integrated platform | সবাই | সব | — | — | — | — | — | খুব উচ্চ | উচ্চ | খুব ধীর | সব | দীর্ঘমেয়াদি গন্তব্য, শুরু নয় |
| ৬. সমালোচনামূলক অনুমান মীমাংসা না হওয়া পর্যন্ত launch নয় | — | — | — | — | — | — | — | — | — | — | — | **এটাই বর্তমান অবস্থা** — launch নয়, শুধু যাচাই |

(সারণির রেটিং বিচারভিত্তিক; সংখ্যাগত স্কোর ইচ্ছাকৃতভাবে ব্যবহার করা হয়নি যাতে অনুপস্থিত ডেটা লুকানো না যায়।)

### ১৭.৫ প্রাথমিক differentiation hypothesis (K2) মূল্যায়ন
| Hyp. | গ্রাহক সমস্যা | বিদ্যমান বিকল্প | পক্ষে প্রমাণ | বিপক্ষে প্রমাণ | প্রতিযোগী overlap | যাচাই পরীক্ষা | কখন প্রত্যাখ্যান |
|---|---|---|---|---|---|---|---|
| A — যাচাইকৃত স্থানীয় পণ্য ডেটা | AI-আঁকা পণ্য কেনা যায় না | retailer app, ChatGPT | ChatGPT নিজেই দাম/প্রাপ্যতা ভুলের সতর্কতা দেয়; BD-তে feed নেই | US-এ retailer feed সবার কাছে যাচ্ছে | IKEA/Wayfair (একক retailer) | E3, E5 | অডিট ব্যর্থ বা গ্রাহক মূল্য দেয় না |
| B — Design-to-purchase workflow | খণ্ডিত প্রক্রিয়া | Havenly, IKEA, Houzz | Havenly টিকে আছে | Modsy বন্ধ | উচ্চ (US) | E5, E7 | গ্রাহক তালিকা পেয়েও ব্যবহার করে না |
| C — বাজেট-সচেতন সিদ্ধান্ত | অতিরিক্ত ব্যয় | ChatGPT shopping (বাজেট জিজ্ঞাসা করে) | — | ChatGPT বিনামূল্যে করে | উচ্চ | E5, E7 | বাজেট বিচ্যুতিতে উন্নতি নেই |
| D — স্থানীয় সংস্কার বুদ্ধিমত্তা | খরচ অনিশ্চয়তা | contractor, PWD SoR | US-এ এমন app উদ্ভূত হচ্ছে | BD দাম অস্থির; দায় উচ্চ | নিম্ন (BD) | পরে | ডেটা নির্ভুলতা পরিমাপে ব্যর্থ |
| E — স্থায়ী home profile | বারবার তথ্য দেওয়া | কাগজ/ফোন | — | ঘটনা বিরল; privacy ঝুঁকি | Houzz (আংশিক) | পরে; E1-এ প্রশ্ন | গ্রাহক প্রয়োজন অনুভব করে না |
| F — বাস্তব execution সহায়তা | ডিজাইন থেকে কাজ পর্যন্ত | studio, Sheba.xyz | Houzz ৯০% পেশাদার নিয়োগ | marketplace liquidity কঠিন; Angi সংকোচন | উচ্চ | পরে | — |
| G — মানব তত্ত্বাবধান | AI ভুল | মানব designer | concierge-এ নির্ভুলতা বাড়ে (ANALYSIS) | খরচ বাড়ে (Modsy/Homepolish) | Havenly | E5 (H+S পরিমাপ) | CM নেতিবাচক |
| H — সম্মতিভিত্তিক ফলাফল ডেটা | ভবিষ্যৎ সুপারিশ উন্নত | — | সম্ভাব্য দীর্ঘমেয়াদি moat | পরিমাণ ও সম্মতি লাগে; PDPO | — | E7 (সম্মতি হার) | গ্রাহকরা সম্মতি দেয় না |

**কোনোটিকেই moat বলা হচ্ছে না** — সবই অপ্রমাণিত hypothesis।

### ১৭.৬ প্রাথমিক কৌশলগত উপসংহার (K12) পরীক্ষা
প্রাথমিক উপসংহার: "আইডিয়াটি অনুসন্ধানযোগ্য, কিন্তু পুরো global platform বানানোর মতো প্রমাণ নেই; মূল প্রশ্ন AI সুন্দর ছবি বানাতে পারে কিনা নয়, বরং নির্দিষ্ট গ্রাহক নির্ভরযোগ্য স্থানীয় workflow দিয়ে ভালো সিদ্ধান্ত নিতে পারে কিনা ও টেকসইভাবে টাকা দেবে কিনা।"
**রায়: সমর্থিত, দুটি সংশোধনসহ:**
1. প্রমাণ আরও জোরালোভাবে দেখায় যে **AI image নিজে প্রায় মূল্যহীন পার্থক্য** (commoditised) — তাই উপসংহারটি "AI design" কে ঐচ্ছিক উপাদান হিসেবে দেখা উচিত।
2. "Global" প্রশ্নের চেয়ে **"কোন বাজারে স্থানীয় ডেটা-ফাঁক টিকে থাকবে"** প্রশ্নটি বেশি গুরুত্বপূর্ণ: US-এ বড় AI platform-রা retailer feed পাওয়ায় ফাঁকটি দ্রুত বন্ধ হচ্ছে; কম-ডিজিটাইজড বাজারে (যেমন BD) ফাঁকটি বেশি টিকতে পারে — কিন্তু সেখানে WTP কম।

### ১৭.৭ Evidence-to-decision traceability (M3)
| সুপারিশ | তথ্য | উৎস | বিশ্লেষণ | অনুমান | অনিশ্চয়তা | যা বদলাবে |
|---|---|---|---|---|---|---|
| AI image-কে কেন্দ্র না করা | বহু টুল $0–$30; IKEA/Wayfair বিনামূল্যে | decorai.io; IKEA, Wayfair newsroom | commoditised | — | নিম্ন | গ্রাহক সাক্ষাৎকারে image-ই প্রধান মূল্য দেখা গেলে |
| US-এ শুরু না করা | Angi সংকোচন; ChatGPT shopping; ACP/UCP | Angi IR; OpenAI docs; trade press | উচ্চ প্রতিযোগিতা, ডেটা-সুবিধা ক্ষয় | US CAC উচ্চ | মাঝারি | founder-এর US niche চ্যানেল থাকলে |
| ঢাকায় যাচাই | BD-তে feed/API not found; Sheraspace অনলাইন consultation | Navana site; TBS/UNB | কম প্রতিযোগিতা, কিন্তু অপ্রমাণিত চাহিদা | founder ঢাকায়; সস্তা পরীক্ষা | উচ্চ | founder-এর অবস্থান; E1/E3 ফল |
| Concierge আগে | Modsy/Homepolish; মানব-সময় সবচেয়ে সংবেদনশীল | Fortune; BoH; বিভাগ ১২ | software-এর আগে চাহিদা ও খরচ শেখা | — | নিম্ন | — |
| শুধু affiliate নয় | Amazon ৩–৪%; BD retailer affiliate not found | Amazon; Martech | illustrative হিসাবে নগণ্য আয় | ক্রয়-অনুপাত | মাঝারি | উচ্চ referral চুক্তি পেলে |
| নিরাপত্তা পরামর্শ বর্জন | RAJUK লঙ্ঘন ব্যাপক; geometry benchmark নেই | Dhaka Tribune; arXiv | দায় ঝুঁকি Critical | — | নিম্ন | — |

---

## ১৮. প্রস্তাবিত ৩০-দিনের কর্মপরিকল্পনা

> Founder-এর কোনো টিম, বাজেট, supplier চুক্তি বা যাচাইকৃত গ্রাহক আছে বলে ধরে নেওয়া হয়নি।

| অগ্রাধিকার | কাজ | প্রত্যাশিত output | দায়িত্ব | নির্ভরতা | সময় (পরিকল্পনা-অনুমান) | সাফল্যের মানদণ্ড | যে সিদ্ধান্ত সক্ষম করে |
|---|---|---|---|---|---|---|---|
| P0 | Founder প্রশ্নের উত্তর (বিভাগ ১৯–২০) | অবস্থান, সময়, বাজেট-সীমা, সম্পর্ক | Founder | — | দিন ১–২ | উত্তর লিখিত | ভূগোল, পরিধি |
| P0 | সাফল্য/ব্যর্থতার সীমা লিখে ফেলা (E1, E3, E5) | এক পাতার নথি | Founder + Claude খসড়া | উপরের | দিন ২–৩ | পরীক্ষার আগে স্বাক্ষরিত | পক্ষপাতমুক্ত Gate |
| P0 | সাক্ষাৎকারদাতা নিয়োগ ও E1 পরিচালনা | ২০–৩০টি নোট | Founder | গাইড (প্রস্তুত) | দিন ৩–১৮ | পরিকল্পিত সংখ্যা সম্পূর্ণ | Gate 1, 2 |
| P0 | E3 ডেটা অডিট | ৫০–১০০ পণ্যের স্প্রেডশিট; site terms নোট | Founder/সহকারী (Claude টেমপ্লেট ও বিশ্লেষণে সাহায্য করতে পারে) | — | দিন ৩–১৪ (+৪ সপ্তাহে পুনঃপরীক্ষা) | সম্পূর্ণতা % গণনা | Gate 3 |
| P1 | E2 প্রতিযোগী পরীক্ষা | rubric স্কোরসহ সারণি | Founder | ছোট trial খরচ (অনুমোদন) | দিন ৫–১০ | ৮–১০টি টুল পরীক্ষিত | পার্থক্য দাবি |
| P1 | Sheraspace ও ২–৩টি স্থানীয় studio-র বর্তমান অফার/মূল্য সংগ্রহ | benchmark | Founder | — | দিন ৫–১০ | লিখিত মূল্য | মূল্য নির্ধারণ |
| P1 | আইনজীবীর সাথে প্রাথমিক পরামর্শ (PDPO, সম্মতি ফর্ম, শর্তাবলি, cross-border) | ঝুঁকি তালিকা | External | বাজেট অনুমোদন | দিন ৭–২০ | লিখিত মতামত | Gate 6 |
| P1 | E4 retailer/studio আলোচনা | লিখিত আগ্রহ/অনুমতি | Founder | E3 প্রাথমিক ফল | দিন ১২–২৫ | অন্তত কয়েকটি লিখিত উত্তর | ডেটা কৌশল |
| P1 | সম্মতি ফর্ম, refund নীতি, concierge intake টেমপ্লেট | নথি | Claude খসড়া → Founder + আইনজীবী | আইনি পরামর্শ | দিন ১৫–২০ | অনুমোদিত | E5 শুরু |
| P2 | E5/E6 concierge অফার ও প্রকল্প | paid প্রকল্প ও timesheet | Founder | E1 সমস্যা নিশ্চিত; সম্মতি প্রস্তুত | দিন ২০–৩০ (চলমান) | পূর্বনির্ধারিত সীমা | Gate 4, 5 |
| P2 | Unit economics আপডেট | প্রকৃত ইনপুটে বিভাগ ১২ | Claude (ইনপুট পেলে) | E5 ডেটা | দিন ৩০ | — | Go/Revise/Stop |
| P2 | সমন্বিত Gate পর্যালোচনা | সিদ্ধান্ত নথি | Founder + Claude | উপরের সব | দিন ৩০ (+ফলো-আপ সপ্তাহ ৫–৮) | — | পরবর্তী ধাপ |

**Founder এখনই যা করতে পারেন (খরচ ছাড়া):** প্রশ্নের উত্তর, সীমা লেখা, পরিচিত-অপরিচিত মিলিয়ে সাক্ষাৎকার শুরু, ডেটা অডিট শুরু।
**বাইরের সহযোগিতা/খরচ প্রয়োজন:** প্রতিযোগী paid trial, আইনজীবী, retailer সময়, concierge-এর পেমেন্ট গ্রহণ ব্যবস্থা।

---

## ১৯. Founder Decision Register (অগ্রাধিকারভিত্তিক)

| ID | প্রয়োজনীয় সিদ্ধান্ত | কেন গুরুত্বপূর্ণ | বিকল্প | উপলব্ধ প্রমাণ | অনুপস্থিত প্রমাণ | তাড়াহুড়োর ঝুঁকি | নির্ভরতা | সুপারিশকৃত পরবর্তী পদক্ষেপ |
|---|---|---|---|---|---|---|---|---|
| F1 | প্রথম যাচাইয়ের ভূগোল | সব পরীক্ষা এর উপর | ঢাকা / US niche / অন্য | বিভাগ ৭ | founder-এর অবস্থান ও সম্পর্ক | ভুল বাজারে সময় নষ্ট | — | founder-এর অবস্থান জানালে ঢাকা অনুমোদন বা বিকল্প নির্ধারণ |
| F2 | ৩০-দিনের যাচাই পরিকল্পনা অনুমোদন (software উন্নয়ন ছাড়া) | পরবর্তী সর্বোচ্চ প্রতিশ্রুতি | অনুমোদন / সংশোধন / STOP | বিভাগ ১৭–১৮ | — | build-এ ঝাঁপ দেওয়া | F1 | অনুমোদন |
| F3 | তুলনামূলক segment (A বনাম D, + F-কে partner হিসেবে) | ভুল গ্রাহক = ভুল পণ্য | A / D / উভয় | বিভাগ ৬ | সাক্ষাৎকার | সংকীর্ণ ভুল বাছাই | F1 | উভয় সাক্ষাৎকারে |
| F4 | পরীক্ষার সাফল্য/ব্যর্থতার সীমা | পক্ষপাত রোধ | founder লিখবেন | ৮.৮, ৯.৪, ১৫.২ | — | পরে সীমা বদলানো | F2 | পরীক্ষার আগে লিখুন |
| F5 | যাচাই বাজেটের সর্বোচ্চ সীমা | ঝুঁকি সীমিত রাখা | founder নির্ধারণ | — | founder-এর সামর্থ্য | অতিরিক্ত খরচ | F2 | এক অঙ্কের সীমা স্থির |
| F6 | Concierge মূল্য (১–২টি স্তর) ও refund নীতি | WTP পরীক্ষা | founder নির্ধারণ | ৫.৪, ১১ | স্থানীয় benchmark | খুব কম মূল্যে ভুল সংকেত | E1, benchmark | সপ্তাহ ২-এ নির্ধারণ |
| F7 | আইনজীবী নিয়োগ (সীমিত পরিধি) | PDPO, শর্তাবলি | হ্যাঁ/না | বিভাগ ১৪ | — | আইনি ঝুঁকি | F5 | হ্যাঁ, concierge-এর আগে |
| F8 | (ঐচ্ছিক) এই environment-এ network access বাড়ানো | official page সরাসরি যাচাই | হ্যাঁ/না | বিভাগ ৩.২ | — | — | — | চাইলে settings-এ allowed domains যোগ |

---

## ২০. অমীমাংসিত প্রশ্ন (Unresolved Questions)

### ২০.১ Founder-এর কাছে প্রশ্ন (উত্তর সিদ্ধান্ত বদলাতে পারে)
1. আপনি কোন দেশ/শহরে থাকেন এবং কোথায় নিয়মিত মাঠপর্যায়ে কাজ করতে পারবেন?
2. এই প্রকল্পে সপ্তাহে কত সময় দিতে পারবেন? কোনো সহ-প্রতিষ্ঠাতা বা টিম আছে?
3. যাচাই পর্যায়ের জন্য সর্বোচ্চ কত খরচ করতে প্রস্তুত?
4. কোনো ফার্নিচার retailer, interior studio, developer বা নির্মাণ-সংশ্লিষ্ট প্রতিষ্ঠানের সাথে আপনার বিদ্যমান সম্পর্ক আছে কি?
5. আপনার নিজের interior/ডিজাইন/নির্মাণ অভিজ্ঞতা কতটুকু? (concierge কে করবেন)
6. প্রাথমিক রিপোর্টের মূল্য-লিড (বিশেষত Sheraspace-এর BDT 3,800/6,000/8,500 ও Navana-র ৫০৯ ফলাফল) কোথা থেকে এসেছিল? মূল উৎস থাকলে দিন।

### ২০.২ গবেষণার প্রশ্ন যা এখনো খোলা
- BD-তে প্রতি বছর কতগুলো পরিবার ঘর সাজায়/সংস্কার করে; ভাড়াটিয়া বনাম মালিক অনুপাত।
- HATIL, Regal, Akhtar, Otobi, Partex-এর অনলাইন catalog-এ মাপ/দাম কতটা সম্পূর্ণ; তাদের site terms।
- Daraz affiliate-এর প্রকৃত ফার্নিচার কমিশন হার; bKash/SSLCommerz-এ recurring billing।
- PDPO 2025-এর বর্তমান আইনি অবস্থা ও কার্যকর তারিখ।
- BNBC 2020-এ interior alteration বিধান।
- Sheraspace-এর বর্তমান অবস্থা ও মূল্য।
- AI-generated layout-এর মাত্রাগত নির্ভুলতা (hands-on পরীক্ষা প্রয়োজন)।
- US/UK/AU-এর privacy ও consumer আইনের বিস্তারিত (যদি সেসব বাজার বিবেচনায় আসে)।
- Category I (home maintenance) প্রতিযোগী — এই রাউন্ডে গভীরভাবে দেখা হয়নি।

### ২০.৩ বিশেষজ্ঞ প্রয়োজন
- বাংলাদেশি আইনজীবী (data protection, consumer, ই-কমার্স, চুক্তি)।
- স্থপতি/প্রকৌশলী (ভবিষ্যৎ renovation বৈশিষ্ট্যের সীমানা নির্ধারণে)।
- হিসাবরক্ষক (VAT/কর, পেমেন্ট)।

---

## ২১. উৎস ও প্রমাণ পরিশিষ্ট
সম্পূর্ণ উৎস তালিকা `03_sources_appendix.md`-এ (প্রকাশক, URL, তারিখ, প্রবেশের তারিখ, কী প্রমাণ করে, সীমাবদ্ধতা)। কাঁচা অনুসন্ধান-নোট `04_research_log.md`-এ।

---

## পরিশিষ্ট — চূড়ান্ত মান-নিয়ন্ত্রণ পর্যালোচনা (Workstream N)

| পরীক্ষা | ফলাফল |
|---|---|
| Workstream-গুলোর মধ্যে বিরোধ | পরীক্ষিত: ভূগোল (BD প্রার্থী) ও MVP (concierge A) সামঞ্জস্যপূর্ণ; segment সিদ্ধান্ত ইচ্ছাকৃতভাবে খোলা রাখা হয়েছে। একটি টানাপোড়েন স্বীকৃত: "ডেটা সহজ = moat কম" (US) বনাম "ডেটা কঠিন = খরচ বেশি" (BD)। |
| গুরুত্বপূর্ণ বাণিজ্যিক দাবি পুনঃপরীক্ষা | মূল্যগুলো একাধিক উৎসে মেলানো হয়েছে; official page সরাসরি খোলা যায়নি — স্পষ্টভাবে উল্লেখিত। |
| কোম্পানির বিপণন বনাম যাচাইকৃত | প্রোফাইলে "দাবি" লেবেল; matrix-এ V = কোম্পানির দাবি, hands-on নয়। |
| Global vision বনাম প্রাথমিক পরিধি | বিভাগ ২ ও ৯.৩-এ আলাদা। |
| সংখ্যাগত হিসাব | বিভাগ ১১.৩ (150,000 × 0.2 × 0.9 × 0.03 = 810 ✓) ও ১২.৩ (সারণির নিচে যাচাই) পরীক্ষিত। |
| অসমর্থিত উপসংহার | কোনো TAM/SAM/SOM, CAC, LTV সংখ্যা দেওয়া হয়নি; segment/দেশ স্কোর সংখ্যাগত নয়। |
| পুনরাবৃত্ত সুপারিশ | সংকলিত (বিভাগ ১৭–১৯)। |
| Founder সিদ্ধান্ত | বিভাগ ১৯। |
| অজানা | বিভাগ ৪.৩ ও ২০। |
| সুপারিশের বিপক্ষে শক্তিশালী প্রমাণ | বিভাগ ১.৩ ও ১৭.২। |
| বানোয়াট তথ্য | কোনো সাক্ষাৎকার, পরীক্ষা, partnership, মূল্য বা ফলাফল বানানো হয়নি; illustrative সংখ্যা স্পষ্টভাবে চিহ্নিত। |

**Implementation boundary:** এই রিপোর্ট কোনো production code, চূড়ান্ত PRD বা build prompt দিচ্ছে না। পরবর্তী পর্যায়ে যাওয়ার আগে founder-এর স্পষ্ট অনুমোদন প্রয়োজন: কৌশলগত দিক, প্রাথমিক segment, ভূগোল, MVP পরিধি, ব্যবসায়িক মডেল, গুরুত্বপূর্ণ ডেটা অধিকার ও আর্থিক অনুমান।

> **মূলনীতি:** Vision রক্ষা করুন। প্রমাণ যাচাই করুন। প্রথম পরীক্ষা সংকীর্ণ রাখুন। ক্ষতির ঝুঁকি সীমিত রাখুন। স্কেল করার অধিকার অর্জন করুন।
