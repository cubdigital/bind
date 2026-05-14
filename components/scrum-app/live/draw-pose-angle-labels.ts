import type { ScrumAngleOverlay } from "./scrum-joint-angles";

function fillLabelChip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, rr);
  } else {
    const x = cx - w / 2;
    const y = cy - h / 2;
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

/** Overlay compact angle readouts near joints (full body mode). */
export function drawPoseAngleLabels(
  ctx: CanvasRenderingContext2D,
  overlays: ScrumAngleOverlay[],
): void {
  if (!overlays.length) return;
  ctx.save();
  ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  overlays.forEach((o, i) => {
    const staggerX = ((i % 4) - 1.5) * 10;
    const staggerY = -22 - Math.floor(i / 4) * 17;
    const x = o.x + staggerX;
    const y = o.y + staggerY;
    const text = `${o.shortLabel} ${o.degrees}°`;
    const m = ctx.measureText(text);
    const padX = 6;
    const w = m.width + padX * 2;
    const h = 20;

    ctx.fillStyle = "rgba(12, 12, 18, 0.84)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    fillLabelChip(ctx, x, y, w, h, 6);

    ctx.lineWidth = 2.75;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#fafafa";
    ctx.fillText(text, x, y);
  });

  ctx.restore();
}
