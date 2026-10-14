# BhuChain Site Integrity — Daily Tracking System (Manual)

Construction site par roz ki tracking ka system. Isme koi bhi worker, engineer, supervisor, thekedar ya supplier jhoothi hazri, chori ya fake bill aasani se nahi kar sakta. Ye CCTV, ERP ya paid software ke bina chalta hai: sirf Android phone, ek free app (`integrity/`), Google Sheets/Drive, WhatsApp, paper register aur printed QR card.

> **App:** `https://ashuda332.github.io/build/integrity/`. Chrome mein kholo → menu → "Add to Home screen". Iske baad internet ke bina bhi chalta hai.

---

## 0. Assumptions — please confirm

Ye maan ke system banaya hai. Jo galat ho, bataiye; numbers app ki settings mein badal jaate hain.

| # | Assumption | Kahan badlega |
|---|---|---|
| 1 | Shuru mein **1 site** (Cuttack ya Bhubaneswar), G+1 / G+2 residential | Har site ka alag Google Sheet + alag app setup |
| 2 | **30–60 workers** roz, 2–4 thekedar, 3–6 supplier | Koi limit nahi |
| 3 | Staff: 1 owner, 1–2 engineer, 1 supervisor, 1 storekeeper, 1 hazri wala (gate), 1 accounts. Auditor = owner ya doosri site ka engineer | People → Staff |
| 4 | Har role ke paas **apna Android phone** (Chrome) aur 4-digit PIN | — |
| 5 | Workers ke paas phone zaroori nahi. Hazri gate wala apne phone se leta hai | — |
| 6 | Site radius **150 m**. Isse bahar ki entry red flag | Site setup |
| 7 | Material rates (default): cement ₹400/bag, steel ₹68/kg, sand ₹55/cft, gitti ₹60/cft, brick ₹8 | People → Rates. Har mahine update |
| 8 | Wastage allowance: cement/steel 3%, sand/gitti 8%, brick 5% | `core.js` → MATERIALS |
| 9 | Payment: **2 approval, ek owner ka zaroori** | `core.js` → NEEDS |
| 10 | Budget **₹0**: sirf free tools. Internet roz kam se kam ek baar | — |
| 11 | Team ka tech comfort **kam**: isliye bade button, photo + tap, typing sirf numbers | — |

**Mujhe ye bataiye:** project size (sq ft, floors), workers ki asli sankhya, kitne engineers/supervisors, kitni sites, monthly budget, aur staff ka phone use kaisa hai. Inke hisaab se roles, limits aur audit frequency fine-tune kar dunga.

---

## 1. Overview — system kaise kaam karta hai (1 page)

```
 Worker / truck / kaam ──► Entry banane wala (photo + GPS + time, app khud lagata hai)
                                     │
                                     ▼
                     Phone ka ledger (append-only, hash-chained, offline)
                                     │ internet aate hi
                                     ▼
            Google Sheet "Ledger" (sirf add) + Drive (photos: Site/Date/Category)
                                     │
             ┌───────────────────────┼─────────────────────────┐
             ▼                       ▼                         ▼
   Doosra aadmi approve      App ke automatic checks     Owner: daily report
   (Do-Person Rule)          (red / amber flags)          WhatsApp par, 6:15 pm
                                     │
                                     ▼
          Payment tabhi: kaam ✔ + maal ✔ + hazri match ✔ + 2 approval (1 owner)
                                     │
                                     ▼
          Roz raat: din ki saari entries ka ek hash (Merkle root) → BhuChain blockchain
```

**6 niyam, aur app unhe kaise lagu karta hai:**

| Niyam | App mein kaise |
|---|---|
| 1. Do-aadmi | Jo entry banata hai, wo usse approve nahi kar sakta (button hi nahi dikhta). Payment ko 2 alag approver chahiye, ek owner. |
| 2. Saboot | Camera se photo par site, date, time, GPS aur naam chhap jaata hai. Bina photo/GPS entry "unverified" rehti hai aur kisi ginti mein nahi aati. Gallery ki purani photo (10 min se purani) flag hoti hai. |
| 3. Milaan | Hazri ↔ mazdoori bill, maal aaya ↔ supplier bill, kaam ↔ maal kharch, book stock ↔ physical count. Sab automatic. |
| 4. No edit | Entry delete/edit ka option hi nahi. Galti = correction entry + reason + approval. Purani entry hamesha dikhti hai. Har entry ka SHA-256 hash pichhli entry se juda hai; koi database se chhed-chhaad kare to turant red flag. |
| 5. Achanak jaanch | App random worker, maal aur kaam chunta hai, aur chunav pehle record ho jaata hai. Auditor jaake gine. Same auditor 3 baar lagatar = flag. |
| 6. Kaam ka bantwara | Har aadmi ka ek role. Hazri wala payment nahi bana sakta. Storekeeper maal approve nahi kar sakta. Jisne bill ki hazri/maal record kiya, wo uska payment approve nahi kar sakta. |

