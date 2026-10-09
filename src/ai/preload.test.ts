import { afterEach, describe, expect, it, vi } from 'vitest';
import { shouldAutoPreload, shouldAutoPreloadLlm } from './preload';

function stubNavigator(
  connection: object | undefined,
  userAgent = 'Mozilla/5.0 (Windows NT 10.0)',
) {
  vi.stubGlobal('navigator', { connection, userAgent });
}

afterEach(() => vi.unstubAllGlobals());

describe('automatic model downloads', () => {
  it('downloads the explanation model on Wi-Fi or a wired connection', () => {
    stubNavigator({ type: 'wifi' }, 'Mozilla/5.0 (Linux; Android 14) Mobile');
    expect(shouldAutoPreloadLlm()).toBe(true);
    stubNavigator({ type: 'ethernet' });
    expect(shouldAutoPreloadLlm()).toBe(true);
  });

  it('waits on mobile data, data saver or a slow connection', () => {
    stubNavigator({ type: 'cellular' }, 'Mozilla/5.0 (Linux; Android 14) Mobile');
    expect(shouldAutoPreloadLlm()).toBe(false);
    stubNavigator({ type: 'wifi', saveData: true });
    expect(shouldAutoPreloadLlm()).toBe(false);
    expect(shouldAutoPreload()).toBe(false);
    stubNavigator({ effectiveType: '3g' });
    expect(shouldAutoPreloadLlm()).toBe(false);
  });

  it('assumes Wi-Fi only on desktop when the browser hides the connection type', () => {
    stubNavigator(undefined, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605');
    expect(shouldAutoPreloadLlm()).toBe(true);
    stubNavigator(undefined, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148');
    expect(shouldAutoPreloadLlm()).toBe(false);
  });
});
