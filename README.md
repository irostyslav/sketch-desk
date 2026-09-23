# Sketch Desk

A browser drawing studio for learning freehand sketching. Open `index.html` locally, or serve the folder with any static file server.

## Lessons

- **Foundations** — lines, curves, ellipses, hatching
- **Trees** — skeleton → canopy clumps → core shadow → scale figures
- **Street & facade** — shop house blocking, openings, detail, people for scale

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

Tree and shop-house sequences follow the public method from Hariz Razif’s architectural sketch posts. This app is a practice companion, not his product.
