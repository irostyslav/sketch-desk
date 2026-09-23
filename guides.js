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
  "shop-block"(ctx, w, h) { shopParts(ctx, w, h, { block: true }); },
  "shop-openings"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true }); },
  "shop-detail"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true, detail: true }); },
  "shop-life"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true, detail: true, life: true }); },
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
