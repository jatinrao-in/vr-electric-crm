# VR Electric — Custom E-Scooter Sales & Marketing CRM
## Master Product Requirements Document (PRD) & Technical Roadmap

**Version:** 1.0.0  
**Target Client:** VR Electric (Electric Scooter Dealership & Showroom)  
**Frontend Stack:** React.js / Next.js (App Router), Tailwind CSS, Lucide Icons, Recharts / Chart.js  
**Backend & Database:** Google Firebase (Firebase Authentication, Cloud Firestore, Firebase Security Rules)  
**Target AI IDE:** Antigravity IDE (Prompt-Driven Architecture)  

---

## 1. Executive Summary & Business Problem Statement

### 1.1 Business Context
**VR Electric** is an electric scooter dealership generating high-intent customer inquiries primarily through **Meta Ads (Facebook & Instagram Click-to-WhatsApp campaigns)**. Despite strong daily inquiry volumes on WhatsApp, the dealership faces significant revenue leakage due to delayed responses, unorganized lead tracking, lack of systematic follow-ups, and zero visibility into marketing Return on Investment (ROI).

### 1.2 Operational Workflow Solution
To solve this, the agency is taking over the sales communication channel (via a dedicated sales SIM card) and building a centralized, role-based **Custom CRM Web Application**. The end-to-end operational pipeline works as follows:
1. **Lead Generation (Meta Ads):** Potential buyers click on Meta Ads and land on the dealership's WhatsApp. Automated/semi-automated initial qualification captures their **Name, Budget, and Usage Purpose** (Personal Use vs. Commercial/Delivery).
2. **Lead Entry (Manager):** The CRM Manager reviews incoming WhatsApp chats and logs qualified leads into the CRM, assigning each lead to a dedicated Salesman.
3. **Sales Execution & Follow-up (Salesman):** The Salesman calls the lead using the dedicated SIM, pitches the appropriate e-scooter model, logs the call outcome/remarks, updates the pipeline stage, and schedules the exact **Next Follow-up Date & Time**.
4. **Showroom Experience & Deal Closure (Owner):** When customers visit the VR Electric showroom (either via scheduled appointments or direct walk-ins), the Owner logs their visit and records final scooter sales in real-time.
5. **Marketing Attribution (Ads Specialist):** The Meta Ads Specialist logs daily ad spend and platform lead counts so the Owner can see exact Cost Per Lead (CPL) and Cost Per Acquisition (CPA).

---

## 2. System Architecture & Tech Stack Specifications

Antigravity IDE must scaffold and build this application strictly adhering to the following technical architecture:

* **Framework:** Next.js 14+ (App Router) with TypeScript (or React + Vite with React Router v6).
* **Styling & UI System:** Tailwind CSS with a clean, modern, high-contrast SaaS aesthetic (Slate/Zinc neutrals paired with Electric Emerald/Blue primary accents representing EV mobility). Fully responsive for both desktop (Owner/Manager) and mobile VRowsers (Salesmen on calls).
* **State Management & Data Fetching:** React Context API for Auth/Role state + Firebase Firestore `onSnapshot` real-time listeners for instant UI updates across all connected users without page reloads.
* **Authentication:** Firebase Authentication (Email & Password provider). Self-registration on the public login page must be **disabled**; only the Super Admin can provision new user accounts.
* **Database:** Cloud Firestore (NoSQL document database) with composite indexes for multi-field filtering (e.g., filtering leads by `assignedTo` + `status` + `nextFollowUpDate`).
* **Export Engine:** Client-side CSV/Excel export utility (`papaparse` or `xlsx`) for downloading leads, sales ledgers, and ad performance reports.

---

## 3. Role-Based Access Control (RBAC) Matrix

Every authenticated user in Firebase Auth must have a corresponding document in the `users` Firestore collection defining their `role`. Route guards and UI conditional rendering must strictly enforce the following permissions:

