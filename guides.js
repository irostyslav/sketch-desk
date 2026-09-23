const GUIDES = {
  "warmup-lines"(ctx, w, h) {
    const y0 = h * 0.22;
    for (let i = 0; i < 6; i++) {
      const y = y0 + i * h * 0.1;
      strokeGuide(ctx, () => {
        ctx.moveTo(w * 0.12, y);
        ctx.lineTo(w * 0.88, y + (i % 2 === 0 ? h * 0.012 : -h * 0.01));
      }, 1.2);
    }
  },
  "warmup-curves"(ctx, w, h) {
    for (let i = 0; i < 5; i++) {
      const y = h * 0.22 + i * h * 0.14;
      strokeGuide(ctx, () => {
        ctx.moveTo(w * 0.12, y);
        ctx.quadraticCurveTo(w * 0.5, y - h * 0.1, w * 0.88, y);
      }, 1.3);
    }
  },
  "warmup-ellipses"(ctx, w, h) {
    const cx = w * 0.5;
    const spread = Math.min(w, h) * 0.1;
    strokeGuide(ctx, () => {
      ctx.moveTo(cx, h * 0.12);
      ctx.lineTo(cx, h * 0.88);
      ctx.moveTo(cx - spread, h * 0.12);
      ctx.lineTo(cx - spread * 0.55, h * 0.88);
      ctx.moveTo(cx + spread, h * 0.12);
      ctx.lineTo(cx + spread * 0.55, h * 0.88);
    }, 0.8);
    [0.18, 0.3, 0.42, 0.55, 0.68, 0.8].forEach((t, i) => {
      const y = h * t;
      const rx = spread * (1.05 - Math.abs(t - 0.5) * 0.7);
      const ry = Math.min(w, h) * (0.02 + (i % 2) * 0.004);
      strokeGuide(ctx, () => {
        ctx.ellipse(cx, y, Math.max(8, rx), Math.max(6, ry), 0, 0, Math.PI * 2);
      }, 1.2);
    });
  },
  "value-bands"(ctx, w, h) {
    const boxW = w * 0.18;
    const boxH = h * 0.55;
    const y = h * 0.22;
    const gap = w * 0.03;
    const x0 = w * 0.08;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (boxW + gap);
      strokeGuide(ctx, () => ctx.rect(x, y, boxW, boxH), 1);
      const spacing = Math.max(4, boxH * (0.09 - i * 0.018));
      strokeGuide(ctx, () => {
        for (let yy = y + spacing; yy < y + boxH - 4; yy += spacing) {
          ctx.moveTo(x + boxW * 0.08, yy);
          ctx.lineTo(x + boxW * 0.92, yy + spacing * 0.35);
        }
      }, 0.9);
    }
  },
  "cross-hatch"(ctx, w, h) {
    const boxW = w * 0.18;
    const boxH = h * 0.55;
    const y = h * 0.22;
    const gap = w * 0.03;
    const x0 = w * 0.08;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (boxW + gap);
      strokeGuide(ctx, () => ctx.rect(x, y, boxW, boxH), 1);
      const spacing = Math.max(3.5, boxH * (0.07 - i * 0.012));
      strokeGuide(ctx, () => {
        for (let yy = y + spacing; yy < y + boxH - 4; yy += spacing) {
          ctx.moveTo(x + boxW * 0.08, yy);
          ctx.lineTo(x + boxW * 0.92, yy + spacing * 0.25);
        }
      }, 0.85);
      if (i === 0) continue;
      const cross = Math.max(4, spacing * (1.15 - i * 0.12));
      strokeGuide(ctx, () => {
        for (let xx = x + cross; xx < x + boxW - 4; xx += cross) {
          ctx.moveTo(xx, y + boxH * 0.08);
          ctx.lineTo(xx + cross * 0.35, y + boxH * 0.92);
        }
      }, 0.75);
    }
  },
  "value-cylinder"(ctx, w, h) {
    const cx = w * 0.52;
    const cy = h * 0.5;
    const rx = w * 0.16;
    const ry = h * 0.28;
    const cap = Math.min(h * 0.04, rx * 0.35);
    strokeGuide(ctx, () => {
      ctx.ellipse(cx, cy - ry, rx, cap, 0, 0, Math.PI * 2);
      ctx.moveTo(cx - rx, cy - ry);
      ctx.lineTo(cx - rx, cy + ry);
      ctx.moveTo(cx + rx, cy - ry);
      ctx.lineTo(cx + rx, cy + ry);
      ctx.ellipse(cx, cy + ry, rx, cap, 0, 0, Math.PI * 2);
    }, 1.2);
    strokeGuide(ctx, () => {
      for (let i = 0; i < 14; i++) {
        const t = 0.42 + i * 0.035;
        const x = cx - rx + rx * 2 * t;
        ctx.moveTo(x, cy - ry + cap);
        ctx.quadraticCurveTo(x + rx * 0.12, cy, x, cy + ry - cap);
      }
    }, 0.8);
    dot(ctx, cx - rx - Math.min(w, h) * 0.05, cy - ry - h * 0.04);
  },
  "vessel-ellipses"(ctx, w, h) { vessels(ctx, w, h, { ellipses: true }); },
  "vessel-profiles"(ctx, w, h) { vessels(ctx, w, h, { ellipses: true, profiles: true }); },
  "vessel-value"(ctx, w, h) { vessels(ctx, w, h, { ellipses: true, profiles: true, value: true }); },
  "tree-trunk"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true }); },
  "tree-branches"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true }); },
  "tree-twigs"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, twigs: true }); },
  "tree-masses"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, masses: true }); },
  "tree-scribble"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, masses: true, scribble: true }); },
  "tree-sun"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, scribble: true, sun: true }); },
  "tree-core"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, scribble: true, sun: true, core: true }); },
  "tree-finish"(ctx, w, h) { treeParts(ctx, w, h, { trunk: true, branches: true, scribble: true, sun: true, core: true, finish: true }); },
  "palm-trunk"(ctx, w, h) { palmParts(ctx, w, h, { trunk: true }); },
  "palm-spines"(ctx, w, h) { palmParts(ctx, w, h, { trunk: true, spines: true }); },
  "palm-leaflets"(ctx, w, h) { palmParts(ctx, w, h, { trunk: true, spines: true, leaflets: true }); },
  "palm-finish"(ctx, w, h) { palmParts(ctx, w, h, { trunk: true, spines: true, leaflets: true, finish: true }); },
  "grid-boxes"(ctx, w, h) { pageOfTrees(ctx, w, h, "boxes"); },
  "grid-skeletons"(ctx, w, h) { pageOfTrees(ctx, w, h, "skeletons"); },
  "grid-value"(ctx, w, h) { pageOfTrees(ctx, w, h, "value"); },
  wander(ctx, w, h) {
    strokeGuide(ctx, () => {
      let x = w * 0.16;
      let y = h * 0.7;
      ctx.moveTo(x, y);
      for (let i = 0; i < 42; i++) {
        x += Math.sin(i * 0.7) * w * 0.035 + w * 0.012;
        y += Math.cos(i * 0.45) * h * 0.04 - h * 0.012;
        x = Math.max(w * 0.08, Math.min(w * 0.92, x));
        y = Math.max(h * 0.12, Math.min(h * 0.88, y));
        ctx.lineTo(x, y);
      }
    }, 1);
  },
  "shop-block"(ctx, w, h) { shopParts(ctx, w, h, { block: true }); },
  "shop-openings"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true }); },
  "shop-detail"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true, detail: true }); },
  "shop-life"(ctx, w, h) { shopParts(ctx, w, h, { block: true, openings: true, detail: true, life: true }); },
  "street-vp"(ctx, w, h) { streetParts(ctx, w, h, 1); },
  "street-masses"(ctx, w, h) { streetParts(ctx, w, h, 2); },
  "street-life"(ctx, w, h) { streetParts(ctx, w, h, 3); },
  "windows-lines"(ctx, w, h) { windowParts(ctx, w, h, 1); },
  "windows-rhythm"(ctx, w, h) { windowParts(ctx, w, h, 2); },
  "windows-shadow"(ctx, w, h) { windowParts(ctx, w, h, 3); },
  figures(ctx, w, h) {
    [0.62, 0.48, 0.36, 0.52].forEach((s, i) => drawFigure(ctx, w * (0.18 + i * 0.2), h * 0.8, h * s * 0.42));
  }
};

