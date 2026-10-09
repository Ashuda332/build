# Furniture asset library

BhuChain Build furnishes every room automatically. Each piece is one of two kinds:

- **Library models.** Real glTF models listed in [`assets/catalog.json`](assets/catalog.json). Each one has a licence that allows use in this app, a recorded author and source, sizes in metres, a hash, a version, and a review status.
- **Parametric pieces.** Furniture the app builds itself in feet, in the finish of the chosen budget range and style: beds, wardrobes, kitchens, bathrooms, dining sets, the pooja mandir, cars and so on. Any piece without a suitable library model uses these.

The placement engine treats both kinds the same way. Each piece has a real footprint and must pass the same checks:
- clear of door swings
- tall pieces clear of windows, and nothing in front of a french door
- a 2 ft walking path from every door
- usable space in front of each piece

A model that does not fit a room is not shrunk to fit. The engine tries a smaller model, then a parametric piece, and leaves the piece out if neither fits.

## What is in the library now

| id | model | licence | author / source |
|---|---|---|---|
| `velvet-sofa` | Glam velvet sofa, 5 finishes | CC BY 4.0 | Wayfair, LLC (model by Eric Chadwick) — [glTF-Sample-Assets/GlamVelvetSofa](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa) |
| `leather-sofa` | Chesterfield leather and wood sofa | CC BY 4.0 | Darmstadt Graphics Group GmbH, after an original by Fran Calvente (CC0) — [SheenWoodLeatherSofa](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenWoodLeatherSofa) |
| `velvet-loveseat` | Tufted velvet accent chair, 2 finishes | CC0 | Wayfair, LLC (model by Eric Chadwick) — [SheenChair](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair) |
| `damask-chair` | Damask accent chair | CC BY 4.0 | Wayfair, LLC (model by Eric Chadwick) — [ChairDamaskPurplegold](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ChairDamaskPurplegold) |
| `silk-pouf` | Pleated silk pouf | CC BY 4.0 | Wayfair, LLC (model by Eric Chadwick) — [SpecularSilkPouf](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SpecularSilkPouf) |
| `potted-plant` | Potted caladium plant | CC BY 4.0 | Darmstadt Graphics Group GmbH, after an original by Rico Cilliers (CC0) — [DiffuseTransmissionPlant](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/DiffuseTransmissionPlant) |
| `drum-table-lamp` | Drum shade table lamp | CC BY 4.0 | Wayfair, LLC (model by Eric Chadwick) — [IridescenceLamp](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/IridescenceLamp) |
| `glass-vase-flowers` | Glass vase with flowers | CC0 | Eric Chadwick (vase), Rico Cilliers (flowers) — [GlassVaseFlowers](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlassVaseFlowers) |

The licence and author of each model were copied from the "Legal" section of that model's README in the Khronos repository. The app shows CC BY credits under the 3D view ("Model credits") and in the library panel. To rebuild the whole set, run `tools/import-khronos-furniture.sh`.

## Adding a model (admin workflow)

```bash
npm ci
node tools/ingest.mjs --src <https URL or local .glb> --id <kebab-id> --name "<name>" \
  --category sofa --rooms living,lounge --license CC-BY-4.0 --author "<author>" \
  --source-url <page that states the licence> [--styles luxury-modern,contemporary] [--tiers 2,3] \
  [--front +z] [--max-texture 1024] [--simplify 0.5] [--allow-duplicate]
CHROMIUM_PATH=... node tools/thumbs.mjs <kebab-id>    # 256 px preview, also used for review
node tools/ingest.mjs --approve <kebab-id>            # status review → active (only active models are used)
node tools/validate-catalog.mjs                       # CI runs this on every pull request
```

The ingest tool:
1. Accepts only licences on the allow-list: CC0-1.0, and CC-BY-4.0 with attribution.
2. Rejects files that do not parse as glTF.
3. Strips lights, cameras and animations.
4. Sets the pivot at bottom-centre and faces the front to +Z, in metres.
5. Converts textures to WebP at 1K (or the size given), and can simplify heavy scans.
6. Records size, triangle count, file size, hash and material variants.
7. Refuses duplicates: same source file, same output, or same category and size.

Each new model is saved with status `review`, so nothing reaches users until an admin approves it. Re-ingesting an id writes a new file version, so saved designs keep their reference. `--disable <id>` takes a model out of use without deleting it.