| Role Key | Display Title | Primary Responsibility | Page Access & Permissions |
| :--- | :--- | :--- | :--- |
| `super_admin` | **Agency Admin** | System setup, user provisioning, full oversight | **Full Access:** All pages, create/deactivate users, edit dropdown masters, delete records. |
| `owner` | **Showroom Owner** | Monitoring business health, logging walk-ins & final sales | **Dashboard, Visitors & Sales, Reports:** Read-only on Leads & Ads; Full Write access on Showroom Visitors & Final Sales. |
| `manager` | **CRM Manager** | Converting WhatsApp chats into structured CRM leads | **Dashboard, Leads, Follow-ups, Visitors:** Create new leads, edit lead info, assign/reassign salesmen. |
| `salesman` | **Sales Executive** | Calling leads, updating call notes, scheduling follow-ups | **My Leads, Follow-ups, Visitors:** Restricted view (sees **only** leads assigned to their `uid`). Can update status, notes, and follow-up dates. |
| `ads_manager` | **Meta Ads Specialist** | Tracking daily ad spend, campaigns, and WhatsApp lead volume | **Dashboard (Marketing View), Ads Tracker:** Full Write access on Daily Ad Logs; Read-only on overall lead/sale counts for ROI calculation. |

---

## 4. Cloud Firestore Database Schema (Complete A-to-Z Design)

Antigravity must implement the following Firestore collections, document structures, and data types:

### 4.1 Collection: `users`
*Document ID:* `{firebase_auth_uid}`
```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "super_admin | owner | manager | salesman | ads_manager",
  "isActive": true,
  "createdAt": "timestamp",
  "lastLogin": "timestamp"
}
```

### 4.2 Collection: `leads`
*Document ID:* Auto-generated ID (`lead_xyz123`)
```json
{
  "id": "string",
  "customerName": "string",
  "phoneNumber": "string (10-digit indexed for duplicate check)",
  "alternatePhone": "string | null",
  "budget": "string (e.g., 'Under 60k', '60k - 85k', '85k - 1.1L', '1.1L+')",
  "purpose": "Personal Use | Delivery / Commercial | Student / Commute | Fleet",
  "preferredModel": "string (e.g., 'VR-Glide Pro', 'VR-Cargo Max', 'Not Decided')",
  "leadSource": "Meta WhatsApp Ad | Meta Lead Form | Direct Walk-in | Referral",
  "campaignName": "string | null",
  "status": "New | Contacted | Interested / Hot | Visit Scheduled | Converted | Not Interested | Junk",
  "assignedTo": "string (Salesman UID)",
  "assignedToName": "string (Denormalized for fast UI rendering)",
  "createdBy": "string (Manager UID)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastContactedAt": "timestamp | null",
  "nextFollowUpDate": "timestamp | null",
  "followUpTimeSlot": "string | null (e.g., '11:00 AM', '04:30 PM')",
  "latestRemark": "string",
  "totalCallsCount": 0,
  "isVisited": false,
  "isSold": false
}
```

### 4.3 Sub-Collection: `leads/{leadId}/activities`
*Document ID:* Auto-generated ID  
*Purpose:* Immutable audit trail of every call, status change, and note added by salesmen or managers.
```json
{
  "activityId": "string",
  "type": "CALL_LOG | STATUS_CHANGE | NOTE_ADDED | ASSIGNMENT_CHANGE | VISIT_LOGGED",
  "callOutcome": "Connected - Interested | Connected - Call Later | RNR (No Answer) | Busy | Switched Off | Wrong Number | Not Interested",
  "remark": "string (Detailed summary of what the customer said)",
  "previousStatus": "string | null",
  "newStatus": "string | null",
  "scheduledFollowUp": "timestamp | null",
  "performedBy": "string (User UID)",
  "performedByName": "string",
  "createdAt": "timestamp"
}
```

### 4.4 Collection: `ad_logs`
*Document ID:* `YYYY-MM-DD_{campaignSlug}` (or Auto-ID)  
*Purpose:* Tracks daily Meta Ads expenditure and top-of-funnel metrics.
```json
{
  "id": "string",
  "date": "string (YYYY-MM-DD)",
  "timestamp": "timestamp",
  "platform": "Meta (Facebook & Instagram)",
  "campaignName": "string",
  "amountSpent": 1500.00,
  "impressions": 12400,
  "clicks": 340,
  "whatsappLeadsReceived": 28,
  "crmLeadsEntered": 24,
  "notes": "string (e.g., 'Tested new delivery scooter video creative')",
  "loggedBy": "string (Ads Manager UID)",
  "createdAt": "timestamp"
}
```

