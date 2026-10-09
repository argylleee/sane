import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => preference.reduced,
}));
import { HomeMascot } from './HomeMascot';

describe('homepage companion accessibility', () => {
  beforeEach(() => {
    preference.reduced = false;
  });

  it('keeps the decorative companion out of keyboard and screen-reader navigation', () => {
    const markup = renderToStaticMarkup(createElement(HomeMascot, { attention: false }));
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('tabindex');
    expect(markup).not.toContain('<button');
    expect(markup).toContain('width="1431" height="1100"');
  });

  it('disables idle and blink animation when reduced motion is requested, including CTA feedback', () => {
    preference.reduced = true;
    const markup = renderToStaticMarkup(createElement(HomeMascot, { attention: true }));
    expect(markup).toContain('data-playing="false"');
    expect(markup).toContain('data-reacting="true"');
    expect(markup).not.toMatch(/translate[XY]\(-[1-9]|rotate\(-[1-9]/);
  });
});
