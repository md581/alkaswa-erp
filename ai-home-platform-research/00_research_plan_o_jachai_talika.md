# Global AI Home Solution Platform — গবেষণা পরিকল্পনা (Research Plan) ও যাচাই তালিকা (Verification List)

- **গবেষণার তারিখ:** ১৪ অক্টোবর ২০২৬
- **পর্যায়:** Phase 1 — শুধুমাত্র গবেষণা ও বিশ্লেষণ (Research & Analysis Only)
- **Implementation Status:** অনুমোদিত নয় (Not Approved) — কোনো কোড, PRD, ডাটাবেস বা UI তৈরি করা হবে না
- **ফোল্ডার:** `ai-home-platform-research/` — এই প্রকল্পের জন্য নতুন ফোল্ডার; repository-র আগের কোনো ফাইল বা ফোল্ডার (ERP কোড, `docs/` ইত্যাদি) এই গবেষণায় উৎস হিসেবে ব্যবহার করা হয়নি।

---

## ০. লেবেল ব্যবহারের নিয়ম

| লেবেল | অর্থ |
|---|---|
| **FACT (তথ্য)** | নির্ভরযোগ্য উৎস দ্বারা সমর্থিত বক্তব্য — উৎস সঙ্গে দেওয়া থাকবে |
| **EVIDENCE (প্রমাণ)** | যে উৎস/ডেটা/পর্যবেক্ষণ একটি দাবিকে সমর্থন করে |
| **ANALYSIS (বিশ্লেষণ)** | প্রমাণের ভিত্তিতে আমার ব্যাখ্যা |
| **ASSUMPTION (অনুমান)** | এখনো যাচাই হয়নি |
| **RECOMMENDATION (সুপারিশ)** | প্রমাণের ভিত্তিতে প্রস্তাবিত পদক্ষেপ |
| **INSUFFICIENT EVIDENCE (অপর্যাপ্ত প্রমাণ)** | নির্ভরযোগ্য সিদ্ধান্তে পৌঁছানোর মতো তথ্য নেই |

**আমার সক্ষমতার সীমা (Rule 13):** আমি অনলাইনে public source পড়তে, তুলনা করতে ও বিশ্লেষণ করতে পারি। আমি কোনো গ্রাহক সাক্ষাৎকার, supplier আলোচনা, paid product ব্যবহার, usability test বা paid pilot করিনি এবং করতে পারি না। কিছু ওয়েবসাইট (JavaScript-নির্ভর pricing page, bot-blocking সাইট) আমার fetch tool দিয়ে খোলা নাও যেতে পারে — সেক্ষেত্রে স্পষ্টভাবে "যাচাই করা যায়নি" লেখা হবে।

---

## ১. প্রাথমিক গবেষণা মানচিত্র (Initial Research Map)

### ১.১ মূল ব্যবসায়িক অনুমান (Core Business Hypothesis)
একটি নির্দিষ্ট গ্রাহক গোষ্ঠী একটি বিশ্বাসযোগ্য, স্থানীয়ভাবে প্রাসঙ্গিক AI-সহায়িত home workflow ব্যবহার করে বাস্তব জীবনে আরও ভালো সিদ্ধান্ত নিতে পারবে, এবং সেই গ্রাহক বা কোনো ব্যবসায়িক partner এর জন্য এতটা অর্থ দেবে যা ব্যবসাটিকে টেকসই (sustainable) করবে।

### ১.২ সবচেয়ে গুরুত্বপূর্ণ অনুমানসমূহ (Key Assumptions)
| ID | অনুমান | কেন গুরুত্বপূর্ণ |
|---|---|---|
| A1 | গ্রাহকের কাছে "ডিজাইন → বাস্তব পণ্য → বাজেট" সমস্যাটি যথেষ্ট কষ্টদায়ক (painful) | না হলে পুরো value proposition দুর্বল |
| A2 | গ্রাহক বিনামূল্যের বিকল্প (ChatGPT, retailer app, Pinterest) ছেড়ে অর্থ দেবে | Willingness to pay (মূল্য দেওয়ার ইচ্ছা) না থাকলে ব্যবসা নেই |
| A3 | স্থানীয় পণ্যের ডেটা (দাম, মাপ, প্রাপ্যতা) বৈধভাবে ও সাশ্রয়ে পাওয়া ও হালনাগাদ রাখা সম্ভব | Data engine-ই প্রস্তাবিত পার্থক্যের (differentiation) ভিত্তি |
| A4 | AI ছবি থেকে মাপ/geometry যথেষ্ট নির্ভুলভাবে বজায় রাখতে পারে | না পারলে "বাস্তব সিদ্ধান্ত" দাবি ভুল হবে |
| A5 | গ্রাহক অর্জনের খরচ (CAC — Customer Acquisition Cost) প্রতি project-এর contribution-এর চেয়ে কম হবে | Unit economics |
| A6 | প্রতিযোগীরা এই connected workflow ইতিমধ্যে ভালোভাবে দিচ্ছে না | না হলে নতুন প্রবেশকারীর সুযোগ সংকীর্ণ |
| A7 | Retailer/supplier-রা ডেটা দিতে বা অংশ নিতে আগ্রহী | Partner-নির্ভর মডেলের ভিত্তি |
| A8 | একটি দেশে শেখা workflow অন্য দেশে ছড়ানো যায় (global-core/local-adapter) | দীর্ঘমেয়াদি global vision |