function strokeGuide(ctx, draw, width) {
  ctx.save();
  ctx.strokeStyle = "rgba(90, 78, 64, 0.55)";
  ctx.lineWidth = width;
  ctx.beginPath();
  draw();
  ctx.stroke();
  ctx.restore();
}

function dot(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(196, 92, 38, 0.8)";
  ctx.beginPath();
  ctx.arc(x, y, Math.max(4, Math.min(x, y) * 0.02 + 3), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function treeParts(ctx, w, h, o) {
  const u = Math.min(w, h) / 780;
  const baseX = w * 0.5;
  const ground = h * 0.82;
  if (o.sun) dot(ctx, w * 0.16, h * 0.14);
  if (o.trunk) {
    strokeGuide(ctx, () => {
      ctx.moveTo(baseX - 18 * u, ground);
      ctx.quadraticCurveTo(baseX - 8 * u, h * 0.62, baseX - 5 * u, h * 0.42);
      ctx.moveTo(baseX + 20 * u, ground);
      ctx.quadraticCurveTo(baseX + 10 * u, h * 0.64, baseX + 6 * u, h * 0.42);
    }, 1.6);
  }
  const limbs = [
    [baseX - 4 * u, h * 0.44, baseX - w * 0.16, h * 0.28],
    [baseX + 4 * u, h * 0.42, baseX + w * 0.2, h * 0.3],
    [baseX, h * 0.4, baseX - w * 0.04, h * 0.18],
    [baseX + 2 * u, h * 0.38, baseX + w * 0.1, h * 0.2],
    [baseX - 2 * u, h * 0.5, baseX - w * 0.14, h * 0.4],
    [baseX + 3 * u, h * 0.52, baseX + w * 0.16, h * 0.44]
  ];
  if (o.branches) {
    strokeGuide(ctx, () => {
      limbs.forEach(([x1, y1, x2, y2]) => {
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 18 * u, x2, y2);
      });
    }, 1.2);
  }
  if (o.twigs) {
    strokeGuide(ctx, () => {
      limbs.forEach(([, , x, y], i) => {
        ctx.moveTo(x, y);
        ctx.lineTo(x + (i % 2 ? 18 : -16) * u, y - 22 * u);
        ctx.moveTo(x, y);
        ctx.lineTo(x + (i % 2 ? -12 : 14) * u, y - 14 * u);
      });
    }, 0.9);
  }
  const masses = [
    [baseX - w * 0.02, h * 0.26, w * 0.1, h * 0.07],
    [baseX + w * 0.08, h * 0.3, w * 0.09, h * 0.06],
    [baseX - w * 0.1, h * 0.34, w * 0.085, h * 0.055],
    [baseX + w * 0.015, h * 0.2, w * 0.07, h * 0.048],
    [baseX - w * 0.06, h * 0.42, w * 0.065, h * 0.04]
  ];
  if (o.masses) {
    strokeGuide(ctx, () => {
      masses.forEach(([x, y, rx, ry]) => ctx.ellipse(x, y, rx, ry, -0.2, 0, Math.PI * 2));
    }, 1);
  }
  if (o.scribble) {
    strokeGuide(ctx, () => {
      masses.slice(0, 4).forEach(([cx, cy, rx]) => {
        const r = rx;
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          const rr = r * (0.78 + (i % 3) * 0.08);
          ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.62);
          ctx.quadraticCurveTo(
            cx + Math.cos(a + 0.2) * (rr + 8 * u),
            cy + Math.sin(a + 0.2) * (rr * 0.62 + 6 * u),
            cx + Math.cos(a + 0.35) * rr,
            cy + Math.sin(a + 0.35) * rr * 0.62
          );
        }
      });
    }, 0.8);
  }
  if (o.core) {
    strokeGuide(ctx, () => {
      for (let i = 0; i < 24; i++) {
        const x = baseX + 6 * u + (i % 6) * 9 * u;
        const y1 = h * 0.24 + (i % 5) * 10 * u;
        ctx.moveTo(x, y1);
        ctx.lineTo(x + 14 * u, y1 + 16 * u);
      }
      for (let i = 0; i < 8; i++) {
        ctx.moveTo(baseX + 2 * u, h * 0.46 + i * 8 * u);
        ctx.lineTo(baseX + 16 * u, h * 0.5 + i * 8 * u);
      }
    }, 0.9);
  }
  if (o.finish) {
    strokeGuide(ctx, () => {
      ctx.moveTo(w * 0.1, ground);
      ctx.lineTo(w * 0.9, ground);
      ctx.moveTo(baseX + 16 * u, ground);
      ctx.quadraticCurveTo(baseX + w * 0.1, ground + 8 * u, baseX + w * 0.2, ground);
    }, 1);
    drawFigure(ctx, baseX + w * 0.12, ground, h * 0.1);
    drawFigure(ctx, baseX + w * 0.16, ground, h * 0.085);
  }
}