### 4.5 Collection: `showroom_visitors`
*Document ID:* Auto-generated ID  
*Purpose:* Logged by the Owner/Manager when a customer physically enters the VR Electric showroom.
```json
{
  "id": "string",
  "visitDate": "string (YYYY-MM-DD)",
  "timestamp": "timestamp",
  "visitorName": "string",
  "phoneNumber": "string",
  "linkedLeadId": "string | null (Auto-matched if phone exists in 'leads')",
  "purpose": "Personal Use | Delivery / Commercial",
  "modelExplored": "string",
  "testRideTaken": true,
  "attendedBy": "string (Salesman Name/UID)",
  "visitOutcome": "Booked / Purchased | Will Decide Soon | Price Issue | Just Exploring",
  "remarks": "string",
  "loggedBy": "string (Owner UID)"
}
```

### 4.6 Collection: `sales_ledger`
*Document ID:* Auto-generated ID  
*Purpose:* Official record of closed e-scooter sales entered by the Owner.
```json
{
  "id": "string",
  "saleDate": "string (YYYY-MM-DD)",
  "timestamp": "timestamp",
  "invoiceNumber": "string | null",
  "customerName": "string",
  "phoneNumber": "string",
  "linkedLeadId": "string | null",
  "scooterModel": "string",
  "colorVariant": "string",
  "chassisNumber": "string | null",
  "finalSaleAmount": 82000,
  "paymentMode": "Full Cash / UPI | Loan / Finance | Downpayment + EMI",
  "financierName": "string | null (e.g., 'Bajaj Finserv', 'IDFC')",
  "closedBySalesmanId": "string | null",
  "closedBySalesmanName": "string",
  "loggedBy": "string (Owner UID)",
  "createdAt": "timestamp"
}
```

### 4.7 Collection: `system_settings`
*Document ID:* `master_config`  
*Purpose:* Dynamic dropdown options editable by `super_admin` without code changes.
```json
{
  "scooterModels": ["VR-Lite (Low Speed)", "VR-Glide Pro", "VR-Thunder High-Speed", "VR-Cargo Delivery Max"],
  "budgetRanges": ["Under ₹60,000", "₹60,000 - ₹80,000", "₹80,000 - ₹1,00,000", "Above ₹1,00,000"],
  "purposes": ["Personal Daily Commute", "Delivery / Gig Worker (Zomato/Swiggy/Blinkit)", "Commercial / B2B Fleet", "Student / Family"],
  "callOutcomes": ["Connected - Interested", "Connected - Wants Test Ride", "Connected - Call Later", "RNR (Ring No Response)", "Busy / Call Cut", "Switched Off / Not Reachable", "Not Interested - Budget Issue", "Not Interested - Bought Competitor", "Junk / Wrong Number"]
}
```

---

## 5. Detailed Page-by-Page Functional Specifications

### Page 1: Authentication & Security Gate (`/login`)
* **UI Layout:** Split-screen modern layout. Left side showcases VR Electric VRanding, EV statistics, and dealership tagline; Right side contains a clean login card.
* **Fields:** Email Address, Password (with show/hide toggle), "Remember Session" checkbox, and "Sign In to CRM" primary button.
* **Validation & Error Handling:** Display clear toast/inline alerts for invalid credentials, disabled user accounts (`isActive === false`), or network errors.
* **Post-Login Routing:** Automatically inspect `user.role` and redirect:
  * `owner` / `super_admin` -> `/dashboard`
  * `manager` -> `/leads`
  * `salesman` -> `/follow-ups`
  * `ads_manager` -> `/ads-tracker`

---