### ১.৩ সবচেয়ে বড় ঝুঁকি (Biggest Risks)
1. জরুরি সমস্যা না থাকা / মূল্য দেওয়ার ইচ্ছা দুর্বল।
2. AI room redesign বৈশিষ্ট্যটি ইতিমধ্যে commoditised (সস্তা ও সহজলভ্য) — প্রতিযোগিতা তীব্র।
3. পণ্য ডেটার অধিকার (data rights) ও হালনাগাদ রাখার খরচ।
4. Affiliate commission কম হওয়ায় শুধু affiliate দিয়ে ব্যবসা না চলা।
5. Scope creep — "সবকিছু" বানাতে গিয়ে কিছুই ভালো না হওয়া।
6. নির্মাণ/নিরাপত্তা-সংক্রান্ত পরামর্শে আইনি দায় (liability)।

### ১.৪–১.৯ মূল প্রশ্নসমূহ (সংক্ষেপে)
- **প্রতিযোগী:** কে ইতিমধ্যে design + real product + budget + execution সংযুক্ত করে? দাম কত? কোন দেশে?
- **গ্রাহক:** কে সবচেয়ে বেশি কষ্টে আছে, কত ঘন ঘন, কে টাকা দেয়, বর্তমানে কী করে?
- **ডেটা ও লাইসেন্সিং:** কোন উৎস থেকে কোন ডেটা বৈধভাবে store/cache/redistribute করা যায়?
- **বাজার নির্বাচন:** বাংলাদেশ বনাম US/UK/Australia — কোথায় দ্রুত ও সস্তায় যাচাই সম্ভব?
- **আর্থিক:** প্রতি project আয় বনাম পরিবর্তনশীল খরচ (AI, ডেটা, মানব review, support, CAC)।
- **প্রযুক্তিগত ও আইনি:** AI geometry নির্ভরযোগ্যতা, গোপনীয়তা আইন (GDPR/UK GDPR/Australia Privacy Act/বাংলাদেশ), affiliate disclosure, বিল্ডিং কোড।

### ১.১০ পণ্য-উন্নয়ন সিদ্ধান্তের আগে প্রয়োজনীয় গবেষণা
১) গ্রাহক সমস্যা সাক্ষাৎকার, ২) প্রতিযোগী hands-on test, ৩) সংকীর্ণ ডেটা অডিট, ৪) partner আলোচনা, ৫) concierge MVP, ৬) paid pilot।

---

## ২. নির্ভরশীলতা-ভিত্তিক গবেষণা পরিকল্পনা (Dependency-aware Research Plan)

```
ধাপ ১ (Desk research — Claude করতে পারে)
 ├─ 1a. প্রাথমিক রিপোর্টের দাবি যাচাই (K4 মূল্য, K5 ডেটা লিড, K3 প্রতিষ্ঠান)
 ├─ 1b. প্রতিযোগী প্রোফাইল (Category A–J)
 ├─ 1c. ডেটা উৎস ও API শর্ত (Amazon, IKEA, Google Maps, OSM, PWD)
 ├─ 1d. আইনি কাঠামো (প্রতিটি সম্ভাব্য দেশ)
 └─ 1e. বাজার-স্তরের পরিসংখ্যান (housing, renovation, ই-কমার্স)
        │
ধাপ ২ (বিশ্লেষণ — Claude)  ← ধাপ ১-এর উপর নির্ভরশীল
 ├─ প্রতিযোগী matrix ও differentiation
 ├─ segment ও দেশ scorecard + sensitivity analysis
 ├─ ৪টি product option তুলনা
 └─ unit economics formula ও illustrative scenario
        │
ধাপ ৩ (বাস্তব যাচাই — Founder প্রয়োজন)  ← ধাপ ২-এর সুপারিশ অনুযায়ী
 ├─ গ্রাহক সাক্ষাৎকার (Founder)
 ├─ প্রতিযোগী hands-on test (Founder/সহকারী)
 ├─ ৫০–১০০ পণ্যের ডেটা অডিট (Founder + Claude সহায়তা)
 ├─ Retailer/supplier আলোচনা (Founder)
 └─ আইনি পরামর্শ (External lawyer)
        │
ধাপ ৪ — Concierge MVP → Paid pilot → Go/Revise/Stop
```

### কাজের দায়িত্ব বিভাজন
| ধরন | উদাহরণ | কে করবে |
|---|---|---|
| অনলাইনে Claude যা করতে পারে | pricing page, API docs, আইন, সরকারি নথি, বাজার পরিসংখ্যান | Claude |
| Founder প্রয়োজন | সাক্ষাৎকার, supplier যোগাযোগ, paid trial, টাকা খরচ | Founder |
| বিশেষজ্ঞ প্রয়োজন | আইনি মতামত, structural/স্থাপত্য পর্যালোচনা, কর | আইনজীবী/প্রকৌশলী/হিসাবরক্ষক |
| Live prototype প্রয়োজন | workflow completion, product match accuracy, paid conversion | Founder + (অনুমোদনের পরে) ডেভেলপার |

