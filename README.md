# VR Electric CRM — Ride The Future ⚡

Official enterprise Customer Relationship Management (CRM), Lead Pipeline, Digital Scooter Catalogue, Smart EMI Calculator, and Quotation/Invoice system for **VR Electric**.

- **Live Production URL:** [https://vr-electric-crm.web.app](https://vr-electric-crm.web.app)
- **Official Address:** 1786/3, Rajiv Nagar, Sector 13, Gurgaon
- **Direct Support:** +91 7838026026 / 9871113153

---

## 🚀 Key Modules & Capabilities

### 1. 📊 Executive Dashboard & Real-Time Analytics
- Real-time conversion funnel and KPI metrics tracking active leads, showroom walk-ins, closed scooter sales, and monthly revenue.
- Lead segmentation by target usage (*Daily Commute, Family Use, Commercial / Delivery, Students / Ladies*).
- Real-time chronological activity audit feed.

### 2. 👥 Lead Pipeline & Round-Robin Distribution
- Complete inquiry lifecycle tracking (*New Lead, Contacted, Follow-Up Scheduled, Showroom Visit, Booking / Sold, Lost*).
- Auto-duplicate phone number detection.
- Intelligent round-robin lead allocation among active sales personnel.
- Instant 1-tap Phone Call (`tel:`) and WhatsApp (`wa.me`) customer connect actions.

### 3. 🛵 Digital Scooter Catalogue (`/catalogue`)
- Dynamic inventory management supporting RTO-registered and Non-RTO low-speed electric models.
- Comprehensive technical specs: Lithium-ion (LFP/NMC) & Graphene chemistry, portable/fixed batteries, range, top speed, and charging duration.
- **Client-Side 16:9 Image Cropper:** Automatically crops camera uploads to standard 16:9 ratio and uploads to ImgBB CDN.
- Instant *"Generate Quote / Voucher"* action button linked directly to inventory models.

### 4. 💰 Smart EMI Calculator & Voucher Wizard (`/vouchers`)
- 5-step guided wizard for generating official customer quotations and booking vouchers.
- **Live EMI Engine:** Real-time calculation supporting both **Reducing Balance** (amortization) and **Flat Rate** interest calculations across 6 to 36-month tenures.
- **Showroom Visitor Sync:** Auto-detects walk-in customers and records them to the `visitors` collection if not visited today.
- Sequential human-friendly voucher identifiers (`VRQ-YYMM-XXXX` and `VRB-YYMM-XXXX`).

### 5. 🖨️ Print-Ready Quotation & Sales Invoice Layout
- A4-proportioned print sheet with official VR Electric header branding, customer specs, vehicle showcase, and itemized financial breakdown.
- Built-in `@media print` rules hiding navigational chrome for clean PDF printing and paper copies.
- 1-click formatted WhatsApp quotation sharing via pre-filled `wa.me` links.

### 6. 📈 Meta Ads Tracker & ROI Analytics (`/ads-tracker`)
- Daily ad spend logging (Daily Spend, Impressions, Clicks, Platform).
- Automatic Cost Per Lead (CPL) calculation and ROI conversion tracking.

### 7. 🛡️ Strict Role-Based Access Control (RBAC) & Security
- **Single Master Admin:** Strictly gated to `info.raojatin@gmail.com` with exclusive privileges to manage users and system config.
- **Role Profiles:**
  - `master_admin`: Full system access and staff provisioning.
  - `owner`: Executive dashboard, catalogue management, voucher creation, and sales records.
  - `manager`: Lead distribution, follow-ups, quotes, and walk-in logs.
  - `salesman`: Scoped strictly to assigned leads and self-generated quotes.
  - `ads_manager`: Dedicated Meta ads spend and performance tracker.
- **Persistent Sessions:** Configured with `browserLocalPersistence` for continuous login across browser restarts and device reboots.

### 8. 🎨 Brand Palette & Strict "Lato" Typography
- **Primary Navy Blue:** `#0A3D91` & `#062463`
- **Electric Action Green:** `#65B32E` & `#1B662C`
- **Canvas / Surfaces:** `#F8FAFC` canvas with `#FFFFFF` crisp light cards.
- **100% Lato Everywhere:** Every character, number, currency symbol (`₹`), and chart label renders strictly in **Lato** with tabular numerals (`tabular-nums`) for clean vertical alignment.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Charts:** Recharts (responsive SVG rendering)
- **Backend & Database:** Google Cloud Firestore (real-time listeners & atomic transactions)
- **Authentication:** Firebase Authentication (persistent sessions)
- **Hosting:** Google Firebase Hosting
- **Image CDN:** ImgBB API
- **PWA:** Service Worker caching + Web App Manifest for mobile installation

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jatinrao-in/vr-electric-crm.git
   cd vr-electric-crm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Build production bundle:**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase:**
   ```bash
   npx firebase deploy
   ```

---

## 📄 License

Proprietary — All rights reserved by **VR Electric**.
