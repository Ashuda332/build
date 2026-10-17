# BhuChain Build

Plan, design and build your home in Odisha — plot to plan, 3D, materials and quotation, all in one page (`index.html`).

## Live site

Every push to `main` deploys `index.html` to GitHub Pages (`.github/workflows/pages.yml`).
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site then lives at `https://<owner>.github.io/<repo>/`.

## 3D floor plan with furniture

- On the **Layout** step, open **Plan** and tap **3D with furniture**. That floor opens as a cut-away dollhouse: drag to turn it, pinch or scroll to zoom. **Top view** looks straight down, and **Walk inside** shows the same furniture at eye level.
- Every room is furnished automatically by a placement engine. Each piece keeps doors able to open, stays off windows (tall pieces) and french doors, and leaves a 2 ft walking path from every door. A piece that would break these rules is left out, and the bar under the view lists what was left out.
- Real 3D models come from the furniture library (`assets/`, see [ASSETS.md](ASSETS.md)): velvet and leather sofas, accent chairs, a pouf, a plant, a table lamp and a vase. All are licensed and credited. Everything else is BhuChain's own parametric furniture.
- Living rooms and bedrooms are planned by scoring every workable arrangement (sofa on each wall, L-shaped sectionals, TV opposite, second seat). Floors, walls and outside cladding use PBR materials at real size, lit by Poly Haven HDRIs. **Exterior** offers ten bungalow styles fitted to the house (Neo-classical palace villa, Colonial verandah villa, Modern cantilever villa, Modern Indian luxury, Contemporary stone and timber, Modern tropical villa, Minimalist contemporary, Premium urban bungalow, Traditional luxury bungalow, Modern Indian fusion) plus Custom. The steps are: start, what to build, **Plot**, **Home**, **Budget**, then the design, structure, materials and quotation. On the **Plot** step, enter the four sides of the land, or type the area and the four sides scale to match. The sketch marks the corner directions (for example SE and NE on an east road) and redraws as you type. Then type the open space to leave around the house (front, back and each side, in feet, half feet allowed). Any value that still leaves a house of at least 15 × 22 ft is accepted; the hint shows the most each side can take on that plot. The sketch shows the house area that is left, and the plan, 3D and estimate all follow it. **Paint** and **Inside paint** add 32 outside and 30 inside 2026 trend schemes (colours of the year, warm neutrals, greens, two-tone, earthy Indian, moody darks, colour drench) with limewash, microcement, Venetian, travertine and fluted textures. **Compare exterior styles** renders them side by side, and **Day / Golden hour / Evening** sets the light.
- **Home** step. Three parts beside the real 2D plan:
  - **Space check:** the verdict for your choices. "Comfortable" is used only when the home needs 85% of the buildable area or less and no drawn room is under its minimum. "Tight" means it fits at minimum sizes. "Too small" lists the reasons and the smallest changes that fit (fewer bedrooms, one more floor, compact rooms, less parking). A home that is too small cannot continue.
  - **What fits on your plot:** plot area, buildable area after the setbacks, open space, and usable area after walls. Then 1RK to 4BHK, each marked Comfortable, Tight or Too small.
    - Needs use practical minimum room sizes, above the NBC 2016 legal minimums.
    - They add 12% for passages, 13% for walls, about 105 sq ft of stair per floor, the parking, and 3% for light shafts on large floors.
    - They also check the house width and what the ground floor must hold.
  - **Your requirements:** on G + 1 or more, choose **Each floor its own BHK** (the default: ground, first and second floor each pick 1–4 BHK with their own kitchen and living, and every floor starts as a 1 BHK; the check names the floor that does not fit) or **One home** (bedrooms counted for the whole building; they fill the ground floor first and only the rest go upstairs). **Bathrooms:** attached only (every bedroom has its own toilet and bath) or attached + one common bathroom (on every floor that has a home). Spare cells upstairs show as free space, not sit-outs. Also floors, bedrooms, room sizes (compact / balanced / spacious), parking, puja, Vastu, and on G + 1 or more the balcony and roof.
  - **The plan:** the same drawing as the final design, with layouts A/B/C, zoom, measure, and **Resize rooms** (drag a gold line; sizes update live).
    - Undersized rooms show in the space check: bedrooms, living, kitchen, dining, car parking, passages, baths, stairs.
    - A resized plan stays through budget, style and paint changes. The 3D in the last step is built from it.
