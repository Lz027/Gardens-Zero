export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof console === "undefined") return;
  console.error("[Gardens Zero]", error, context);
}
