/**
 * Backs a canvas with a fixed logical resolution while rendering crisply
 * at the device pixel ratio (capped, so retina screens don't tank
 * performance). CSS sizing is left to the parent — this only sets the
 * backing store and returns a context pre-scaled to logical units.
 */
export function setupCanvas(canvas: HTMLCanvasElement, logicalW: number, logicalH: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(logicalW * dpr);
  canvas.height = Math.round(logicalH * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