function palmFrondEnds(cx, crown, s) {
  return [
    [-0.4, 0.02],
    [-0.28, -0.12],
    [-0.12, -0.22],
    [0.02, -0.26],
    [0.16, -0.2],
    [0.32, -0.06],
    [0.38, 0.08],
    [-0.2, 0.1]
  ].map(([dx, dy]) => [cx + dx * s, crown + dy * s]);
}

function palmParts(ctx, w, h, o) {
  const s = Math.min(w, h);
  const cx = w * 0.5 + s * 0.02;
  const ground = h * 0.84;
  const crown = h * 0.46;
  if (o.trunk) {
    strokeGuide(ctx, () => {
      ctx.moveTo(cx - s * 0.028, ground);
      ctx.quadraticCurveTo(cx - s * 0.05, h * 0.66, cx - s * 0.012, crown);
      ctx.moveTo(cx + s * 0.034, ground);
      ctx.quadraticCurveTo(cx + s * 0.012, h * 0.68, cx + s * 0.016, crown);
      for (let i = 0; i < 7; i++) {
        const y = ground - ((i + 1) / 8) * (ground - crown);
        const half = s * (0.026 - i * 0.0015);
        ctx.moveTo(cx - half, y);
        ctx.quadraticCurveTo(cx + s * 0.004, y + s * 0.01, cx + half, y - s * 0.004);
      }
    }, 1.4);
  }
  const tips = palmFrondEnds(cx, crown, s);
  if (o.spines) {
    strokeGuide(ctx, () => {
      tips.forEach(([x2, y2]) => {
        ctx.moveTo(cx, crown);
        ctx.quadraticCurveTo((cx + x2) / 2, (crown + y2) / 2 - s * 0.03, x2, y2);
      });
    }, 1.15);
  }
  if (o.leaflets) {
    strokeGuide(ctx, () => {
      tips.forEach(([x2, y2]) => {
        for (let i = 1; i <= 5; i++) {
          const t = i / 6;
          const x = cx + (x2 - cx) * t;
          const y = crown + (y2 - crown) * t;
          const ang = Math.atan2(y2 - crown, x2 - cx) + Math.PI / 2;
          const len = s * 0.04 * (1.15 - t);
          ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len);
          ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        }
      });
    }, 0.75);
  }
  if (o.finish) {
    dot(ctx, w * 0.16, h * 0.14);
    strokeGuide(ctx, () => {
      for (let i = 0; i < 10; i++) {
        ctx.moveTo(cx - s * 0.02, crown + i * s * 0.012);
        ctx.lineTo(cx + s * 0.05, crown + s * 0.03 + i * s * 0.012);
      }
      ctx.moveTo(w * 0.12, ground);
      ctx.lineTo(w * 0.88, ground);
      ctx.moveTo(cx + s * 0.02, ground);
      ctx.quadraticCurveTo(cx + s * 0.12, ground + s * 0.02, cx + s * 0.22, ground);
    }, 0.9);
  }
}