---

## ৩. যাচাই তালিকা (Verification Register — প্রাথমিক অবস্থা)

> নিচের সব দাবির প্রাথমিক status "Unverified"। গবেষণার পর চূড়ান্ত status `02_verification_register.md`-এ লিখা হবে।

| Claim ID | দাবি (প্রাথমিক রিপোর্ট থেকে) | শ্রেণি | যাচাইয়ের উৎস (পরিকল্পিত) | অগ্রাধিকার |
|---|---|---|---|---|
| P-01 | Houzz Pro ~$99/$199/$399 প্রতি মাস | মূল্য | houzz.com/pro pricing | মাঝারি |
| P-02 | Planner 5D Premium ~$19.99, Professional ~$49.99 | মূল্য | planner5d.com pricing | মাঝারি |
| P-03 | Homestyler Pro+ ~$6.80/মাস থেকে | মূল্য | homestyler.com pricing | মাঝারি |
| P-04 | Coohom Pro ~$9/মাস | মূল্য | coohom.com pricing | মাঝারি |
| P-05 | REimagineHome $19/$36/$59/$119 | মূল্য | reimaginehome.ai pricing | মাঝারি |
| P-06 | Foyr Neo $33/$67/$103 | মূল্য | foyr.com pricing | মাঝারি |
| P-07 | Maket Homeowner ~$20, Pro ~$100 | মূল্য | maket.ai pricing | মাঝারি |
| P-08 | Sheraspace BDT 3,800/6,000/8,500 প্রতি রুম (≤২০০ বর্গফুট) | মূল্য (BD) | sheraspace.com | উচ্চ (BD বাজারের WTP সংকেত) |
| D-01 | Navana Furniture অনলাইন শপে ~৫০৯টি ফলাফল | ডেটা | navanafurniture.com | উচ্চ |
| D-02 | Bangladesh PWD Schedule of Rates 2022 (Civil, E/M, Retrofitting) ও ২০২৬ lift/escalator এন্ট্রি | ডেটা | pwd.gov.bd | উচ্চ |
| D-03 | Amazon Creators API — product data/affiliate integration | ডেটা/লাইসেন্স | affiliate-program.amazon.com | উচ্চ |
| D-04 | Mapping provider শর্ত (Google Maps Platform / OSM) | ডেটা/লাইসেন্স | official terms | মাঝারি |
| C-01–C-17 | তালিকাভুক্ত প্রতিষ্ঠানগুলো (Houzz, Planner 5D, Homestyler, Coohom, Foyr, Cedreo, Maket, REimagineHome, IKEA Kreativ, Angi, Thumbtack, Sheba.xyz, Sheraspace, Sampotti Design, Interior Studio Ace, Amara Group, Navana Furniture) বর্তমানে সক্রিয় ও তাদের সক্ষমতা | প্রতিযোগী | official websites | উচ্চ |
| M-01 | বাংলাদেশ, US, UK, Australia — প্রাথমিক বাজার প্রার্থী | বাজার | সরকারি পরিসংখ্যান | উচ্চ |
| B-01 | Pay-per-project + সীমিত free tier প্রাথমিক রাজস্ব মডেল হতে পারে | ব্যবসায়িক মডেল | প্রতিযোগী মূল্য + গ্রাহক গবেষণা (founder) | উচ্চ |

---

## ৪. ফাইল কাঠামো (এই ফোল্ডারে)

| ফাইল | বিষয়বস্তু |
|---|---|
| `00_research_plan_o_jachai_talika.md` | এই ফাইল — পরিকল্পনা ও যাচাই তালিকা |
| `01_strategic_research_report.md` | পূর্ণাঙ্গ সমন্বিত কৌশলগত গবেষণা রিপোর্ট (২১টি বিভাগ) |
| `02_verification_register.md` | প্রতিটি প্রাথমিক দাবির যাচাই ফলাফল |
| `03_sources_appendix.md` | উৎস তালিকা (URL, তারিখ, কী প্রমাণ করে, সীমাবদ্ধতা) |

গবেষণা চলাকালীন নতুন তথ্য পেলে এই পরিকল্পনা হালনাগাদ করা হবে।

---

## ৫. অগ্রগতি (১৪ অক্টোবর ২০২৬)
- ধাপ ১ (desk research) ও ধাপ ২ (বিশ্লেষণ) সম্পন্ন — ফলাফল `01_strategic_research_report.md`-এ।
- প্রতিটি দাবির চূড়ান্ত status: `02_verification_register.md`; উৎস: `03_sources_appendix.md`; কাঁচা লগ: `04_research_log.md` (ফাইল কাঠামোয় নতুন যোগ)।
- ধাপ ৩ (বাস্তব যাচাই) — **founder-এর অনুমোদন ও অংশগ্রহণের অপেক্ষায়।** কোনো বাস্তব গবেষণা করা হয়নি।
