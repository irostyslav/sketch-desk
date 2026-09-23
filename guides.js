const GUIDES = {
  "warmup-lines"(ctx, w, h) {
    const y0 = h * 0.22;
    for (let i = 0; i < 6; i++) {
      const y = y0 + i * h * 0.1;
      strokeGuide(ctx, () => { ctx.moveTo(w * 0.12, y); ctx.lineTo(w * 0.88, y + (i % 2 === 0 ? 8 : -6)); }, 1.2);
    }
  },
  "warmup-curves"(ctx, w, h) {
    for (let i = 0; i < 5; i++) {
      const y = h * 0.2 + i * h * 0.14;
      strokeGuide(ctx, () => { ctx.moveTo(w * 0.12, y); ctx.quadraticCurveTo(w * 0.5, y - h * 0.12, w * 0.88, y); }, 1.3);
    }
  },
  "warmup-ellipses"(ctx, w, h) {
    const cx = w * 0.5;
    strokeGuide(ctx, () => {
      ctx.moveTo(cx, h * 0.12); ctx.lineTo(cx, h * 0.88);
      ctx.moveTo(cx - 70, h * 0.12); ctx.lineTo(cx - 40, h * 0.88);
      ctx.moveTo(cx + 70, h * 0.12); ctx.lineTo(cx + 40, h * 0.88);
    }, 0.8);
    [0.16, 0.28, 0.4, 0.55, 0.7, 0.82].forEach((t, i) => {
      const y = h * t;
      const rx = 70 - Math.abs(t - 0.5) * 60;
      strokeGuide(ctx, () => { ctx.ellipse(cx, y, rx, 16 + (i % 2) * 2, 0, 0, Math.PI * 2); }, 1.2);
    });
  },
  "value-bands"(ctx, w, h) {
    const boxW = w * 0.18, boxH = h * 0.55, y = h * 0.22, gap = w * 0.03, x0 = w * 0.1;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (boxW + gap);
      strokeGuide(ctx, () => ctx.rect(x, y, boxW, boxH), 1);
      const spacing = 16 - i * 3.5;
      strokeGuide(ctx, () => {
        for (let yy = y + 8; yy < y + boxH; yy += spacing) { ctx.moveTo(x + 6, yy); ctx.lineTo(x + boxW - 6, yy + 8); }
      }, 0.9);
    }
  },
  "value-cylinder"(ctx, w, h) {
    const cx = w * 0.5, cy = h * 0.5, rx = w * 0.16, ry = h * 0.32;
    strokeGuide(ctx, () => {
      ctx.ellipse(cx, cy - ry, rx, 28, 0, 0, Math.PI * 2);
      ctx.moveTo(cx - rx, cy - ry); ctx.lineTo(cx - rx, cy + ry);
      ctx.moveTo(cx + rx, cy - ry); ctx.lineTo(cx + rx, cy + ry);
      ctx.ellipse(cx, cy + ry, rx, 28, 0, 0, Math.PI * 2);
    }, 1.2);
    strokeGuide(ctx, () => {
      for (let i = 0; i < 18; i++) {
        const t = 0.35 + i * 0.03;
        const x = cx - rx + rx * 2 * t;
        ctx.moveTo(x, cy - ry + 10);
        ctx.quadraticCurveTo(x + 12, cy, x, cy + ry - 10);
      }
    }, 0.8);
    ctx.save(); ctx.fillStyle = "rgba(196, 92, 38, 0.7)"; ctx.beginPath(); ctx.arc(cx - rx - 40, cy - ry - 20, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  },
  "tree-trunk"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true }); },
  "tree-branches"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true }); },
  "tree-twigs"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, twigs: true }); },
  "tree-masses"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, masses: true }); },
  "tree-scribble"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, masses: true, scribble: true }); },
  "tree-sun"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, scribble: true, sun: true }); },
  "tree-core"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, scribble: true, sun: true, core: true }); },
  "tree-finish"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, scribble: true, sun: true, core: true, finish: true }); },
  wander(ctx, w, h) {
    strokeGuide(ctx, () => {
      let x = w * 0.2, y = h * 0.7; ctx.moveTo(x, y);
      for (let i = 0; i < 40; i++) { x += Math.sin(i * 0.7) * 28 + 6; y += Math.cos(i * 0.45) * 22 - 8; ctx.lineTo(x, y); }
    }, 1);
  },
  "tree-page-shapes"(ctx, w, h) { treePage(ctx, w, h, { shapes: true }); },
  "tree-page-mid"(ctx, w, h) { treePage(ctx, w, h, { shapes: true, mid: true }); },
  "tree-page-darks"(ctx, w, h) { treePage(ctx, w, h, { shapes: true, mid: true, darks: true }); },
  "shop-block"(ctx, w, h) { shopParts(ctx, w, h, { block: true }); },
  "shop-openings"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true }); },
  "shop-detail"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true, detail: true }); },
  "shop-life"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true, detail: true, life: true }); },
  "amsterdam-block"(ctx, w, h) { amsterdamParts(ctx, w, h, { block: true }); },
  "amsterdam-windows"(ctx, w, h) { amsterdamParts(ctx, w, h, { block: true, windows: true }); },
  "amsterdam-ink"(ctx, w, h) { amsterdamParts(ctx, w, h, { block: true, windows: true, ink: true }); },
  figures(ctx, w, h) {
    [0.55, 0.42, 0.32, 0.48].forEach((s, i) => drawFigure(ctx, w * (0.18 + i * 0.2), h * 0.78, h * s));
  }
};