function pageOfTrees(ctx, w, h, mode) {
  const cols = 3;
  const rows = 2;
  const padX = w * 0.06;
  const padY = h * 0.08;
  const cw = (w - padX * 2) / cols;
  const ch = (h - padY * 2) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * cw;
      const y = padY + r * ch;
      const n = r * cols + c;
      strokeGuide(ctx, () => {
        ctx.rect(x + cw * 0.06, y + ch * 0.06, cw * 0.88, ch * 0.88);
      }, 0.7);
      if (mode === "boxes") continue;
      miniTree(ctx, x, y, cw, ch, n, mode === "value" && n % 2 === 0);
    }
  }
  if (mode === "value") dot(ctx, w * 0.08, h * 0.06);
}

function miniTree(ctx, x, y, cw, ch, n, shade) {
  const cx = x + cw * (0.42 + (n % 3) * 0.06);
  const ground = y + ch * 0.82;
  const top = y + ch * (0.22 + (n % 2) * 0.06);
  const lean = ((n % 5) - 2) * cw * 0.03;
  strokeGuide(ctx, () => {
    ctx.moveTo(cx - cw * 0.04, ground);
    ctx.quadraticCurveTo(cx - cw * 0.02 + lean, (ground + top) / 2, cx + lean, top + ch * 0.12);
    ctx.moveTo(cx + cw * 0.05, ground);
    ctx.quadraticCurveTo(cx + cw * 0.02 + lean, (ground + top) / 2, cx + cw * 0.015 + lean, top + ch * 0.12);
    const forks = [
      [top + ch * 0.16, -cw * 0.22, -ch * 0.08],
      [top + ch * 0.14, cw * 0.2, -ch * 0.1],
      [top + ch * 0.2, cw * 0.02, -ch * 0.16]
    ];
    forks.forEach(([y1, dx, dy], i) => {
      if (n % 2 === 1 && i === 2) return;
      ctx.moveTo(cx + lean, y1);
      ctx.quadraticCurveTo(cx + dx * 0.4, y1 + dy * 0.2, cx + dx + lean, y1 + dy);
    });
  }, 1);
  if (!shade) return;
  strokeGuide(ctx, () => {
    const hx = cx + cw * 0.04 + lean;
    const hy = top + ch * 0.02;
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(hx, hy + i * ch * 0.035);
      ctx.lineTo(hx + cw * 0.12, hy + ch * 0.05 + i * ch * 0.035);
    }
  }, 0.8);
}

