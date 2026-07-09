# Fusball — Agent Context

Top-down 1v1 foosball game. **Phaser 4.0.0** + **SvelteKit 2** + **TypeScript** + **Vite**.

## Quick start

```bash
npm install
npm run dev    # http://localhost:8080
npm run build  # output: build/
```

SSR disabled (`src/routes/+layout.ts`) — Phaser is client-only.

## Repo map

```
src/
  routes/+page.svelte      # Full-viewport game mount (no demo UI)
  PhaserGame.svelte        # Svelte ↔ Phaser bridge
  game/
    main.ts                # Phaser GameConfig, Arcade physics boot
    EventBus.ts            # Cross-boundary events (emit current-scene-ready)
    config/gameConfig.ts   # ALL tunable dimensions — edit here first
    entities/              # Table, Stick, Ball
    systems/               # StickInputController
    utils/                 # mirrorPlayer, spacing
    scenes/Game.ts         # Main scene — spawn + update loop
static/assets/             # Optional image assets (MVP uses procedural graphics)
```

## Game design (current MVP)

| Topic | Detail |
|-------|--------|
| View | Top-down 2D |
| Goals | Left and right table edges |
| Players | Player1 left (4 sticks, keyboard). Player2 right (mirrored, static) |
| Sticks | GK(1 pawn), DEF(2), MID(5), ATT(3) — counts in config |
| Stick motion | Slide along Y within bumper limits; rotate API exists, input TBD |
| Ball | Arcade physics, zero gravity, bounces off walls + pawn static bodies |
| Controls | Q/A/Z, W/S/X, E/D/C, R/F/V → sticks 0–3 top/middle/bottom |

## Coordinate model

- Table centered on canvas; `PlayBounds` in local table space
- Sticks = vertical rods at fixed `xOffset` from goal side
- `bumperTop` / `bumperBottom` = fraction of play height trimmed from each end
- Player2 stick layout derived via `getMirroredPlayerConfig()` — do not duplicate manually

## Architecture rules

1. **Config first** — table, stick, pawn, ball, input values live in `gameConfig.ts`
2. **Scene orchestrates** — `Game.ts` spawns entities, wires colliders, runs `update`
3. **Entities own visuals + state** — `Stick` syncs pawn physics bodies each frame via `syncPhysics()`
4. **Systems own input** — `StickInputController` maps keys → `stick.setSlideTarget()`
5. **Imports use `.js` extension** — NodeNext TS resolution (`import X from "./Foo.js"`)

## Phaser patterns in use

- **Arcade physics** — ball dynamic; walls + pawns static
- **Procedural textures** — `physics-pixel` (1×1), `ball` generated in scene `create`
- **Container sticks** — rod + pawn graphics; invisible `StaticGroup` bodies for collisions
- **Kinematic rods** — pawn bodies repositioned every frame, not velocity-driven

## Svelte bridge

`Game.create()` must end with:

```ts
EventBus.emit("current-scene-ready", this);
```

Svelte reads `phaserRef.game` / `phaserRef.scene` from `PhaserGame.svelte`.

## Planned (not implemented)

- Bot AI for player2
- Mouse + rotation controls
- Fake 3D ball physics (spin, curved shots)
- Score UI, match rules, sound
- Matter.js upgrade (optional)

## Common tasks

| Task | Where to change |
|------|-----------------|
| Table/goal size | `gameConfig.table` |
| Stick speed / feel | `gameConfig.stick.slideSpeed`, `slideMode` |
| Pawn counts / bumpers | `gameConfig.players.player1.sticks` |
| Key bindings | `gameConfig.input.columns` |
| New entity | `src/game/entities/`, wire in `Game.ts` |
| New input system | `src/game/systems/`, instantiate in `Game.ts` |
| UI overlay | Svelte `+page.svelte` or new route |

## Verify changes

```bash
npm run build
```

## Cursor rules

File-specific guidance in `.cursor/rules/` — loaded automatically when matching files are edited.