---

## A. Worker aur attendance tracking

### A1. Worker ID (register) — app: **Workers → + Naya worker**
| Field | Kaise | Kyun |
|---|---|---|
| Photo | Camera se, chehra seedha (gallery nahi) | Proxy aur ghost pakadne ke liye |
| Naam | Type | — |
| Aadhaar last 4 | 4 ank | Duplicate pakadne ke liye; poora Aadhaar kabhi nahi |
| Trade | Chip: Mason/Helper/Carpenter/Bar bender/… | Rate check |
| Thekedar | Chip | Bill milaan |
| Roz ki mazdoori ₹ | Number | Wage reconciliation |
| Emergency phone | Number | Safety |

- Engineer ya owner approve karega. Bina approval worker "pending" rahega.
- **ID card:** Workers → 🖨 ID cards. QR + photo print karke laminate karo. Hazri ke waqt QR scan karo.

**Paper backup (internet/phone kharab ho to):** worker register ki columns: `Sr | Worker ID | Naam | Photo chipkao | Aadhaar last 4 | Trade | Thekedar | Wage ₹ | Phone | Register kiya (sign) | Verify kiya (sign)`

### A2. Roz ki hazri — app: **Hazri**
1. **Subah 8:00–8:30**, gate par: IN chuno → worker ka QR scan karo ya photo par tap karo → **selfie** (worker ka chehra, peeche site dikhe) → apne aap save. ~20 second ek worker.
2. **Shaam 5:00–5:30:** OUT chuno → same.
3. **9:00 am aur 5:45 pm**, supervisor: Approve karo. Screen par register photo aur aaj ki selfie saath-saath dikhti hain. Galat ho to "✖ Galat" + reason.
4. **Man-day:** 7+ ghante = 1 din, 4–7 ghante = ½ din, OUT nahi = 0.

**Proxy hazri rokne ke tarike:**
- Hazri sirf gate wale ke phone se, worker ke apne phone se kabhi nahi.
- Selfie live camera se. Gallery ki photo flag hoti hai (R6b). Photo par time aur GPS chhapta hai.
- GPS site ke 150 m bahar = 🔴 R2. Raat 8:30 ke baad ya subah 5:30 se pehle = 🟠 R3.
- Same selfie do din = 🔴 R1c. Same worker ka IN do baar nahi hota.
- Supervisor photo milata hai (Do-Person Rule).
- Hafte mein ek baar **surprise headcount** (section I).

### A3. Ghost worker detection
- App har naye worker ki photo ko purane workers se milata hai (image fingerprint). Same/milti photo, ya same Aadhaar-4 + same pehla naam, do ID par = 🔴 **R4**, chahe thekedar alag ho.
- **Weekly headcount:** auditor achanak din chunta hai → **Surprise audit → Surprise headcount**. Sabko ek jagah ikattha karo, gino, group photo lo. App ki "abhi site par" ginti se farq = 🔴 R19.
- **Random face check:** audit mein app 2–5 worker chunta hai. Auditor naam bolke bulata hai aur chehra ID photo se milata hai.

### A4. Wage vs attendance reconciliation
App: **Reports → Weekly**. Har thekedar ke liye:

| Thekedar | Hazri days (approved) | Bill days | Gap | Wage due (days × rate) | Paid |
|---|---|---|---|---|---|

- Payment request mein "Man-days claimed" > hazri = 🔴 (payment ruk jaayega).
- Wage amount > hazri × wage = 🔴.
- Jisne hazri li, wo us bill ka payment approve nahi kar sakta (🔴 R12).