function shopParts(ctx, w, h, o) {
  const x = w * 0.2;
  const y = h * 0.16;
  const fw = w * 0.56;
  const fh = h * 0.62;
  const ground = y + fh;
  const u = Math.min(w, h) / 780;
  if (o.block) {
    strokeGuide(ctx, () => {
      ctx.rect(x, y + h * 0.045, fw, fh - h * 0.045);
      ctx.moveTo(x - fw * 0.03, y + h * 0.045);
      ctx.lineTo(x + fw + fw * 0.03, y + h * 0.045);
      ctx.lineTo(x + fw + fw * 0.01, y + h * 0.02);
      ctx.lineTo(x - fw * 0.01, y + h * 0.02);
      ctx.closePath();
      ctx.moveTo(w * 0.08, ground);
      ctx.lineTo(w * 0.92, ground);
    }, 1.4);
  }
  if (o.openings) {
    strokeGuide(ctx, () => {
      ctx.moveTo(x, y + fh * 0.52);
      ctx.lineTo(x + fw, y + fh * 0.52);
      const doorW = fw * 0.2;
      const doorH = fh * 0.38;
      const dx = x + fw * 0.16;
      ctx.rect(dx, ground - doorH, doorW, doorH);
      const winW = fw * 0.16;
      const winH = fh * 0.16;
      [0.46, 0.68].forEach((t) => {
        ctx.rect(x + fw * t, y + h * 0.08, winW, winH);
        ctx.rect(x + fw * t, y + fh * 0.58, winW, winH * 0.85);
      });
    }, 1.1);
  }
  if (o.detail) {
    strokeGuide(ctx, () => {
      for (let i = 0; i < 16; i++) {
        const x1 = x - fw * 0.02 + i * (fw / 14);
        ctx.moveTo(x1, y + h * 0.02);
        ctx.lineTo(x1 + fw * 0.02, y + h * 0.045);
      }
      const dx = x + fw * 0.16;
      const doorH = fh * 0.38;
      for (let i = 0; i < 5; i++) {
        const bx = dx + doorWSafe(fw) * 0.18 + i * doorWSafe(fw) * 0.15;
        ctx.moveTo(bx, ground - doorH + 8 * u);
        ctx.lineTo(bx, ground - 8 * u);
      }
    }, 0.8);
  }
  if (o.life) {
    drawFigure(ctx, x + fw + w * 0.06, ground, h * 0.11);
    strokeGuide(ctx, () => {
      ctx.moveTo(x + fw * 0.16, ground);
      ctx.quadraticCurveTo(x + fw * 0.36, ground + h * 0.018, x + fw * 0.62, ground);
    }, 1);
  }
}

