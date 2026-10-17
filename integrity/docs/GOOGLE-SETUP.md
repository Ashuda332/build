# Google Sheets, Drive, Forms — setup (owner, ek baar, ~30 minute)

App sab kuch pehle phone mein rakhta hai. Ye setup karne se har phone ki entries ek Google Sheet aur Drive folder mein aa jaati hain, aur har phone ko doosre phones ki entries bhi milti hain.

## 1. Sheet + Apps Script
1. Drive mein folder banao: `BhuChain/<Site name>`. URL ke aakhri hisse ko copy karo: ye **DRIVE_FOLDER_ID** hai.
2. Usi folder mein naya Google Sheet banao: `BhuChain <Site> Ledger`.
3. Sheet → **Extensions → Apps Script** → `Code.gs` ka sab mita do → [`apps-script/Code.gs`](../apps-script/Code.gs) paste karo → Save.
4. **Project Settings (⚙) → Script properties:**
   - `SITE_KEY` = ek lamba random password (jaise 24 akshar). Sirf staff phones mein daalna hai.
   - `DRIVE_FOLDER_ID` = step 1 wala ID.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy karo, permissions allow karo, aur **/exec URL** copy karo.
6. Har phone: app → **Sync / backup** → URL + site key → "Save + sync now".
7. **Triggers (⏰) → Add trigger** → `dailyAnchor`, Time-driven, Day timer, 8–9 pm. Ye roz ka Merkle root `Anchors` tab mein likhega.
8. Sheet → `Ledger` tab → **Data → Protect sheets and ranges** → "Only you". Script aapke naam se chalti hai, isliye phir bhi row jod payegi. Koi aur haath se edit nahi kar payega.

> "Anyone" access ka matlab: URL + site key dono jisko pata ho wahi data bhej/padh sakta hai. Key ke bina koi entry nahi judti. Har entry ka hash bhi check hota hai, aur badli hui entry refuse hoti hai.

## 2. Sheet tabs
`Ledger` aur `Anchors` script banati hai. Baaki tabs owner ek baar formula se banaye; ye apne aap update hote rahenge.

### Ledger (script likhti hai — append only)
`id | device | seq | type | at_utc | date_ist | time_ist | by | lat | lng | gps_acc | photos | data_json | prev | hash | received_at`

### Attendance
| A date | B time | C worker | D in/out | E by | F lat | G lng |
|---|---|---|---|---|---|---|

A2 mein:
```
=QUERY(Ledger!A:P, "select F, G, M, H, I, J where D = 'att'", 1)
```
Worker ID ke liye ek helper column:
```
=REGEXEXTRACT(C2, """worker"":""([^""]+)""")
```

### Daily summary
Date B1 mein (`=TODAY()`):

| Cell | Formula |
|---|---|
| Hazri entries | `=COUNTIFS(Ledger!D:D,"att",Ledger!F:F,TEXT(B1,"yyyy-mm-dd"))` |
| Material IN entries | `=COUNTIFS(Ledger!D:D,"matIn",Ledger!F:F,TEXT(B1,"yyyy-mm-dd"))` |
| Kaam entries | `=COUNTIFS(Ledger!D:D,"work",Ledger!F:F,TEXT(B1,"yyyy-mm-dd"))` |
| Bina GPS entries | `=COUNTIFS(Ledger!F:F,TEXT(B1,"yyyy-mm-dd"),Ledger!I:I,"")` |
| Raat ki entries | `=COUNTIFS(Ledger!F:F,TEXT(B1,"yyyy-mm-dd"),Ledger!G:G,">20:30")+COUNTIFS(Ledger!F:F,TEXT(B1,"yyyy-mm-dd"),Ledger!G:G,"<05:30")` |

Poora hisaab (stock, man-days, flags) app ki **Reports** mein hai. Sheet sirf record aur backup ke liye hai.

### Conditional formatting (red-flag highlight) — Ledger tab
Format → Conditional formatting → "Custom formula is", range A2:P:
- Bina GPS → red fill: `=AND($A2<>"",$I2="")`
- Raat ki entry → orange fill: `=OR($G2>"20:30",$G2<"05:30")`
- Same photo hash do baar → red fill: `=AND($L2<>"",COUNTIF($L:$L,$L2)>1)`
- Late upload (entry ke 24 ghante baad Sheet mein aayi) → orange fill: `=$P2-DATEVALUE($F2)>1.5`

### Anchors (script likhti hai)
`date | entries | merkle_root | made_at | chain_tx`. Blockchain transaction ID `chain_tx` mein likho.

## Google Forms (backup)
Sirf tab jab app na chale (phone kharab ho). Har form mein Settings → "Collect email addresses" ON, **gupt shikayat form ko chhod ke**. Form ki entries baad mein app mein dalni hain, aur "unverified" maani jaayengi.

**1. Hazri (backup)**
1. Aapka naam (dropdown)
2. Worker ID (short answer; card par likha hai)
3. IN / OUT (multiple choice)
4. Selfie (file upload, image, 1)
5. Site par ho? (Yes/No)

**2. Material IN (backup)**
1. Storekeeper (dropdown)
2. Maal (dropdown: Cement/Steel/Sand/Gitti/Bricks)
3. Supplier (dropdown)
4. Challan no.
5. Truck no.
6. Challan qty (number)
7. Mila qty (number)
8. Kata parchi no.
9. Rate
10. Challan photo (upload)
11. Truck plate photo (upload)
12. Kata parchi photo (upload)

**3. Material OUT (backup)**
1. Storekeeper
2. Maal
3. Qty
4. Kis kaam ke liye
5. Kisko diya
6. Photo

**4. Daily progress (backup)**
1. Engineer/supervisor
2. Kaam (dropdown)
3. Qty
4. Unit
5. Jagah
6. Quality OK/Problem
7. Notes
8. Photo 1
9. Photo 2

**5. Incident report**
1. Naam
2. Kab
3. Kya hua (accident / chori / jhagda / quality / other)
4. Kaun shamil
5. Photo
6. Action liya

**6. Gupt shikayat (anonymous)**
- Email collect OFF. Login required OFF.
- Fields: Kya galat ho raha hai (paragraph), Kab/kahan (short), Photo (optional upload — note: file upload needs Google sign-in, so make it optional and say "photo WhatsApp number par bhejo" as alternative).
- Link app mein: Log aur parties → Site → complaint form link.

## WhatsApp
- Owner har shaam app se **Reports → Daily → WhatsApp par bhejo** → group "<Site> — Daily Report".
- Red flag par app ka flag text copy karke bhejo, format MANUAL.md § F4 mein hai.