### A5. Thekedar ke bill ka format (thekedar se isi format mein lo)
```
Bill no: ____  Thekedar: ____  Period: __/__ se __/__
| Date | Mason (no.) | Helper (no.) | Bar bender | ... | Total man-days |
Total man-days: ____  Rate: ____  Amount: ₹____
Advance adjust: ₹____  Net: ₹____   Sign: ____
```
Accounts isi ko **Payment maango → Thekedar bill** mein daalta hai. App hazri se khud milata hai.

---

## B. Engineer / supervisor accountability

| Kya | App | Rule |
|---|---|---|
| Site par aana/jaana | **Site visit** (Arrival / Leaving selfie + GPS) | First aur last entry se site par bitaya time pata chalta hai |
| Roz ka kaam | **Aaj ka kaam**: kaam type, naap (m³/m²), jagah, quality, 2 photo + tape photo | Isi se theoretical maal ka hisaab banta hai |
| Kaam certify | Doosra engineer/owner approve kare | Banane wala certify nahi kar sakta |
| Random re-verify | **Re-check**: doosra engineer/auditor khud naap ke likhe | 5% se zyada farq = 🔴 R16. Us kaam ka bill ruk jaata hai |
| Bina site visit certify | — | Us din GPS wali entry nahi = 🟠 R22 |
| Conflict of interest | **Log aur parties → Rishte (COI)** | Joining par har staff likhkar de: thekedar/supplier se rishta, partnership, commission. Aisa aadmi us party ka bill approve hi nahi kar sakta |

**COI declaration (paper, har staff se sign karwao):**
```
Main ____ (role ____) ghoshna karta/karti hoon ki niche likhe thekedar/supplier se mera
koi rishta / hissedari / commission nahi hai, siwaye: ____________.
Kuch badla to 7 din mein bataunga/bataungi. Jhooth paya gaya to naukri/contract khatam.
Sign ____  Date ____  Witness ____
```

---

## C. Material tracking

### C1. Material aaya (IN) — **storekeeper** banata hai, **engineer/supervisor** approve karta hai
| Field | Note |
|---|---|
| Maal | Cement (bag), Steel (kg), Sand (cft), Gitti (cft), Bricks (nos) |
| Supplier | Chip |
| Challan / bill no. | — |
| Truck no. | Number plate photo bhi zaroori |
| Challan par qty | Jo challan mein likha |
| **Asal mein mila** | Gin ke (bag), tol ke (steel: kata parchi), naap ke (sand: truck body L × B × H in ft) |
| Kata parchi no. | Weighbridge slip. Steel/gitti/sand ke liye |
| Rate ₹ | Bill wala |
| Brand + batch | Cement/steel: bag par batch no., steel par heat no. Photo bhi lo |
| Photos | Challan ✔, truck plate ✔ (dono zaroori), maal/batch, kata parchi |

- Challan vs mila: 1–2% kam = 🟠, 2% se zyada = 🔴 **R10 short supply**. Bill sirf "mila" qty ka banega.
- Sand truck ka naap: `cft = L × B × H (ft)`. Truck ke andar 3 jagah gehraai naapo, average lo.
- **Kata parchi cross-check:** net weight = gross − tare. Steel: challan kg vs kata kg. Do alag kata ki parchi ho to dono lo.

### C2. Stock register — **Stock check**
`Book stock = shuru ka stock + mila (approved) − diya`. App table: Shuru | Mila ✔ | Pending | Diya | Book | Last count.
- Roz ek maal gin ke likho (rotation: Mon cement, Tue steel, Wed sand, Thu gitti, Fri bricks, Sat cement).
- Physical count vs book 2% se zyada = 🔴 **R11**.

**Paper stock register (backup):** `Date | Maal | Opening | Received (challan no.) | Issued (kis kaam) | Closing | Physical count | Storekeeper sign | Checker sign`

### C3. Material diya (OUT / issue)
Maal, qty, kis kaam ke liye (aaj ka kaam chip), kisko diya, photo. Stock se zyada dena = warning + flag.

### C4. Theoretical vs actual (app khud karta hai)
Approved kaam × standard consumption vs issue kiya maal (Reports → Weekly):