### Page 2: Global Navigation & App Shell
* **Persistent Left Sidebar (Collapsible on Mobile):**
  * Displays VR Electric Logo at the top.
  * Dynamically renders menu items based on the logged-in user's role.
  * Displays live badge counts next to **Follow-ups** (showing count of Overdue + Today's calls).
  * Bottom profile card showing User Name, Role Badge, and Logout button.
* **Top Header Bar:**
  * Page Title & VReadcrumbs.
  * **Global Quick Search Bar:** Search any customer by Name or 10-digit Phone Number across the entire CRM instantly.
  * **Quick Action Buttons:** Role-specific primary CTA (e.g., `+ Add Lead` for Manager, `+ Log Sale` / `+ Add Visitor` for Owner, `+ Log Ad Spend` for Ads Specialist).

---

### Page 3: Executive Owner Dashboard (`/dashboard`)
*Primary Users:* Owner, Super Admin (Managers & Ads Specialists see scoped versions).

1. **Date Range Filter Bar:** Quick pills for `Today`, `Yesterday`, `Last 7 Days`, `This Month`, and `Custom Date Range`.
2. **Top KPI Summary Grid (6 High-Impact Cards):**
   * **WhatsApp Leads vs. CRM Added:** Shows total leads reported by Ads vs. actual leads entered into CRM (e.g., `28 Received / 25 Added`).
   * **Calls Made Today:** Total outbound call logs recorded by the sales team today.
   * **Pending Follow-ups:** Count of scheduled calls due today + overdue calls.
   * **Showroom Walk-ins:** Total physical visitors logged today/selected period.
   * **Total Scooters Sold:** Count of closed deals + Total Revenue generated (`₹`).
   * **Marketing ROI & CPL:** Calculated dynamically: `Total Ad Spend ÷ Total Leads` (Cost Per Lead) and `Total Ad Spend ÷ Scooters Sold` (Cost Per Sale).
3. **Owner Quick-Action Panel (Prominent Card on Dashboard):**
   * Since the Owner wants effortless data entry without navigating complex menus, provide two instant trigger buttons right on the dashboard:
     * **"Log Today's Showroom Visitor"** -> Opens clean modal to enter Visitor Name, Phone, Model Seen, Test Ride (Yes/No).
     * **"Record New Scooter Sale"** -> Opens clean modal to enter Customer Name, Phone, Model, Final Price, Payment Mode, and Salesman Credit.
4. **Interactive Visual Analytics (Charts):**
   * **Funnel Bar Chart:** `Meta Ad Leads` -> `CRM Qualified` -> `Contacted` -> `Showroom Visited` -> `Sold`.
   * **Daily Trend Line Chart:** Leads vs. Sales over the last 14 days.
   * **Lead Purpose VReakdown (Donut Chart):** Percentage split between *Personal Use* vs. *Delivery/Commercial* buyers.
5. **Live Activity Feed:** Real-time scrolling feed of recent actions (e.g., *"Rahul (Salesman) updated Amit Kumar to 'Visit Scheduled' — 4 mins ago"*).

---

### Page 4: Lead Management & Pipeline (`/leads`)
*Primary Users:* Manager (Full access), Salesman (Assigned leads only), Owner (Read-only).

1. **Add New Lead Modal (Manager Workflow):**
   * Triggered by `+ Add New Lead` button.
   * **Duplicate Detection:** As soon as the Manager types a 10-digit phone number, Firestore checks if that number already exists. If found, it displays an alert: *"Lead already exists! Assigned to [Salesman Name] — Status: [Current Status]"* with a button to open that existing lead instead of creating duplicates.
   * **Form Inputs:**
     * Customer Name *(Required)*
     * WhatsApp / Phone Number *(Required, 10 digits)*
     * Budget Range *(Dropdown from `system_settings`)*
     * Purpose *(Radio/Dropdown: Personal Use, Delivery/Commercial, Student, Fleet)*
     * Preferred Scooter Model *(Dropdown)*
     * Campaign / Ad Tag *(Optional)*
     * Assign to Salesman *(Dropdown of active users with `role === 'salesman'` — includes an "Auto-Assign Round Robin" toggle)*
     * Initial WhatsApp Summary / Notes *(Textarea)*
2. **Advanced Filtering & Search Toolbar:**
   * Search by Name or Phone.
   * Filter by **Lead Status:** `All`, `New`, `Contacted`, `Interested / Hot`, `Visit Scheduled`, `Converted`, `Not Interested`, `Junk`.
   * Filter by **Purpose:** `All`, `Personal Use`, `Delivery / Commercial`.
   * Filter by **Budget Range**.
   * Filter by **Assigned Salesman** (Visible to Manager/Owner/Admin).
3. **Leads Data Table / Card View:**
   * Columns: Customer Name & Phone, Purpose & Budget Badge, Preferred Model, Current Status Pill (color-coded), Assigned Salesman, Last Remark (truncated), Next Follow-up Date, and Quick Actions.
   * **One-Click Communication Buttons:**
     * **Call Button (`tel:`):** Directly triggers phone dialer on mobile or linked calling app.
     * **WhatsApp Button (`wa.me/91...`):** Opens WhatsApp chat directly with a pre-filled greeting template (e.g., *"Hello [Name], thank you for contacting VR Electric regarding our electric scooters..."*).
4. **Lead Detail & Call Logging Drawer (Slide-Over Panel):**
   * Clicking any lead opens a comprehensive right-side drawer divided into two sections:
     * **Top / Left — Log New Call & Update Status:**
       * Select Call Outcome (`Connected - Interested`, `RNR`, `Busy`, `Call Later`, `Not Interested`, etc.).
       * Update Pipeline Status (`Contacted`, `Interested / Hot`, `Visit Scheduled`, etc.).
       * Write Detailed Call Remark *(Required for accountability)*.
       * Pick **Next Follow-up Date** and **Time Slot** *(Mandatory if status is not `Converted`, `Not Interested`, or `Junk`)*.
       * Submit button atomically updates the `leads` document and appends a new entry to `leads/{leadId}/activities`.
     * **Bottom / Right — Complete Chronological Activity Timeline:**
       * Shows exact timestamps of when the Manager created the lead, every call made by the Salesman, every remark written, and when the customer visited the showroom.

---

### Page 5: Follow-Up & Task Command Center (`/follow-ups`)
*Primary Users:* Salesman (Daily workspace), Manager (Team monitoring).

* Designed to ensure **zero leads slip through the cracks**. Divided into 3 clear, actionable tabs:
  1. **Overdue Follow-ups (Red Alert Badge):** All active leads where `nextFollowUpDate < Today` and status is not closed. Highlighted in soft red to demand immediate priority.
  2. **Today's Follow-ups (Primary Focus):** All leads scheduled for `Today`, sorted chronologically by `followUpTimeSlot`.
  3. **Upcoming Follow-ups:** Leads scheduled for tomorrow and future dates, allowing salesmen to plan ahead.
* Each row features a direct **"Call & Log"** button that opens the Call Logging Drawer immediately, updates the follow-up date, and automatically moves the card out of the pending list once completed.

---

### Page 6: Meta Ads & Marketing Performance Tracker (`/ads-tracker`)
*Primary Users:* Meta Ads Specialist (Read/Write), Owner & Super Admin (Read).

1. **Daily Ad Spend Entry Form:**
   * Date Picker (defaults to Today).
   * Campaign Name (e.g., *"Delivery Scooter Lead Campaign - April"*).
   * Daily Ad Spend (`₹`).
   * Total Impressions & Link Clicks.
   * Total WhatsApp Conversations Started (from Meta Ads Manager).
   * Notes / Creative Changes.
2. **Automated Reconciliation & Efficiency Table:**
   * Displays daily rows comparing:
     * `Ad Spend (₹)`
     * `Meta Reported Leads`
     * `Actual CRM Leads Entered` (Auto-queried from `leads` collection for that date!)
     * `Lead Leakage %` (Alerts if WhatsApp leads aren't being entered into CRM on time)
     * `Calculated CPL (Cost Per Lead)`
     * `Showroom Visits Generated`
     * `Actual Sales Closed`
     * `Calculated Cost Per Sale (CPA)`

---

### Page 7: Showroom Visitors & Sales Ledger (`/visitors-sales`)
*Primary Users:* Owner (Primary operator), Manager (Read/Write Visitors), Super Admin.

* Organized into two clean tabs:

#### Tab A: Showroom Walk-In & Appointment Register
* **Add Visitor Form:**
  * Visitor Name & Phone Number.
  * **Smart Lead Linking:** When phone number is entered, automatically checks `leads` collection. If matched, displays *"Matched with CRM Lead! Originally handled by [Salesman Name]"* and automatically updates that lead's `isVisited = true` and `status = 'Visited'`.
  * Purpose (`Personal` / `Delivery`).
  * Scooter Model Inspected.
  * Test Ride Taken? (`Yes` / `No`).
  * Attended By (Select Salesman).
  * Visit Outcome (`Booked`, `Hot - Will Buy in 2-3 Days`, `Price Comparison`, `Just Enquiring`).
  * Owner/Showroom Remarks.

#### Tab B: Closed Deals & Scooter Sales Ledger
* **Record Scooter Sale Form:**
  * Sale Date & Invoice / Receipt Number.
  * Customer Name & Phone Number (Auto-links to existing CRM Lead and marks `status = 'Converted'` and `isSold = true`).
  * Scooter Model & Color Variant.
  * Chassis / Motor Number (Optional for dealership records).
  * Final On-Road Sale Amount (`₹`).
  * Payment Mode (`Cash / UPI`, `Finance / Loan`, `Exchange + Cash`).
  * Financier Name (if financed).
  * Salesman Credit (Select which Salesman closed/nurtured this deal).
* **Export Button:** One-click **"Export Sales Ledger to Excel/CSV"** for accounting and GST reconciliation.

---

### Page 8: Team Performance & Analytics Reports (`/reports`)
*Primary Users:* Owner, Super Admin, Manager.

1. **Salesman Performance Leaderboard:**
   * A comparative scorecard table evaluating every Salesman over the selected date range:
     * Total Leads Assigned
     * Total Calls Made
     * Average Response Time (Time between Lead Creation and First Call)
     * Contact Rate % (Connected Calls ÷ Total Calls)
     * Showroom Visits Generated
     * Total Scooters Sold
     * Lead-to-Sale Conversion Rate %
2. **Lead Loss / Rejection Analysis:**
   * VReakdown of why leads were marked `Not Interested` or `Junk` (e.g., *Budget too low*, *Wanted petrol scooter*, *Outside delivery zone*, *No response after 5 attempts*). Helps the Meta Ads Specialist refine ad targeting.
3. **Custom Report Generator:**
   * Select Dataset (`All Leads`, `Call Activity Logs`, `Showroom Visitors`, `Sales Ledger`, `Ad Spend Logs`), select Date Range, and download clean CSV files.

---

### Page 9: Admin Settings & User Management (`/settings`)
*Primary Users:* Super Admin Only.

1. **Team & Access Management:**
   * Table of all registered CRM users showing Name, Email, Phone, Role Badge, Active Status Toggle, and Last Login time.
   * **Create New User Modal:** Allows Super Admin to create a new login (Email + Temporary Password + Name + Role) using a secondary Firebase Auth instance so the Admin doesn't get logged out.
   * **Activate / Deactivate Account:** Instant toggle to revoke CRM access if a salesman leaves the company.
2. **Master Dropdown Configuration:**
   * Interactive tag-based editors to add, edit, or reorder:
     * VR Electric Scooter Models
     * Budget VRackets
     * Customer Usage Purposes
     * Standard Call Outcomes

---

## 6. Firebase Security Rules Blueprint (`firestore.rules`)

Antigravity must generate and enforce strict Firestore Security Rules matching the RBAC matrix:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isActive() {
      return isSignedIn() && getUserData().isActive == true;
    }
    
    function hasRole(role) {
      return isActive() && getUserData().role == role;
    }
    
    function isAnyRole(roles) {
      return isActive() && getUserData().role in roles;
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isActive();
      allow write: if hasRole('super_admin');
    }

    // Leads Collection
    match /leads/{leadId} {
      allow read: if isAnyRole(['super_admin', 'owner', 'manager', 'ads_manager']) 
                  || (hasRole('salesman') && resource.data.assignedTo == request.auth.uid);
      allow create: if isAnyRole(['super_admin', 'manager', 'owner']);
      allow update: if isAnyRole(['super_admin', 'manager', 'owner']) 
                    || (hasRole('salesman') && resource.data.assignedTo == request.auth.uid);
      allow delete: if hasRole('super_admin');

      // Lead Activities Sub-collection
      match /activities/{activityId} {
        allow read: if isActive();
        allow create: if isAnyRole(['super_admin', 'manager', 'salesman', 'owner']);
        allow update, delete: if hasRole('super_admin');
      }
    }

    // Meta Ads Logs
    match /ad_logs/{logId} {
      allow read: if isAnyRole(['super_admin', 'owner', 'manager', 'ads_manager']);
      allow create, update: if isAnyRole(['super_admin', 'ads_manager']);
      allow delete: if hasRole('super_admin');
    }

    // Showroom Visitors
    match /showroom_visitors/{visitorId} {
      allow read: if isAnyRole(['super_admin', 'owner', 'manager', 'salesman']);
      allow create, update: if isAnyRole(['super_admin', 'owner', 'manager']);
      allow delete: if hasRole('super_admin');
    }

    // Sales Ledger
    match /sales_ledger/{saleId} {
      allow read: if isAnyRole(['super_admin', 'owner', 'manager', 'ads_manager']);
      allow create, update: if isAnyRole(['super_admin', 'owner']);
      allow delete: if hasRole('super_admin');
    }

    // System Settings
    match /system_settings/{docId} {
      allow read: if isActive();
      allow write: if hasRole('super_admin');
    }
  }
}
```

---

## 7. Phased Implementation Plan for Antigravity IDE (2–3 Hour Sprint)

To build this cleanly inside **Antigravity IDE** without errors, execute the build in the following 5 sequential milestones:

* **Milestone 1: Project Initialization & Firebase Wiring (25 Mins)**
  * Initialize Next.js + Tailwind CSS + Lucide Icons.
  * Configure `firebase.ts` (Auth + Firestore) using environment variables.
  * Build AuthContext, ProtectedRoute wrapper, Role Redirect logic, and the `/login` page.
  * Seed initial `super_admin` user and `system_settings/master_config` document.
* **Milestone 2: App Shell & Super Admin Settings (20 Mins)**
  * Build the responsive Sidebar + Top Header with Global Phone Search.
  * Build `/settings` page so Super Admin can create Owner, Manager, Salesman, and Ads Manager accounts immediately.
* **Milestone 3: Core Lead Engine & Follow-Up Workspace (45 Mins)**
  * Build `/leads` page with Add Lead Modal (including duplicate phone check) and filter bar.
  * Build the Slide-Over Lead Detail Drawer with Call Logging form + Activity Timeline.
  * Build `/follow-ups` page with Overdue, Today, and Upcoming tabs.
* **Milestone 4: Owner Showroom & Sales Ledger + Ads Tracker (40 Mins)**
  * Build `/visitors-sales` with auto-lead phone matching when a visitor or buyer is logged.
  * Build `/ads-tracker` with daily ad spend entry and automated CPL/CPA calculations.
* **Milestone 5: Executive Dashboard, Charts & CSV Exports (30 Mins)**
  * Build `/dashboard` aggregating live counts from `leads`, `ad_logs`, `showroom_visitors`, and `sales_ledger`.
  * Embed Owner Quick-Action modals directly on the dashboard.
  * Add `/reports` leaderboard and CSV export buttons.

---

## 8. UI/UX & Quality Checklist
1. **Mobile-First Call Flow:** Ensure Salesmen can open `/follow-ups` on a smartphone, tap Call, and log remarks comfortably with one thumb.
2. **Zero Empty States:** Every table and chart must include clean empty-state illustrations/messages when no records exist yet.
3. **Loading Skeletons & Toasts:** Use shimmer skeletons while Firestore listeners initialize and clear toast notifications (`react-hot-toast` or `sonner`) on every save/update action.
4. **Indian Currency & Date Formatting:** Format all monetary figures using Indian numbering (`₹85,000`) and dates in readable IST format (`24 Apr 2026, 04:30 PM`).