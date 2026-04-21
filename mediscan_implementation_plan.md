# 🏥 MediScan AI — Feature Implementation Plan

> **Project Vision:** A platform where normal users (who don't understand medical jargon) can upload lab reports, get AI-powered simple explanations, and have doctors verify the analysis for trust & accuracy.

---

## ✅ Already Completed

| Feature | Status |
|---|---|
| Report Upload + OCR + AI Analysis | ✅ Done |
| OpenRouter Multi-Model AI (with fallback) | ✅ Done |
| Simple Language AI Prompts (layman terms) | ✅ Done |
| Multi-file Upload Support | ✅ Done |
| Doctor Approval Panel | ✅ Done |
| 10 Indian Languages Translation | ✅ Done |
| Real-time Notifications (Socket.io) | ✅ Done |
| AI Chat Assistant | ✅ Done |
| Google OAuth + Email Auth | ✅ Done |
| Profile Management | ✅ Done |
| **Reference Values Dashboard (50+ params)** | ✅ Just Added |

---

## 🚀 Phase 1 — Core User Features (High Impact, 1-2 weeks)

### 1.1 Health Trend Charts 📈
**Why:** If user uploads multiple reports over time, show them a visual graph of how their Hemoglobin, Sugar, Cholesterol etc. is trending — "Pichle 6 months mein aapka HbA1c badh raha hai"

**Implementation:**
- **Backend:** New API endpoint `GET /api/reports/trends` — extract numeric values from all user reports, group by test name, sort by date
- **Frontend:** New `HealthTrends.jsx` page with line charts (use `recharts` library)
- **AI Enhancement:** AI generates a trend summary — "Your sugar has been increasing, consider diet changes"

**Files to modify:**
- `server/src/controllers/reportController.js` — add `getHealthTrends`
- `server/src/routes/reportRoutes.js` — add route
- `client/src/pages/HealthTrends.jsx` — new page
- `client/src/App.jsx` — add route

---

### 1.2 Report Comparison (Side-by-Side) 🔄
**Why:** Doctor and user dono dekh saken ki improvement aayi ya nahi — two reports side-by-side with highlighted differences

**Implementation:**
- **Frontend:** New `CompareReports.jsx` page — user selects 2 reports, shows them side by side with color-coded diff (green = improved, red = worsened)
- **AI Enhancement:** AI generates comparison summary — "Your cholesterol improved but kidney function needs attention"

**Files to modify:**
- `client/src/pages/CompareReports.jsx` — new page
- `client/src/App.jsx` — add route
- `server/src/utils/aiService.js` — add `compareReports()` function

---

### 1.3 Health Score (0-100) 🎯
**Why:** Ek single number jo user ko bataye — "Overall aapki health kaisi hai" — color coded (Green/Yellow/Red)

**Implementation:**
- **Backend:** Calculate score from latest report's values vs reference ranges
- **Frontend:** Beautiful animated circular gauge on Dashboard showing Health Score
- **AI Enhancement:** AI explains why score is what it is

**Files to modify:**
- `server/src/controllers/reportController.js` — add `getHealthScore`
- `client/src/pages/Dashboard.jsx` — add Health Score widget

---

## 🏥 Phase 2 — Doctor Panel Enhancement (1-2 weeks)

### 2.1 Doctor Verification System 🔒
**Why:** Abhi koi bhi doctor ban sakta hai — Medical Council number ya document upload karke verification honi chahiye

**Implementation:**
- **Backend:** Add `verificationDocument`, `medicalCouncilNumber`, `isVerified` fields to User model
- **Admin Panel:** Admin can approve/reject doctor verification requests
- **Frontend:** Doctor registration flow with document upload

**Files to modify:**
- `server/src/models/User.js` — add verification fields
- `server/src/controllers/authController.js` — handle doctor registration
- `client/src/pages/DoctorPanel.jsx` — show verification status
- New: `client/src/pages/AdminPanel.jsx` — admin verifies doctors

---

### 2.2 Doctor Dashboard Stats 📊
**Why:** Doctor ko pata chale kitne reports review kiye, approval rate, avg review time

**Implementation:**
- **Backend:** Aggregate query on reports collection
- **Frontend:** Stats cards at top of DoctorPanel — Total Reviews, Approval Rate, Avg Time

**Files to modify:**
- `server/src/controllers/reportController.js` — add `getDoctorStats`
- `client/src/pages/DoctorPanel.jsx` — add stats section

---

### 2.3 Second Opinion Feature 💬
**Why:** User ek aur doctor se bhi opinion maang sake same report pe

**Implementation:**
- **Backend:** Allow multiple reviews per report (change schema from single reviewedBy to array)
- **Frontend:** "Request Second Opinion" button on report detail
- **Notification:** Second doctor gets notified

**Files to modify:**
- `server/src/models/Report.js` — change review schema to support multiple
- `client/src/pages/ReportDetail.jsx` — add second opinion button

---

## 👨‍👩‍👧 Phase 3 — Family & Convenience Features (1-2 weeks)

### 3.1 Family Health Profiles 👨‍👩‍👧‍👦
**Why:** Ek account se poore ghar ke members ke reports manage ho sakein

**Implementation:**
- **Backend:** New `FamilyMember` model (name, relation, age, blood group)
- **Frontend:** Profile page pe "Add Family Member" section
- **Upload:** When uploading, select which family member the report belongs to

**Files to modify:**
- New: `server/src/models/FamilyMember.js`
- New: `server/src/controllers/familyController.js`
- `client/src/pages/Profile.jsx` — add family members section
- `client/src/pages/Upload.jsx` — add family member dropdown

---

### 3.2 Emergency Health Card 🆘
**Why:** Blood group, allergies, current medicines ka ek printable card ban jaye jo emergency mein use ho

**Implementation:**
- **Frontend:** Generate a beautiful PDF/image card with user's critical info
- **Data:** Pull from profile + latest report analysis
- **Export:** Download as PDF or share via WhatsApp

**Files to modify:**
- New: `client/src/pages/EmergencyCard.jsx`
- Use `html2canvas` + `jspdf` for PDF generation

---

### 3.3 Medicine/Follow-up Reminder ⏰
**Why:** Doctor jo recommend kare (test repeat after 3 months) uska reminder set ho jaye

**Implementation:**
- **Backend:** New `Reminder` model with scheduled date
- **Frontend:** Doctor can set reminders while reviewing reports
- **Notification:** Email + in-app notification on reminder date

**Files to modify:**
- New: `server/src/models/Reminder.js`
- New: `server/src/controllers/reminderController.js`
- `client/src/pages/DoctorPanel.jsx` — add reminder option in review
- `client/src/pages/Dashboard.jsx` — show upcoming reminders

---

## 🤖 Phase 4 — Advanced AI Features (2-3 weeks)

### 4.1 Symptom-to-Test Suggester 🔍
**Why:** User likhe "Mujhe thakaan ho rahi hai", AI suggest kare kaunsa blood test karwao

**Implementation:**
- **Backend:** New AI function `suggestTests(symptoms)` using OpenRouter
- **Frontend:** New section in Chat or separate page — symptom input → test recommendations
- **Prompt Engineering:** Carefully crafted prompts to avoid diagnosis, only suggest tests

**Files to modify:**
- `server/src/utils/aiService.js` — add `suggestTests()`
- `server/src/controllers/chatController.js` — add symptom handler
- `client/src/pages/Chat.jsx` — add symptom mode

---

### 4.2 Report Quality Check 📷
**Why:** AI detect kare ki uploaded image/PDF readable hai ya blurry, before wasting time on analysis

**Implementation:**
- **Backend:** After OCR, check extracted text quality (length, gibberish detection)
- **AI:** Quick pre-check — "Is this a valid medical report?"
- **Frontend:** Show warning if quality is poor — "Image blurry hai, please re-upload"

**Files to modify:**
- `server/src/controllers/reportController.js` — add quality check step before AI analysis
- `server/src/utils/aiService.js` — add `checkReportQuality()`

---

## 📋 Priority Order (Suggested)

| Priority | Feature | Impact | Effort |
|---|---|---|---|
| 🔴 P0 | Health Trend Charts | Very High | Medium |
| 🔴 P0 | Health Score | Very High | Low |
| 🟡 P1 | Report Comparison | High | Medium |
| 🟡 P1 | Doctor Verification | High | Medium |
| 🟡 P1 | Family Profiles | High | Medium |
| 🟢 P2 | Doctor Stats | Medium | Low |
| 🟢 P2 | Emergency Card | Medium | Low |
| 🟢 P2 | Second Opinion | Medium | Medium |
| 🔵 P3 | Symptom Suggester | Medium | Medium |
| 🔵 P3 | Report Quality Check | Medium | Low |
| 🔵 P3 | Medicine Reminders | Medium | High |

---

> [!TIP]
> **Recommended starting point:** Health Trend Charts + Health Score — these two features will make your Dashboard look incredibly powerful and useful for users, with relatively low effort.

> [!IMPORTANT]
> **Doctor Verification** should be done before going live — otherwise anyone can claim to be a doctor and approve reports, which breaks user trust.
