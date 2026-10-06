# YardStock — Hyper-Local Construction Surplus Marketplace PWA

**YardStock** is a mobile-first Progressive Web App (PWA) and hyper-local B2B/contractor construction surplus marketplace engineered for **Mumbai, Navi Mumbai, and Thane**. It turns leftover construction materials (TMT steel rebar, OPC 53 cement, vitrified tiles, AAC masonry blocks, MS scaffolding) into verified local project liquidity in **~2 seconds**, combining **Gemini Vision + YOLOv8n fallback**, **multilingual voice input (English / हिंदी / मराठी)**, **PostGIS `ST_DWithin` micro-radius matching**, **SHAP explainable fraud/trust scoring**, and **anti-leakage OTP delivery escrow**.

---

## 1. Key Capabilities & USPs

1. **2-Second Snap & List (Vision AI + Multilingual Voice)**:
   - Snap a site photo or speak in **Hindi, Marathi, or English** via the Web Speech API.
   - **Gemini 3.8 Flash Vision** (with a deterministic **YOLOv8n-Construction + LightGBM fallback**) outputs structured JSON: `{ material, quantity, unit, condition, suggested_price, confidence }`.
   - **Mandatory Human-in-the-Loop Gate**: Every AI extraction displays a confidence score and requires contractor confirmation/editing before publishing.
2. **PostGIS `ST_DWithin` Micro-Radius Marketplace & Smart-Match**:
   - Interactive **Leaflet + OpenStreetMap** view with a live micro-radius slider (2 km – 35 km) and privacy-fuzzed coordinates (`~600m` fuzz radius until Escrow is locked).
   - Buyers post live project requirements and receive ranked nearby surplus lots with explicit **"Why Matched"** explanations (spherical distance, CPWD DSR price savings, volume coverage, and seller SHAP trust score).
3. **Cybersecurity & Responsible AI Layer**:
   - **Listing Fraud Shield**: Camera EXIF GPS verification, perceptual hash (`dHash` / `pHash`) duplicate/stolen photo detection, and AI-generated image probability checks.
   - **Explainable Trust Score (SHAP)**: Every seller receives a 0–100 trust score with additive SHAP feature attributions (e.g., `+11.5 GSTIN Verified`, `+9.8 OTP Escrow History`, `-18.2 Photo pHash Reused`, `-16.5 Account Age < 14d`) plus a geographic parity bias audit across Mumbai, Navi Mumbai, and Thane.
   - **Prompt-Injection & Anti-Leakage PII Firewall**: Blocks adversarial OCR/chat instructions (`IGNORE ALL PREVIOUS INSTRUCTIONS...`) and redacts phone numbers and UPI handles in chat to prevent off-platform commission bypass.
   - **Immutable SHA-256 Hash-Chained Audit Ledger**: Every security block, PII redaction, human AI confirmation, and OTP escrow payout is cryptographically chained (`H_n = SHA256(H_{n-1} || payload)`).
4. **Anti-Leakage Escrow & Mini-Truck Dispatch**:
   - Locks buyer funds in escrow, books site transport (`Tata Ace EV`, `Mahindra Bolero Pickup`, or `Eicher Pro 2049`), reveals exact unfuzzed pickup coordinates, and releases net seller payout minus the **6.5% commission** only upon **6-digit Delivery OTP** verification at unloading.
5. **Live Performance & Evaluation Dashboard**:
   - Dynamically computed from a **100-item held-out evaluation split** (out of **300 seeded synthetic listings** and **75 contractor profiles** across 16 Mumbai/Navi Mumbai hubs) and live API latency telemetry.

---

## 2. Datasets, Benchmarks & Licences

Verify each dataset licence before commercial redistribution:
- **Construction Material Detection**: Roboflow Universe construction material sets, ACID (Alberta Construction Image Dataset), SODA (Site Object Detection Dataset).
- **Price Benchmarks**: Central Public Works Department (**CPWD Delhi Schedule of Rates — DSR** at `cpwd.gov.in`) combined with condition depreciation curves (`Unopened: 78%`, `Grade A Surplus: 66%`, `Grade B Weathered: 52%`, `Salvaged: 39%`).
- **Fraud & Trust Scoring**: IEEE-CIS Fraud Detection tabular feature pipeline + CASIA v2 image tampering heuristics + **300 synthetic Mumbai/Navi Mumbai listings** generated deterministically in `src/data/yardstockEngine.ts`.

---

## 3. Quick Start & Automated Evaluation Pipeline

### Run Full-Stack App Locally (Port 3000)

```bash
cp .env.example .env
npm install
npm run dev
```

### Run Automated CLI Evaluation Pipeline

```bash
bash scripts/evaluate_pipeline.sh
# or
npm run eval
```

### Run Full Docker Stack (PostgreSQL/PostGIS + Redis + FastAPI + PWA)

```bash
docker compose up --build
```