function doorWSafe(fw) {
  return fw * 0.2;
}

function streetParts(ctx, w, h, level) {
  const vx = w * 0.56;
  const vy = h * 0.4;
  const ground = h * 0.86;
  strokeGuide(ctx, () => {
    ctx.moveTo(w * 0.06, vy);
    ctx.lineTo(w * 0.94, vy);
    ctx.moveTo(vx - 5, vy - 5);
    ctx.lineTo(vx + 5, vy + 5);
    ctx.moveTo(vx - 5, vy + 5);
    ctx.lineTo(vx + 5, vy - 5);
  }, 1);
  strokeGuide(ctx, () => {
    ctx.moveTo(vx, vy);
    ctx.lineTo(w * 0.22, ground);
    ctx.moveTo(vx, vy);
    ctx.lineTo(w * 0.84, ground);
    ctx.moveTo(w * 0.38, ground);
    ctx.lineTo(vx, vy);
    ctx.moveTo(w * 0.68, ground);
    ctx.lineTo(vx, vy);
  }, 1.1);
  if (level < 2) return;
  const bands = [0.22, 0.48, 0.78];
  strokeGuide(ctx, () => {
    bands.forEach((t) => {
      const y = vy + (ground - vy) * t;
      const half = (w * 0.34) * t;
      ctx.moveTo(vx - half * 1.15, y);
      ctx.lineTo(vx - half * 0.28, y);
      ctx.moveTo(vx + half * 0.28, y);
      ctx.lineTo(vx + half * 1.35, y);
    });
    ctx.moveTo(w * 0.1, h * 0.34);
    ctx.lineTo(w * 0.1, ground);
    ctx.lineTo(vx, vy);
    ctx.moveTo(w * 0.93, h * 0.3);
    ctx.lineTo(w * 0.93, ground);
    ctx.lineTo(vx, vy);
  }, 1.15);
  if (level < 3) return;
  strokeGuide(ctx, () => {
    for (let i = 0; i < 3; i++) {
      const t = 0.35 + i * 0.2;
      const y = vy + (ground - vy) * t * 0.55;
      const y2 = y + h * 0.05 * (1.2 - t);
      const xL = vx - w * 0.22 * t;
      ctx.rect(xL, y, w * 0.045 * (1.15 - t * 0.3), y2 - y);
      const xR = vx + w * 0.12 * t;
      ctx.rect(xR, y, w * 0.05 * (1.2 - t * 0.25), (y2 - y) * 0.9);
    }
  }, 0.9);
  drawFigure(ctx, w * 0.3, ground, h * 0.12);
}

function windowParts(ctx, w, h, level) {
  const x = w * 0.16;
  const y = h * 0.12;
  const fw = w * 0.68;
  const fh = h * 0.72;
  strokeGuide(ctx, () => {
    ctx.rect(x, y, fw, fh);
  }, 1.3);
  const rows = [0.18, 0.42, 0.66, 0.88];
  strokeGuide(ctx, () => {
    rows.forEach((t) => {
      ctx.moveTo(x, y + fh * t);
      ctx.lineTo(x + fw, y + fh * t);
    });
  }, 0.85);
  if (level < 2) return;
  const cols = [0.14, 0.38, 0.62];
  strokeGuide(ctx, () => {
    for (let r = 0; r < 3; r++) {
      const y1 = y + fh * rows[r] + fh * 0.03;
      const y2 = y + fh * rows[r + 1] - fh * 0.035;
      cols.forEach((c) => {
        if (r === 2 && c < 0.2) return;
        const ww = r === 2 && c === 0.38 ? fw * 0.28 : fw * 0.16;
        ctx.rect(x + fw * c, y1, ww, y2 - y1);
      });
    }
  }, 1.05);
  if (level < 3) return;
  strokeGuide(ctx, () => {
    for (let r = 0; r < 3; r++) {
      const y1 = y + fh * rows[r] + fh * 0.03;
      const y2 = y + fh * rows[r + 1] - fh * 0.035;
      cols.forEach((c) => {
        if (r === 2 && c < 0.2) return;
        const ww = r === 2 && c === 0.38 ? fw * 0.28 : fw * 0.16;
        const x1 = x + fw * c;
        for (let i = 0; i < 4; i++) {
          const yy = y1 + 4 + i * ((y2 - y1) / 5);
          ctx.moveTo(x1 + ww * 0.62, yy);
          ctx.lineTo(x1 + ww - 3, yy);
        }
      });
    }
  }, 0.8);
}

