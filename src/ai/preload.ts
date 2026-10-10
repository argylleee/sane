// OWNER: model. Automatic model download on first visit, with polite guards.
import { refineCapabilities } from './capabilities';
import { loadEmbeddings } from './embedClient';
import { getLlmStatus, isLlmCached, loadLlm } from './llm';

type NetworkInformation = { saveData?: boolean; effectiveType?: string; type?: string };

/**
 * The explanation model is larger, so it downloads by itself only on Wi-Fi or a wired connection.
 * Browsers that do not report the connection type (Safari, Firefox) count as not on mobile data
 * only on desktop; phones then wait for the user to start it.
 */
export function shouldAutoPreloadLlm(): boolean {
  if (!shouldAutoPreload()) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.type) return connection.type === 'wifi' || connection.type === 'ethernet';
  if (connection?.effectiveType === '3g') return false;
  return !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * The explanation model is optional: it is downloaded only when the user asks for it. On later
 * visits it loads by itself if it is already cached (no download). Never throws: without the model
 * the fixed explanation is used.
 */
export async function startLlmPreload(): Promise<void> {
  if (getLlmStatus().state !== 'idle') return;
  const { tier } = await refineCapabilities();
  if (tier === 'C' || !(await isLlmCached(tier))) return;
  await loadLlm(tier).catch(() => undefined);
}

/** False when the user asked to save data or is on a very slow connection. */
export function shouldAutoPreload(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') return false;
  return true;
}

/**
 * Call once when the app opens. Starts the download (about 120 MB the first time, then served
 * from the browser cache) without blocking the UI. Resolves when ready; never throws, because the
 * rules-only path keeps working if the model fails. Returns undefined when it chose not to start.
 */
export function startEmbeddingsPreload(): Promise<void> | undefined {
  if (!shouldAutoPreload()) return undefined;
  // Ask the browser not to evict the cached model under storage pressure (best effort).
  void navigator.storage?.persist?.().catch(() => undefined);
  return loadEmbeddings().catch(() => undefined);
}
