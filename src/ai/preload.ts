// OWNER: model. Automatic model download on first visit, with polite guards.
import { loadEmbeddings } from './embedClient';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

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
