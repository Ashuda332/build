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
- Living rooms and bedrooms are planned by scoring every workable arrangement (sofa on each wall, L-shaped sectionals, TV opposite, second seat). Floors, walls and outside cladding use PBR materials at real size, lit by Poly Haven HDRIs. **Exterior** offers seven bungalow styles fitted to the house (Modern Indian luxury, Contemporary stone and timber, Modern tropical villa, Minimalist contemporary, Premium urban bungalow, Traditional luxury bungalow, Modern Indian fusion) plus Custom. **Compare exterior styles** renders them side by side, and **Day / Golden hour / Evening** sets the light.
- **Budget range** (Low / Mid / High / Ultra luxury) sets the quality and the price. **Style** sets the look: 14 interior styles that change the models, finishes, materials and how full the rooms are.
- **Furniture library** lets you browse, filter, choose models and finishes for the house. **Try another arrangement** rearranges every room. **Save design** keeps the whole design on this device, and **Export file** / **Import file** move it to another device.

## Running locally

The furniture library is loaded over HTTP, so open the app through a server rather than as a file:

```bash
node tools/serve.mjs 8080   # then open http://127.0.0.1:8080
npm ci && npm test          # catalog validation + placement tests (needs Playwright's Chromium)
```
