# Sketch Desk

A browser drawing studio for learning freehand sketching. Open `index.html` locally, or serve the folder with any static file server.

## Lessons

- **Foundations** — lines, curves, ellipses, hatching
- **Trees** — skeleton → canopy clumps → core shadow → scale figures → fill-a-page study (Mallery Jane)
- **Street & facade** — shop house blocking, Amsterdam canal row (Sofia / `@freeartist_sofi`), openings, detail, people for scale

Draw on top of a faint ghost guide. Turn the guide off when you want to test yourself. Progress and streak stay in `localStorage`.

## Shortcuts

| Key | Action |
| --- | --- |
| `Z` | Undo |
| `Shift+Z` | Redo |
| `P` | Pen |
| `E` | Eraser |
| `G` | Toggle ghost guide |
| `[` `]` | Nib size |

## Run

No build step.

```bash
# optional local server
python3 -m http.server 8080
```

Then open http://localhost:8080

Tree and shop-house sequences follow the public method from Hariz Razif’s architectural sketch posts. The fill-a-page tree study follows Mallery Jane’s public sketchbook exercise (Instagram reel Db5uA1ousaL). The canal-row lesson follows Sofia’s public “going a little bigger” Amsterdam ink sketch (Instagram reel DcocU4mIRIj / `@freeartist_sofi`). This app is a practice companion, not their product. Ghost guides are procedural — they do not copy anyone’s drawing.
