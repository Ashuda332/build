# BhuChain Build

Plan, design and build your home in Odisha — plot to plan, 3D, structure, materials and quotation, all in one page (`index.html`).

## Live site

Every push to `main` deploys `index.html` to GitHub Pages (`.github/workflows/pages.yml`).
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site then lives at `https://<owner>.github.io/<repo>/`.

## 3D floor plan with furniture

- On the **Layout** step, open **Plan** and tap **3D with furniture**. That floor opens as a cut-away dollhouse: drag to turn it, pinch or scroll to zoom. **Top view** looks straight down, and **Walk inside** shows the same furniture at eye level.
- Every room is furnished automatically by a placement engine. Each piece keeps doors able to open, stays off windows (tall pieces) and french doors, and leaves a 2 ft walking path from every door. A piece that would break these rules is left out, and the bar under the view lists what was left out.
- Real 3D models come from the furniture library (`assets/`, see [ASSETS.md](ASSETS.md)): velvet and leather sofas, accent chairs, a pouf, a plant, a table lamp and a vase. All are licensed and credited. Everything else is BhuChain's own parametric furniture.
- Living rooms and bedrooms are planned by scoring every workable arrangement (sofa on each wall, L-shaped sectionals, TV opposite, second seat). Floors, walls and outside cladding use PBR materials at real size, lit by Poly Haven HDRIs. **Exterior** offers ten bungalow styles fitted to the house (Neo-classical palace villa, Colonial verandah villa, Modern cantilever villa, Modern Indian luxury, Contemporary stone and timber, Modern tropical villa, Minimalist contemporary, Premium urban bungalow, Traditional luxury bungalow, Modern Indian fusion) plus Custom. The steps are: start, what to build, **Plot**, **Home**, **Budget**, then the design, structure, materials and quotation. On the **Plot** step, enter the four sides of the land, or type the area and the four sides scale to match. The sketch marks the corner directions (for example SE and NE on an east road) and redraws as you type. Then type the open space to leave around the house (front, back and each side, in feet, half feet allowed). Any value that still leaves a house of at least 15 × 22 ft is accepted; the hint shows the most each side can take on that plot. The sketch shows the house area that is left, and the plan, 3D and estimate all follow it. **Paint** and **Inside paint** add 32 outside and 30 inside 2026 trend schemes (colours of the year, warm neutrals, greens, two-tone, earthy Indian, moody darks, colour drench) with limewash, microcement, Venetian, travertine and fluted textures. **Compare exterior styles** renders them side by side, and **Day / Golden hour / Evening** sets the light.
- **Home** step: the room list on the right (living/drawing, bedrooms, master and guest bedrooms, kitchen, dining, common and attached toilets, puja, study, store, dressing, staircase, lift, balcony, parking, utility, sit-out, family lounge, helper room and terrace), each with its own types. A top-view plan of every floor (and the roof) stays fixed on the left and redraws as you change rooms. Minimum sizes: master bedroom 12 × 12 ft, bedroom 10 × 10, living 10 × 12, kitchen 8 × 10, dining 10 × 10, puja 7 × 5, toilet 7 × 7, staircase 8 × 12, utility 5 × 5. The rooms on each floor must fit the house area after the setbacks, with 10% kept for walls and the passage. If they do not, the app shows why the list is not valid for the plot, and you cannot continue until you change it.
- **Pooja**: an open alcove in a corner of the living or dining room. It is a small corner in an ordinary room and a big alcove of up to 7 ft in a large one. It never shares a wall with a toilet, and no toilet sits above it (Vastu); if a toilet ends up next to it, the pooja moves to a clear corner. In 3D it is a white marble mandir with Radha–Krishna murtis: pillars, a carved arch, a dome with kalash, a lit mandala and diyas. The big version adds a backlit wall, a cloth canopy and lit side niches.
- **Doors and furniture**: the openings between the hall, dining, stair, lounge and passage are open archways; bedrooms, kitchen and baths keep their doors. Furniture keeps 3 ft clear in front of every door. In a hall with doors on every wall, it uses a 2 ft gap or a compact seat instead.
- **Budget** step: first the package, then the range. The packages are **Core house** (ready to live in), **Semi-furnished** (adds modular kitchen, wardrobes and false ceiling) and **Fully furnished** (adds furniture and interiors). The ranges are **Low / Mid / High** (Ultra luxury for villas). The step lists every brand sold in the chosen range for each material, and lets you change it. It also shows the labour charge per sq ft with approximate 2026 daily wages for Cuttack–Bhubaneswar. Prices use Cuttack–Bhubaneswar rates, so there is no separate location step. **Style** sets the look: 14 interior styles that change the models, finishes, materials and how full the rooms are.
- **Furniture library** lets you browse, filter, choose models and finishes for the house. **Try another arrangement** rearranges every room. **Save design** keeps the whole design on this device, and **Export file** / **Import file** move it to another device.

## Running locally

The furniture library is loaded over HTTP, so open the app through a server rather than as a file:

```bash
node tools/serve.mjs 8080   # then open http://127.0.0.1:8080
npm ci && npm test          # catalog validation + placement tests (needs Playwright's Chromium)
```
