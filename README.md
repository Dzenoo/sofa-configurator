# Sofa Configurator

A 3D configurator for a modular sofa. Pick a layout, a fabric, the legs, the cushions and an ottoman; the sofa and the price update as you choose, and the exact configuration can be shared as a link.

**Live:** https://sofa-configurator-dzenis.vercel.app

It is a frontend project. There is no backend: the catalog is a JSON file and the price is computed in the browser. The products and prices are sample data.

## What it does

- **Four layouts** from one model: 2-seater, 3-seater, and a corner sofa facing left or right. Modules assemble one after another when a layout is chosen.
- **Six fabrics in three weaves** (linen, bouclé, velvet), each with its own relief, roughness and sheen. Colors fade into each other instead of switching.
- **Three leg finishes:** oak and walnut with a wood grain, and black metal.
- **A live price** with a breakdown per choice. Fabric and cushions are charged per seat.
- **Rules between options.** Soft cushions can't be combined with the lightest fabric; the blocked option is disabled and says why.
- **Shareable links.** The selection lives in the address (`/?config=l3.fb2.lo.cs.t1`), so reloading or sharing the page opens the same sofa and the same price. A link with an unknown or blocked option falls back to a valid one instead of breaking.
- **Keyboard and screen reader support.** Every group is a radio group, the price is announced when it changes, and every color has a name next to it.

## Stack

| Part | Used |
| --- | --- |
| Build | Vite, TypeScript |
| UI | React, Tailwind CSS, Base UI, Motion |
| 3D | three.js, React Three Fiber, drei |
| State | Zustand |
| Data checks | Zod |
| Tests | Vitest |

## Run it

The project uses [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # start the dev server
pnpm test       # run the unit tests
pnpm typecheck  # check the types
pnpm build      # build for production into dist/
```

## How it is built

### Data and prices

The app is written as if a backend existed, so adding one later means changing a single folder.

- `src/lib/data` is the only way to reach the catalog and the prices. It exposes `getCatalog()` and `quote(selection)`, both async. Today they read `catalog.json` and compute the price locally; with a backend they would call `GET /catalog` and `POST /quotes`, and no component would change.
- `src/lib/pricing` holds `price(catalog, selection)`, a pure function with no React and no browser APIs, so the same code can run on a server.
- The catalog is checked against a Zod schema when it loads. The TypeScript types are inferred from that schema, so the two can't drift apart.
- Money is always whole cents, never a float.
- Compatibility rules are data in the catalog ("option X excludes option Y", with a reason), not conditions in the code.

### 3D

- One `.glb` (about 90 KB, meshopt-compressed) holds every layout. Modules are instances of the same few meshes, placed in Blender. Choosing a layout only shows and hides nodes.
- Changing an option never creates a material or geometry. It changes values on the materials the model already has, so a click never compiles a shader.
- Ambient occlusion is baked in Blender into one texture for all fabric parts. The fabric uses two UV sets: one in real-world scale for the tiling weave, one for the baked shadows.
- The light is a small studio built in code from soft light panels, with one soft contact shadow on the floor. There are no shadow maps.
- The scene renders on demand: a still sofa costs nothing.
- The 3D code loads in its own chunk, after the page and the loading screen.

### Structure

```
src/
├── ui/        everything that is HTML: dock, top bar, loading screen, texts
├── scene/     everything that is 3D: sofa, camera, light
├── store/     state shared by the UI and the scene (Zustand)
└── lib/       catalog, share link and pricing, with no React
tests/         unit tests, in the same layout as src/
```

The UI and the scene never import each other. Both read the current selection from the store, and the scene is only told what to draw: it knows nothing about prices.

## Assets and licenses

- The sofa model was made in Blender for this project.
- The fabric and wood textures are from [ambientCG](https://ambientcg.com), licensed CC0.
- The fonts are Inter and Instrument Serif, both under the SIL Open Font License 1.1. Their license texts are served with the site from `public/licenses/`.