function strokeGuide(ctx, draw, width) {
  ctx.save();
  ctx.strokeStyle = "rgba(90, 78, 64, 0.38)";
  ctx.lineWidth = width;
  ctx.beginPath();
  draw();
  ctx.stroke();
  ctx.restore();
}

function treeParts(ctx, w, h, o) {
  const baseX = w * 0.5, ground = h * 0.82, top = h * 0.16;
  if (o.sun) { ctx.save(); ctx.fillStyle = "rgba(196, 92, 38, 0.75)"; ctx.beginPath(); ctx.arc(w * 0.16, h * 0.14, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  if (o.trunk) {
    strokeGuide(ctx, () => {
      ctx.moveTo(baseX - 16, ground); ctx.quadraticCurveTo(baseX - 8, (ground + top) / 2, baseX - 5, h * 0.42);
      ctx.moveTo(baseX + 18, ground); ctx.quadraticCurveTo(baseX + 9, (ground + top) / 2, baseX + 6, h * 0.42);
    }, 1.6);
  }
  if (o.branches) {
    strokeGuide(ctx, () => {
      [[baseX - 4, h * 0.44, baseX - 90, h * 0.28],[baseX + 4, h * 0.42, baseX + 110, h * 0.3],[baseX, h * 0.4, baseX - 20, h * 0.18],[baseX + 2, h * 0.38, baseX + 55, h * 0.2],[baseX - 2, h * 0.5, baseX - 70, h * 0.4],[baseX + 3, h * 0.52, baseX + 80, h * 0.44]].forEach(([x1, y1, x2, y2]) => {
        ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 20, x2, y2);
      });
    }, 1.2);
  }
  if (o.twigs) {
    strokeGuide(ctx, () => {
      [[baseX - 90, h * 0.28],[baseX + 110, h * 0.3],[baseX - 20, h * 0.18],[baseX + 55, h * 0.2],[baseX - 70, h * 0.4],[baseX + 80, h * 0.44]].forEach(([x, y], i) => {
        ctx.moveTo(x, y); ctx.lineTo(x + (i % 2 ? 18 : -16), y - 22);
        ctx.moveTo(x, y); ctx.lineTo(x + (i % 2 ? -12 : 14), y - 14);
      });
    }, 0.9);
  }
  if (o.masses) {
    strokeGuide(ctx, () => {
      [[baseX - 10, h * 0.26, 70, 46],[baseX + 55, h * 0.3, 60, 40],[baseX - 70, h * 0.34, 58, 38],[baseX + 10, h * 0.2, 48, 32],[baseX - 40, h * 0.42, 44, 28]].forEach(([x, y, rx, ry]) => ctx.ellipse(x, y, rx, ry, -0.2, 0, Math.PI * 2));
    }, 1);
  }
  if (o.scribble) {
    strokeGuide(ctx, () => {
      [[baseX - 10, h * 0.26, 72],[baseX + 55, h * 0.3, 62],[baseX - 70, h * 0.34, 58],[baseX + 10, h * 0.2, 50]].forEach(([cx, cy, r]) => {
        for (let i = 0; i < 22; i++) {
          const a = (i / 22) * Math.PI * 2, rr = r * (0.78 + (i % 3) * 0.08);
          ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7);
          ctx.quadraticCurveTo(cx + Math.cos(a + 0.2) * (rr + 8), cy + Math.sin(a + 0.2) * (rr * 0.7 + 6), cx + Math.cos(a + 0.35) * rr, cy + Math.sin(a + 0.35) * rr * 0.7);
        }
      });
    }, 0.8);
  }
  if (o.core) {
    strokeGuide(ctx, () => {
      for (let i = 0; i < 28; i++) { const x = baseX + 8 + (i % 7) * 8, y1 = h * 0.24 + (i % 5) * 10; ctx.moveTo(x, y1); ctx.lineTo(x + 14, y1 + 18); }
      for (let i = 0; i < 10; i++) { ctx.moveTo(baseX + 4, h * 0.46 + i * 8); ctx.lineTo(baseX + 16, h * 0.5 + i * 8); }
    }, 0.9);
  }
  if (o.finish) {
    strokeGuide(ctx, () => { ctx.moveTo(w * 0.12, ground); ctx.lineTo(w * 0.88, ground); ctx.moveTo(baseX + 20, ground); ctx.quadraticCurveTo(baseX + 80, ground + 6, baseX + 130, ground); }, 1);
    drawFigure(ctx, baseX + 70, ground, 46);
    drawFigure(ctx, baseX + 92, ground, 40);
  }
}

