# Sketch Desk

A beginner’s drawing workbook you can keep open as a reference. Each chapter has a technique, a worked example, and a practice exercise. No account. Open `index.html`, or serve this folder with any static file server. Progress and kept pages stay on the device.

## How to use it

1. **Read** the chapter when you want the words.
2. **Watch** the pen build the drawing. Each mark has what the hand does, and why.
3. **Practice** the exercise. Show the example, hide it, then compare.

## Chapters

- **Foundations** — lines, curves, ellipses, hatching, mug & bottle
- **Trees** — skeleton, canopy clumps, core shadow, palm, a page of trees, wander
- **Street & facade** — shop house, one-point street, window rhythm, people for scale

Each step has a procedural ghost. Show me draws that ghost in order. Test yourself hides it; Compare puts it back over your ink. Ink stays when you change steps. Optional 3, 5, or 10 minute timer. Keep saves a thumbnail page on this device. Save PNG downloads it.

## Shortcuts

| Key | Action |
| --- | --- |
| `Z` | Undo |
| `Shift+Z` or `Ctrl+Y` | Redo |
| `P` | Pen |
| `B` | Pencil |
| `E` | Eraser |
| `G` | Toggle ghost guide |
| `[` `]` | Nib size |
| `Esc` | Close a page or the finish note |

## Run

```bash
python3 -m http.server 8080
```

Then open the site root. From a repo that vendors this folder, serve `public/sketch` the same way — paths inside `index.html` are relative.

## Credit

Tree and shop-house sequences follow the public method from Hariz Razif’s architectural sketch posts: structure, then masses, then value, then people. Fill a page follows the page-of-studies method associated with Mallery Jane. Ghost lines are generated here. They are not traced from those artists’ pictures, and this app is not their product.