| Kaam (1 unit) | Cement (bag) | Sand | Gitti | Steel (kg) | Bricks |
|---|---|---|---|---|---|
| PCC 1:4:8, 1 m³ | 3.4 | 16.6 cft | 33.5 cft | — | — |
| RCC M20 slab, 1 m³ | 8.06 | 14.8 cft | 29.7 cft | 80 | — |
| RCC M20 beam, 1 m³ | 8.06 | 14.8 cft | 29.7 cft | 150 | — |
| RCC M20 column, 1 m³ | 8.06 | 14.8 cft | 29.7 cft | 180 | — |
| RCC M20 footing, 1 m³ | 8.06 | 14.8 cft | 29.7 cft | 90 | — |
| Brick wall 9" (1:6), 1 m³ | 1.24 | 9.2 cft | — | — | 500 |
| Brick wall 4.5" (1:4), 1 m² | 0.21 | 1.0 cft | — | — | 57 |
| Plaster 12 mm (1:6), 1 m² | 0.063 | 0.46 cft | — | — | — |
| Plaster 20 mm (1:6), 1 m² | 0.104 | 0.77 cft | — | — | — |

- Gap allowance se 5% upar = 🔴 **R9**, allowance se upar = 🟠. Kaam bina maal ke dikhe (−15%) = 🟠: quality ya naap ki galti ho sakti hai.
- Ye standard IS 456 / common site practice se hain (concrete dry volume 1.54×, mortar 1.27×). Apne engineer se ek baar verify karwa lo; `core.js` → WORKS mein badal sakte hain.

### C5. Quality proof
- Cement/steel: brand + batch/heat no. photo, supplier ka test certificate (MTC) photo, IN entry ke saath.
- Concrete cube test: har pour par 6 cube (3 × 7 din, 3 × 28 din). **Aaj ka kaam** mein note: "cube set C-12". Result aane par lab report ki photo ke saath **Aaj ka kaam → Other: cube test** entry. Fail = engineer turant owner ko.

---

## D. Vendor / contractor / payment control

**Payment kab hoga — sab ek saath:**
1. Bill ki photo ✔
2. Duplicate nahi (same payee + same bill no., ya same amount 30 din mein) ✔
3. Wages/thekedar: bill man-days ≤ approved hazri; amount ≤ hazri × wage ✔
4. Thekedar bill: jis kaam ka bill, wo certified ho aur re-check fail na ho ✔
5. Supplier bill: billed qty ≤ received + verified qty; rate ≤ approved rate (5% tak 🟠, upar 🔴) ✔
6. Advance: outstanding advance ≤ limit ✔
7. Round amount (₹10,000+ aur 1,000 ka multiple) = 🟠: working maango
8. **2 approval (alag log), ek owner.** Banane wala (accounts) approve nahi kar sakta. COI wala approve nahi kar sakta.

Sab green + 2 approval ke baad hi **Payment ho gaya** mein UTR + receipt photo ke saath "paid" hota hai. Pehle paid mark kiya = 🔴 R8. **Cash avoid karo.** Bank/UPI ka UTR zaroori hai.

**Advance limit:** thekedar ke work order ka 10% (default). People → Thekedar → Advance limit. Har bill mein "Advance adjust ₹" bharo; outstanding app khud ginta hai.

---

## E. Roz ka schedule (har step 2–3 minute)

| Time | Kaun | Kya (app screen) | Minute |
|---|---|---|---|
| 7:55 | Gate | App kholo, GPS on, PIN | 1 |
| 8:00–8:30 | Gate | **Hazri IN**: har worker QR/tap + selfie | 20 sec/worker |
| 8:30 | Engineer | **Site visit → Arrival** selfie | 1 |
| 9:00 | Supervisor | **Approve karo**: hazri photo milao | 3 |
| Truck aate hi | Storekeeper | **Material aaya**: challan + truck plate + kata parchi photo, gin/naap/tol | 3 |
| Truck ke 30 min mein | Engineer/supervisor | **Approve**: material IN (maal dekh ke) | 2 |
| Maal dete waqt | Storekeeper | **Material diya**: kis kaam, kisko | 1 |
| 11:00–4:00 | Supervisor | **Aaj ka kaam**: har kaam ka naap + 2 photo | 2 per kaam |
| Concrete pour | Engineer | **Site visit → Concrete pour** + cube note | 2 |
| 5:00–5:30 | Gate | **Hazri OUT** selfie | 20 sec/worker |
| 5:30 | Storekeeper | **Stock check**: aaj ka maal gino | 3 |
| 5:45 | Supervisor | OUT hazri approve | 2 |
| 6:00 | Engineer | Kaam certify (approve) + **Kal ka plan** + Leaving selfie | 5 |
| 6:15 | Owner | **Reports → Daily → WhatsApp**; red flags dekho; payment approve | 5 |
| Kabhi bhi (random) | Auditor | **Surprise audit** | 15 |