**Who counts as admin.** This app is a static site with no server. Access control is the repository itself: only people who can merge to `main` can publish models, and the Tests workflow validates every change. A web admin panel with uploads would need a backend with logins and storage, which this project does not have yet.

**Sources that need accounts.** Sketchfab, BlenderKit, CGTrader and SketchUp 3D Warehouse were not reachable from the environment this was built in. They also need an API token or a per-model licence check, so no models were taken from them. To add one: download the GLB with your account, confirm the licence on the model page, and pass that page as `--source-url`. Never ingest a model only because it is viewable. Poly Haven and ambientCG (CC0) were also not reachable here. Their models and textures fit this pipeline unchanged.

## Materials and light

- **Surfaces.** Floors, walls, exterior cladding, paving and lawn use PBR materials generated in the app. Each has three maps: colour, normal (built from a height map) and roughness. They are laid out at real size, so a floor plank is always 6 in wide and a brick always 9 × 3 in, whatever the room size.
  - Floors are engineered wood planks, 2 ft vitrified tiles, 1 ft bath tiles or 4 ft Italian marble slabs, chosen by budget range and style.
  - Walls are textured plaster.
  - Exterior cladding is sandstone or grey stone, exposed brick, or teak or walnut boards.
  - Outside, the drive and walk-in path are pavers, and the plot is lawn.
- **Furniture materials.** The parametric furniture uses wood grain (teak, walnut, oak, reclaimed), woven fabric, marble, granite, concrete and terrazzo.
- **No licence needed.** All of the above are generated in code: they work offline and need no licence. Library models keep their own PBR materials and named finishes (KHR_materials_variants).
- **Light.** Lighting and reflections come from two Poly Haven HDRIs (CC0): `assets/hdri/apartment.exr` for the cut-away floors and `assets/hdri/park.exr` for the outside view. Both were taken from the npm package [@pmndrs/assets](https://www.npmjs.com/package/@pmndrs/assets) v1.7.0, which ships Poly Haven HDRIs at 512 × 512 as EXR. Their sky colour is toned down on load, so white walls stay white.

## Exterior finishes

Choose an exterior finish under the 3D view: As designed, Modern Indian, Contemporary minimalist, Premium villa or Warm natural. The finish sets three surfaces: the cladding on the ground floor, the plaster on the upper floors, and the cladding on the front of the upper floors.

These are finishes on the walls the plan already has. No floors, balconies or openings are added.

## Interior styles

There are 14 presets: Modern Indian, Contemporary, Minimalist, Scandinavian, Luxury modern, Traditional Indian, Warm wooden, Industrial, Mid-century modern, Japandi, Rustic, Modern apartment, Compact urban home and Premium villa. There is also "By budget".

Each style changes:
- the colours and materials
- which library models are tried first, and in which finish
- the bed, leg and rug types
- how full a room gets. Minimalist, Japandi and Compact urban add no accent chairs, poufs or plants; Compact urban also tries smaller beds, sofas and wardrobes first.

The budget range (Low, Mid, High, Ultra luxury) still decides which models are allowed and the price shown.

## How rooms are arranged

Living rooms and bedrooms are planned, not filled first-fit.

**Living rooms.** The engine tries:
- every sofa: library models, parametric 4–7 ft, and an L-shaped sectional in rooms 12 ft or wider
- on every wall
- centred or to one side

For each try it fits the teapoy, a TV unit on the opposite wall, a second seat (library chair, loveseat or armchair), a pouf and a plant. It scores the whole set-up:
- TV lined up with the sofa and off the window wall
- sofa away from the doorways and in proportion to its wall
- a second seat for conversation
- a real model preferred over a drawn one

**Bedrooms.** It scores the bed size, both bedside tables, a wardrobe, a headboard on a solid wall rather than a window or the door wall, and a centred bed.

Every try still has to pass the same placement rules. The design seed breaks ties, so different designs, and **Try another arrangement**, give different rooms.

## Tests

- `node tests/run-placement.mjs` checks the placement rules over 576 briefs (×3 design options) across budget ranges and styles. Add `--quick` for a short run.
- `node tests/ui-flow.mjs` checks that styles swap models, the rules still hold, a design saves and reopens, and the library filters work.
- `node tests/render-3d.mjs <dir> <style> <tier>` saves screenshots of the furnished dollhouse.

Set `CHROMIUM_PATH` if Playwright's own Chromium is not installed.