function treePage(ctx, w, h, o) {
  const trees = [
    { x: 0.16, g: 0.46, s: 0.28, kind: "round" },
    { x: 0.38, g: 0.48, s: 0.34, kind: "tall" },
    { x: 0.60, g: 0.45, s: 0.24, kind: "round" },
    { x: 0.82, g: 0.47, s: 0.30, kind: "pine" },
    { x: 0.24, g: 0.84, s: 0.26, kind: "pine" },
    { x: 0.48, g: 0.86, s: 0.32, kind: "round" },
    { x: 0.70, g: 0.83, s: 0.22, kind: "tall" },
    { x: 0.88, g: 0.85, s: 0.20, kind: "round" },
  ];
  ctx.save(); ctx.fillStyle = "rgba(196, 92, 38, 0.75)"; ctx.beginPath(); ctx.arc(w * 0.08, h * 0.10, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  trees.forEach((t) => {
    const x = w * t.x, ground = h * t.g, height = h * t.s, top = ground - height, trunkW = Math.max(3, height * 0.06);
    if (o.shapes) {
      strokeGuide(ctx, () => {
        ctx.moveTo(x - trunkW, ground); ctx.lineTo(x - trunkW * 0.45, ground - height * 0.38);
        ctx.moveTo(x + trunkW, ground); ctx.lineTo(x + trunkW * 0.45, ground - height * 0.38);
        if (t.kind === "pine") {
          ctx.moveTo(x, top); ctx.lineTo(x + height * 0.22, ground - height * 0.22); ctx.lineTo(x - height * 0.22, ground - height * 0.22); ctx.closePath();
          ctx.moveTo(x, top + height * 0.22); ctx.lineTo(x + height * 0.28, ground - height * 0.02); ctx.lineTo(x - height * 0.28, ground - height * 0.02); ctx.closePath();
        } else if (t.kind === "tall") {
          ctx.ellipse(x, top + height * 0.28, height * 0.16, height * 0.32, 0, 0, Math.PI * 2);
        } else {
          ctx.ellipse(x - height * 0.04, top + height * 0.28, height * 0.22, height * 0.22, -0.2, 0, Math.PI * 2);
          ctx.ellipse(x + height * 0.12, top + height * 0.36, height * 0.16, height * 0.16, 0.3, 0, Math.PI * 2);
        }
      }, 1);
    }
    if (o.mid) {
      strokeGuide(ctx, () => {
        for (let i = 0; i < 7; i++) {
          const yy = top + height * 0.22 + i * (height * 0.06);
          ctx.moveTo(x + 2, yy); ctx.lineTo(x + height * 0.16, yy + 6);
        }
      }, 0.7);
    }
    if (o.darks) {
      strokeGuide(ctx, () => {
        for (let i = 0; i < 4; i++) { ctx.moveTo(x + 4, top + height * 0.3 + i * 5); ctx.lineTo(x + 12, top + height * 0.36 + i * 5); }
        ctx.moveTo(x + trunkW * 0.2, ground - height * 0.3); ctx.lineTo(x + trunkW, ground - 2);
        ctx.moveTo(x + 4, ground); ctx.quadraticCurveTo(x + 18, ground + 4, x + 28, ground);
      }, 0.9);
    }
  });
}

function shopParts(ctx, w, h, o) {
  const x = w * 0.22, y = h * 0.18, fw = w * 0.56, fh = h * 0.6, ground = y + fh;
  if (o.block) {
    strokeGuide(ctx, () => {
      ctx.rect(x, y + 28, fw, fh - 28);
      ctx.moveTo(x - 10, y + 28); ctx.lineTo(x + fw + 10, y + 28); ctx.lineTo(x + fw + 4, y + 16); ctx.lineTo(x - 4, y + 16); ctx.closePath();
      ctx.moveTo(w * 0.1, ground); ctx.lineTo(w * 0.9, ground);
    }, 1.4);
  }
  if (o.openings) {
    strokeGuide(ctx, () => {
      ctx.moveTo(x, y + fh * 0.55); ctx.lineTo(x + fw, y + fh * 0.55);
      const doorW = fw * 0.22, doorH = fh * 0.38, dx = x + fw * 0.14;
      ctx.rect(dx, ground - doorH, doorW, doorH);
      const winW = fw * 0.16, winH = fh * 0.18;
      [0.42, 0.64].forEach((t) => { ctx.rect(x + fw * t, y + 48, winW, winH); ctx.rect(x + fw * t, y + fh * 0.58, winW, winH * 0.85); });
    }, 1.1);
  }
  if (o.detail) {
    strokeGuide(ctx, () => {
      for (let i = 0; i < 14; i++) { ctx.moveTo(x - 4 + i * (fw / 12), y + 16); ctx.lineTo(x + i * (fw / 12), y + 28); }
      const dx = x + fw * 0.14, doorH = fh * 0.38;
      for (let i = 0; i < 5; i++) { ctx.moveTo(dx + 6 + i * 8, ground - doorH + 8); ctx.lineTo(dx + 6 + i * 8, ground - 8); }
    }, 0.8);
  }
  if (o.life) {
    drawFigure(ctx, x + fw + 36, ground, 52);
    strokeGuide(ctx, () => { ctx.moveTo(x + fw * 0.14, ground); ctx.quadraticCurveTo(x + fw * 0.3, ground + 10, x + fw * 0.5, ground); }, 1);
  }
}

function amsterdamParts(ctx, w, h, o) {
  const quay = h * 0.70;
  const houses = [
    { x: 0.06, bw: 0.16, hh: 0.46, gable: "step", lean: 0.012 },
    { x: 0.22, bw: 0.18, hh: 0.54, gable: "bell", lean: -0.016 },
    { x: 0.40, bw: 0.17, hh: 0.50, gable: "neck", lean: 0.008 },
    { x: 0.57, bw: 0.15, hh: 0.42, gable: "step", lean: -0.01 },
    { x: 0.72, bw: 0.18, hh: 0.52, gable: "bell", lean: 0.014 },
  ];
  if (o.block) {
    strokeGuide(ctx, () => {
      ctx.moveTo(w * 0.03, quay); ctx.lineTo(w * 0.97, quay);
      ctx.moveTo(w * 0.03, h * 0.92); ctx.quadraticCurveTo(w * 0.5, h * 0.96, w * 0.97, h * 0.91);
    }, 1.3);
    houses.forEach((house) => {
      const x = w * house.x, bw = w * house.bw, top = quay - h * house.hh, lean = bw * house.lean * 8;
      strokeGuide(ctx, () => {
        ctx.moveTo(x, quay); ctx.lineTo(x + lean, top + h * 0.08); ctx.lineTo(x + bw + lean, top + h * 0.08); ctx.lineTo(x + bw, quay);
        if (house.gable === "step") {
          let sx = x + lean, sy = top + h * 0.08, mid = x + bw / 2 + lean;
          for (let i = 0; i < 3; i++) {
            const rise = h * 0.022, run = (mid - sx) / (3 - i + 0.2);
            ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - rise); ctx.lineTo(sx + run, sy - rise);
            sx += run; sy -= rise;
          }
          ctx.lineTo(mid, top);
          sx = x + bw + lean; sy = top + h * 0.08;
          for (let i = 0; i < 3; i++) {
            const rise = h * 0.022, run = (sx - mid) / (3 - i + 0.2);
            ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - rise); ctx.lineTo(sx - run, sy - rise);
            sx -= run; sy -= rise;
          }
        } else if (house.gable === "neck") {
          const mid = x + bw / 2 + lean;
          ctx.moveTo(x + lean + bw * 0.22, top + h * 0.08);
          ctx.lineTo(x + lean + bw * 0.28, top + h * 0.02);
          ctx.lineTo(mid - bw * 0.08, top + h * 0.02);
          ctx.lineTo(mid - bw * 0.06, top);
          ctx.lineTo(mid + bw * 0.06, top);
          ctx.lineTo(mid + bw * 0.08, top + h * 0.02);
          ctx.lineTo(x + lean + bw * 0.72, top + h * 0.02);
          ctx.lineTo(x + lean + bw * 0.78, top + h * 0.08);
        } else {
          const mid = x + bw / 2 + lean;
          ctx.moveTo(x + lean, top + h * 0.08);
          ctx.quadraticCurveTo(mid - bw * 0.18, top - h * 0.01, mid, top);
          ctx.quadraticCurveTo(mid + bw * 0.18, top - h * 0.01, x + bw + lean, top + h * 0.08);
        }
      }, 1.25);
    });
  }
  if (o.windows) {
    houses.forEach((house) => {
      const x = w * house.x, bw = w * house.bw, top = quay - h * house.hh, lean = bw * house.lean * 8;
      const cols = house.bw > 0.16 ? 3 : 2, marginX = bw * 0.14;
      const winW = (bw - marginX * 2) / cols - bw * 0.04, winH = h * 0.07;
      strokeGuide(ctx, () => {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < cols; c++) {
            const wx = x + marginX + c * ((bw - marginX * 2) / cols) + lean * (0.7 - r * 0.15);
            const wy = top + h * 0.12 + r * (h * 0.11);
            ctx.rect(wx, wy, winW, winH);
            ctx.moveTo(wx + winW / 2, wy); ctx.lineTo(wx + winW / 2, wy + winH);
          }
        }
        const doorW = bw * 0.28, doorH = h * 0.12, dx = x + bw * 0.36;
        ctx.rect(dx, quay - doorH, doorW, doorH);
        ctx.moveTo(dx + doorW / 2, quay - doorH); ctx.lineTo(dx + doorW / 2, quay);
      }, 0.95);
    });
  }
  if (o.ink) {
    houses.forEach((house, i) => {
      const x = w * house.x, bw = w * house.bw, doorW = bw * 0.28, doorH = h * 0.12, dx = x + bw * 0.36;
      if (i % 2 === 0) {
        strokeGuide(ctx, () => {
          for (let k = 0; k < 8; k++) {
            ctx.moveTo(dx + 3, quay - doorH + 4 + k * (doorH / 9));
            ctx.lineTo(dx + doorW - 3, quay - doorH + 8 + k * (doorH / 9));
          }
        }, 0.8);
      }
    });
    strokeGuide(ctx, () => {
      houses.forEach((house) => {
        const x = w * house.x, bw = w * house.bw, top = quay - h * house.hh;
        for (let i = 0; i < 5; i++) {
          ctx.moveTo(x + bw * 0.2 + i * 6, quay + 8);
          ctx.lineTo(x + bw * 0.15 + i * 6, quay + 8 + (quay - top) * 0.18);
        }
      });
    }, 0.7);
    drawFigure(ctx, w * 0.34, quay, 42);
    drawFigure(ctx, w * 0.63, quay, 36);
    strokeGuide(ctx, () => {
      const bx = w * 0.48, by = quay;
      ctx.ellipse(bx - 16, by - 6, 7, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(bx + 14, by - 6, 7, 7, 0, 0, Math.PI * 2);
      ctx.moveTo(bx - 16, by - 6); ctx.lineTo(bx + 14, by - 6);
      ctx.moveTo(bx - 4, by - 6); ctx.lineTo(bx - 2, by - 18); ctx.lineTo(bx + 8, by - 16);
    }, 1);
  }
}

function drawFigure(ctx, x, ground, height) {
  const s = height / 50;
  strokeGuide(ctx, () => {
    ctx.ellipse(x, ground - height + 5 * s, 4 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.moveTo(x - 8 * s, ground - height + 14 * s);
    ctx.lineTo(x + 8 * s, ground - height + 14 * s);
    ctx.lineTo(x + 6 * s, ground - height + 32 * s);
    ctx.lineTo(x - 6 * s, ground - height + 32 * s);
    ctx.closePath();
    ctx.moveTo(x - 3 * s, ground - height + 32 * s); ctx.lineTo(x - 5 * s, ground);
    ctx.moveTo(x + 3 * s, ground - height + 32 * s); ctx.lineTo(x + 5 * s, ground);
  }, 1.1);
}
