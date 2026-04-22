import { toCanvas } from "html-to-image";

/**
 * Render the tape DOM node to a PNG Blob placed on a dark framed background (Option I2).
 *
 * - Captures the tape element at 2× pixel density for retina-quality output.
 * - Draws the result centered on a padded, subtly-gradiented dark canvas.
 * - Returns a PNG Blob.
 */
export async function renderTapeImage(tapeEl: HTMLElement): Promise<Blob> {
  // Step 1 — capture the tape node via html-to-image (faster + smaller than
  // html2canvas on small DOMs; same retina behavior via pixelRatio).
  const tapeCanvas = await toCanvas(tapeEl, {
    backgroundColor: undefined, // transparent — the composite supplies the bg
    pixelRatio: 2,              // retina
    cacheBust: true,            // avoid cached-image CORS surprises
  });

  // Step 2 — build composite canvas with padding around the tape
  const PAD_X = 120; // in output pixels (before scale-down at display)
  const PAD_Y = 140;
  const outW = tapeCanvas.width + PAD_X * 2;
  const outH = tapeCanvas.height + PAD_Y * 2;

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Failed to create canvas 2D context for image composition");

  // Step 3 — paint dark textured background (radial gradient top-left like the mockup)
  ctx.fillStyle = "#1a1614";
  ctx.fillRect(0, 0, outW, outH);

  const radial = ctx.createRadialGradient(outW * 0.3, outH * 0.2, 10, outW * 0.3, outH * 0.2, outW * 0.8);
  radial.addColorStop(0, "rgba(255, 240, 210, 0.06)");
  radial.addColorStop(1, "rgba(255, 240, 210, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, outW, outH);

  // Step 4 — soft shadow beneath the tape for depth
  // (drawImage emits a shadow from the source canvas's opaque pixels)
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;
  ctx.drawImage(tapeCanvas, PAD_X, PAD_Y);
  ctx.restore();

  // Step 5 — export to PNG Blob
  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export tape PNG"))),
      "image/png",
    );
  });
}