function vessels(ctx, w, h, o) {
  const ground = h * 0.78;
  const mx = w * 0.34;
  const bx = w * 0.68;
  const mTop = h * 0.36;
  const bTop = h * 0.24;
  const mrx = w * 0.11;
  const brx = w * 0.09;
  const cap = h * 0.035;
  if (o.ellipses) {
    strokeGuide(ctx, () => {
      ctx.ellipse(mx, mTop, mrx, cap, 0, 0, Math.PI * 2);
      ctx.ellipse(mx, ground, mrx * 0.92, cap * 0.85, 0, 0, Math.PI);
      ctx.ellipse(bx, bTop, brx * 0.55, cap * 0.7, 0, 0, Math.PI * 2);
      ctx.ellipse(bx, ground, brx, cap * 0.9, 0, 0, Math.PI);
      ctx.ellipse(bx, h * 0.4, brx * 0.95, cap, 0, 0, Math.PI * 2);
    }, 1.15);
  }
  if (o.profiles) {
    strokeGuide(ctx, () => {
      ctx.moveTo(mx - mrx, mTop);
      ctx.lineTo(mx - mrx * 0.92, ground);
      ctx.moveTo(mx + mrx, mTop);
      ctx.lineTo(mx + mrx * 0.92, ground);
      ctx.moveTo(mx + mrx * 0.7, mTop + h * 0.08);
      ctx.quadraticCurveTo(mx + mrx * 1.7, h * 0.5, mx + mrx * 0.75, ground - h * 0.1);
      ctx.moveTo(bx - brx * 0.55, bTop);
      ctx.lineTo(bx - brx * 0.45, h * 0.34);
      ctx.quadraticCurveTo(bx - brx * 1.15, h * 0.46, bx - brx, ground);
      ctx.moveTo(bx + brx * 0.55, bTop);
      ctx.lineTo(bx + brx * 0.45, h * 0.34);
      ctx.quadraticCurveTo(bx + brx * 1.15, h * 0.46, bx + brx, ground);
    }, 1.25);
    strokeGuide(ctx, () => {
      ctx.moveTo(w * 0.1, ground);
      ctx.lineTo(w * 0.9, ground);
    }, 1);
  }
  if (o.value) {
    dot(ctx, w * 0.14, h * 0.16);
    strokeGuide(ctx, () => {
      for (let i = 0; i < 9; i++) {
        const y = mTop + h * 0.05 + i * h * 0.04;
        ctx.moveTo(mx + mrx * 0.15, y);
        ctx.quadraticCurveTo(mx + mrx * 0.7, y + 4, mx + mrx * 0.15, Math.min(ground - 6, y + h * 0.035));
      }
      for (let i = 0; i < 8; i++) {
        const y = h * 0.42 + i * h * 0.04;
        ctx.moveTo(bx + brx * 0.1, y);
        ctx.quadraticCurveTo(bx + brx * 0.7, y + 6, bx + brx * 0.15, Math.min(ground - 6, y + h * 0.038));
      }
      ctx.moveTo(mx - mrx * 0.2, ground);
      ctx.quadraticCurveTo(mx + w * 0.08, ground + h * 0.04, bx + brx, ground);
    }, 0.85);
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
    ctx.moveTo(x - 3 * s, ground - height + 32 * s);
    ctx.lineTo(x - 5 * s, ground);
    ctx.moveTo(x + 3 * s, ground - height + 32 * s);
    ctx.lineTo(x + 5 * s, ground);
  }, 1.1);
}