---

## F. Tools setup (free)

### F1. App (main tool)
- Link kholo → "Add to Home screen". Owner pehle **site setup** kare, site par khade hoke location lo.
- People → Staff mein har aadmi ka role + PIN. **Ek aadmi = ek role.**
- Sync → Google Apps Script URL + site key. Setup: [GOOGLE-SETUP.md](GOOGLE-SETUP.md).

### F2. Google Forms (sirf backup, jab app na chale)
Exact questions [GOOGLE-SETUP.md § Forms](GOOGLE-SETUP.md#google-forms-backup) mein. Form ki entries baad mein app mein dalni hain, aur wo "unverified" ginti hain.

### F3. Google Sheet structure
Tabs aur columns: GOOGLE-SETUP.md. Main tab **Ledger** (sirf script likhti hai, koi edit nahi). Uske upar **Daily**, **Stock**, **Attendance**, **Payments**, **Flags** tabs formulas se bante hain.

### F4. WhatsApp group rules
Groups:
1. **"<Site> — Daily Report"**: owner, engineers, accounts. Sirf daily report aur red flag alert.
2. **"<Site> — Site Team"**: sab staff. Photos nahi, sirf instructions.

Rules:
- Proof sirf app mein. WhatsApp par bheji photo record nahi maani jaayegi (wahan edit/forward ho sakti hai).
- Message format:
```
[RED FLAG] R10 · Patia G+2 · 14-10-2026 11:20
Kya: Cement short supply 5% (challan 100, mila 95), CH-77, Maa Tarini
Entry: DE9A4FE-13   Action: payment hold   Jawab: Store Gita, aaj 6 pm tak
```
```
[DAILY] Patia G+2 · 14-10 — (app ka "WhatsApp par bhejo" wala text)
```
- Photo naming (Drive par apne aap): `<entryId>_<kind>.jpg`, jaise `DE9A4FE-13_challan.jpg`. Kabhi haath se photo upload karni pade to: `YYYYMMDD_HHMM_<site>_<category>_<what>.jpg`.

### F5. Drive folders (Apps Script apne aap banata hai)
```
BhuChain/
  <Site name>/
    2026-10-14/
      attendance/   material-in/   material-out/   stock/
      progress/     visits/        payments/       workers/
      audits/       complaints/
    Contracts & work orders/  (owner, haath se)
    Test certificates/        (MTC, cube reports)
```

### F6. Access control
| Kaun | App | Google Sheet | Drive |
|---|---|---|---|
| Owner | Sab | Owner (edit) | Owner |
| Engineer | Kaam, visit, re-check, approve | View only | View |
| Supervisor | Hazri approve, kaam, worker | — | — |
| Storekeeper | Maal in/out, stock | — | — |
| Gate | Sirf hazri | — | — |
| Accounts | Payment request, paid | View: Payments tab | View: payments/ |
| Auditor | Audit, headcount, re-check | View only | View |
| Apps Script | Sirf add (append) | Runs as owner | Adds files |

- Ledger sheet **protected** (Data → Protect → only owner). Script sirf nayi row jodti hai, purani kabhi nahi chhooti.
- Drive folder: staff ko "Viewer". Upload sirf script karti hai.
- Phone kho jaaye to owner turant us aadmi ka PIN badle: People → correction → inactive. Site key bhi badlo: Script properties.

---

## G. Red flags — kya pakda jaata hai aur kya karna hai

🔴 **Red** = turant roko (kaam ya payment hold), owner ko batao. 🟠 **Amber** = 24 ghante mein likhit jawab. 🟢 **Green** = theek, monitor.

| Code | Flag | Severity | Action |
|---|---|---|---|
| R1 | Same photo do entries mein | 🔴 | Dono entries hold; banane wale se jawab |
| R1b | Bilkul milti-julti photo (same type) | 🟠 | Check karo |
| R1c | Worker ki same selfie do din | 🔴 | Us din ki hazri radd; gate wale se jawab |
| R2 | Hazri GPS site se bahar | 🔴 | Hazri hold; surprise headcount |
| R3 | Hazri raat/bahut subah | 🟠 | Gate se jawab |
| R4 | Ghost / double worker (photo ya Aadhaar-4 + naam) | 🔴 | Dono ID ki payment hold; thekedar ko bulao |
| R5 | Ek aadmi 90%+ approvals kar raha hai | 🟠 | Approval baanto |
| R6 | Entry bina photo/GPS | 🟠 | Unverified; dobara saboot ke saath |
| R6b | Purani/gallery photo | 🟠 | Live photo maango |
| R7 | Payment check fail (duplicate, man-days, rate, qty, advance) | 🔴 / 🟠 | Payment hold |
| R8 | Checks pass hone se pehle "paid" | 🔴 | Accounts se jawab; recovery |
| R9 | Maal kharch kaam ke hisaab se zyada | 🔴 / 🟠 | Stock audit + engineer se jawab |
| R10 | Short supply (challan vs mila) | 🔴 >2% / 🟠 1–2% | Bill sirf mila qty ka; supplier ko notice |
| R11 | Physical stock vs book >2% | 🔴 | Store audit; storekeeper se jawab |
| R12 | Jisne hazri/maal record kiya, usi ne payment approve kiya | 🔴 | Payment hold; doosra approver |
| R16 | Re-check fail (>5%) | 🔴 | Us kaam ka bill hold; engineer se jawab |
| R17 | Staff ka party se rishta | 🟠 | Wo us party ka kuch approve nahi karega |
| R18 | Approval 24 ghante se pending | 🟠 | Approver ko yaad dilao |
| R19 | Headcount ≠ app ki hazri | 🔴 | Us din ki poori hazri re-verify |
| R20 | Surprise audit mismatch | 🔴 | Item-wise jawab |
| R21 | Same auditor 3 baar lagatar | 🟠 | Rotation |
| R21b | Ek aadmi ke mahine mein 5+ corrections | 🟠 | Training ya jaanch |
| R22 | Kaam certify kiya, us din site visit nahi | 🟠 | Engineer se jawab |
| R23 | Record se chhed-chhaad (hash nahi milta) | 🔴 | Turant owner; backup se milao; police/legal |

Iske alawa haath se dekhne wale signs: late-night entries ki aadat, ek hi supplier ko har order, rate har mahine thoda-thoda badhna, bill hamesha mahine ke aakhri din, aur staff ka chhutti na lena (koi aur uska kaam na dekh le).

---

## H. Reports

### Daily (owner, 1 page) — **Reports → Daily → WhatsApp par bhejo**
Attendance (thekedar-wise), man-days, stock closing (in/used/unverified), aaj ka kaam + status, progress %, red/amber flags, pending approvals, kal ka plan.

### Weekly — **Reports → Weekly**
1. Hazri vs bill vs payment, thekedar-wise (gap days 🔴)
2. Maal: kaam ke hisaab se lagna tha vs diya (gap %)
3. Surprise audit results
4. Hafte ke saare flags

Owner har Monday 30 minute baith ke har 🔴 ka jawab likhwaye (paper par sign).

### Monthly — **Reports → Monthly**
- **Scorecard (100 = saaf):** short supply −4/−10, red payment check −10, re-check fail −15. 70 se kam = warning, 50 se kam = naya kaam band.
- **Leakage estimate (₹):** zyada maal × rate + short supply × rate + extra man-days × ₹600.
- Flags by rule: trend dekho, kaunsa niyam baar-baar toot raha hai.

---

## I. Surprise audit system

- **Kab:** hafte mein kam se kam 1 baar, din pehle se fix nahi. Owner ka tareeka: subah dice phenko, 1 ya 6 aaye to aaj audit. App ka 🎲 button bhi chalega.
- **Kya chuna jaata hai:** app 🎲 dabane par `crypto.getRandomValues` se 2–5 present workers, 2 maal aur 1 haal ka certified kaam chunta hai. **Chunav pehle ledger mein record hota hai**, isliye baad mein "aasaan" item nahi chun sakte.
- **Checklist:**
  1. Har chuna worker: naam bolke bulao, chehra ID photo se milao, trade sahi?
  2. Har chuna maal: gino/naapo vs book stock (2% tak theek)
  3. Chuna kaam: tape se naapo vs certified qty (5% tak theek)
  4. Surprise headcount: sab workers gino vs app
  5. Store: challan file mein sab challan hain? Kata parchi lagi hai?
- **Rotation:** owner → doosri site ka engineer → owner ka bharosemand aadmi. Same aadmi lagatar 3 baar nahi (🟠 R21). Jis site ka engineer hai, wo apni site ka audit nahi karega.
- **Report format** (app khud banata hai: audit entry + photos):
```
Audit ID ____ Date ____ Auditor ____ Site ____
| Item | Book/expected | Found | OK? | Photo |
Kul mismatch: __   Action: ____   Auditor sign ____  Owner sign ____
```

---

## J. Penalty aur accountability

| Kitni baar / kitna bada | Kya hoga |
|---|---|
| Pehli chhoti galti (bina saboot entry, late approval) | Likhit warning + training |
| Doosri baar, ya 🟠 bina jawab | Us hafte ka incentive/bonus kata; thekedar ka us item ka payment hold |
| 🔴 fraud saabit (fake hazri, ghost worker, short supply chhupana) | Payment hold, recovery (2× nuksaan), staff suspend / thekedar ka contract khatam |
| Baar-baar ya ₹50,000+ ka nuksaan | Blacklist (BhuChain ke saare projects), FIR (IPC/BNS cheating & forgery), civil recovery |

- Har case ki file: flag, entries, photos, jawab, faisla, owner sign.
- Thekedar/supplier agreement mein ye clause pehle se daalo: "BhuChain ke record (app ledger + photos) proof maane jaayenge; short supply/fake hazri par recovery + blacklist."

**Whistleblower (gupt shikayat):**
- App mein login ke bina 🤫 **Gupt shikayat**: naam save nahi hota. Photo laga sakte hain.
- Ek **Google Form** bhi banao, "Collect emails" OFF. Link: Log aur parties → Site. QR print karke canteen/toilet ke paas lagao.
- Ek alag phone number (owner ka personal), sirf shikayat ke liye.
- Shikayat sirf owner dekhe. Sach nikle to ₹1,000–5,000 inaam. Shikayat karne wale par koi action nahi.

---

## K. Future upgrade path

| Abhi (manual) | Baad mein (camera / software) |
|---|---|
| Gate selfie + supervisor milata hai | Face recognition (on-device), turnstile |
| Physical headcount | CCTV people-count, AI se hazri vs count |
| Truck plate photo | ANPR camera gate par, entry apne aap |
| Kata parchi photo | Weighbridge API / Bluetooth scale se seedha weight |
| Stock gin ke | RFID/QR bag tags, smart store |
| Kaam ka naap tape se | Drone/laser scan se volume |
| Google Sheet | Proper backend (Postgres), role-based login, BhuChain account |
| Daily WhatsApp report | Push notification + dashboard |

**App ka data model change nahi hoga.** Har entry already JSON hai: id, device, seq, type, time, by, GPS, photo hashes, data, prev hash, hash. Naya system wahi entries padhega.

**BhuChain blockchain anchoring (tamper-proof):**
1. Har entry ka SHA-256 hash pichhli entry se juda hai (per phone chain). Ye abhi se chal raha hai.
2. Har din raat 8 baje us din ki saari entry hashes ka **Merkle root** banta hai. App: Reports → Day hash. Sheet: `Anchors` tab, Apps Script `dailyAnchor()`.
3. Wo ek root (32 bytes) BhuChain chain par ek transaction mein jaata hai, jaise `anchor(siteId, date, root, count)`. Transaction ID `Anchors` tab ke `chain_tx` column mein.
4. Baad mein koi bhi entry badli/hatayi gayi to us din ka root match nahi karega. Kisi bhi ek entry ka proof: entry hash + Merkle path + on-chain root.
5. Milestones (slab cast, plinth complete), inspection aur bade material lots ko alag se bhi anchor kar sakte hain. Inke hashes property ke land record se link honge, taaki buyer ko construction quality ka proof mile.

Photos chain par nahi jaati (bahut badi aur private). Sirf unka hash jaata hai. Photo Drive mein rehti hai, aur uska hash entry mein hai, isliye photo badli to pakdi jaayegi.