- **Pooja**: an open alcove in a corner of the living or dining room. It is a small corner in an ordinary room and a big alcove of up to 7 ft in a large one. It never shares a wall with a toilet, and no toilet sits above it (Vastu); if a toilet ends up next to it, the pooja moves to a clear corner. In 3D it is a white marble mandir with Radha–Krishna murtis: pillars, a carved arch, a dome with kalash, a lit mandala and diyas. The big version adds a backlit wall, a cloth canopy and lit side niches.
- **Structure**: not designed here. Columns, beams, footings and steel come from an architect or a structural engineer / contractor after a soil test; the quotation says so.
- **Privacy**: a toilet opens off a bedroom, passage, lounge, study or store — never off the living room, dining or kitchen.
- **Door and window sizes**: every opening on the plan carries its mark and size (W 4′×4′, D 3′×7′, MD main door, BD bath door, Arch). **Doors & windows** on the layout step lists them with counts and lets you pick the type of main door, room doors, bath doors, windows and grills; the price follows.
- **Move furniture**: on the plan, drag a piece to move it (6-inch snap), or turn or remove it; the rest of the room stays as it is. A spot in front of a door, in a door swing, over a bath or on another piece is refused, with the reason.
- **Doors and furniture**: the openings between the hall, dining, stair, lounge and passage are open archways; bedrooms, kitchen and baths keep their doors. Furniture keeps 3 ft clear in front of every door. In a hall with doors on every wall, it uses a 2 ft gap or a compact seat instead.
- **Rental units**: the units grow (up to 1.5 × their usual size) to fill the land instead of leaving it empty. Every room of every flat has a door — bedrooms off the hall, a bath only from its bedroom, a small balcony off each bedroom for light — and the unit plan writes each door and window size.
- **Parking for rentals and apartments**: car bays 9 × 18 ft and bike stalls 2′6″ × 6′, each with its size on the plan; a drive aisle kept free to take vehicles out (12 ft for rentals, 20 ft between apartment bay rows), or for rentals “back out to the road” through wide gates when that fits more units. A 4 ft entry path runs from a walk-in gate to the building door and is never parked on. The entry gate type (sliding, swing, telescopic, automatic, folding) is a choice and is priced.
- **Apartments**: floors are capped at a floor-area ratio of about 3, so a small plot is not turned into a thin tower of one flat a floor; the plan says how many of the requested flats fit.
- **Front elevation styles (apartments and rentals)**: ten looks — glass curtain wall, wooden fins, box frames, brick and glass, stone luxe, staggered balconies, green balconies, monochrome grid, aluminium louvers, modern Odia jaali — drawn in the 2D elevation and the 3D building, with a style gallery. Each comes with its exterior finishes (ACP, HPL, stone, brick tiles, WPC fins, glass, texture paint, exterior tiles, louvers, planters, jaali, glass railings); the owner can switch any of them and the estimate follows. Different plots get different default looks.
- **Core house = bare shell.** What it includes:
  - structure: RCC foundation, columns, beams and slab; brick walls; cement plaster inside and out
  - door and window openings only
  - plumbing: concealed water and drain pipes with capped points, plus septic or drainage
  - electrical: conduits, concealed boxes, DB box and earthing
  - kitchen and floors: PCC base floor and an RCC kitchen counter slab

  Labour is civil work and plaster only (70% of the full rate). Doors, windows, grills, tiles, putty, paint, wiring, switches, bathroom and kitchen fittings, tank, pump, gate, railings, cladding and garden move to Semi-furnished.

  In 3D, the core house shows as the shell by default: grey cement plaster, PCC floor, empty openings, and no frames, glass, railings, cladding, lights, tank or furniture. "Finished" shows the full design.
- **Materials** on the budget step: three dropdowns a row on a wide screen, two on a tablet, one on a phone.
- **Budget** step: one grid shows all three packages in all three ranges, nine prices at once; tap one to choose both. The packages are:
  - **Core house:** the starter shell, with walls, roof, doors, windows, flooring, paint, concealed wiring, toilet and taps, and a kitchen counter and sink.
  - **Semi-furnished:** adds fans, tube lights and exhaust, fitted bathrooms, a modular kitchen with chimney, wardrobes and a false ceiling.
  - **Fully furnished:** adds geysers, ACs, furniture, TV, fridge, washing machine, microwave, RO, curtains, rugs and decor.

  The ranges are **Low / Mid / High** (Ultra luxury for villas). Below the grid, a **What you get** table compares the three packages row by row for the chosen range, with the actual items. Every material has a dropdown: the brands for the chosen range come first, then every other option. A brick-size switch (9 inch or 10 inch red brick) sits above the What you get table. It also shows the labour charge per sq ft with approximate 2026 daily wages for Cuttack–Bhubaneswar. Prices use Cuttack–Bhubaneswar rates, so there is no separate location step. **Style** sets the look: 14 interior styles that change the models, finishes, materials and how full the rooms are.
- **Furniture library** lets you browse, filter, choose models and finishes for the house. **Try another arrangement** rearranges every room. **Save design** keeps the whole design on this device, and **Export file** / **Import file** move it to another device.

## Running locally

The furniture library is loaded over HTTP, so open the app through a server rather than as a file:

```bash
node tools/serve.mjs 8080   # then open http://127.0.0.1:8080
npm ci && npm test          # catalog validation + placement tests (needs Playwright's Chromium)
```
