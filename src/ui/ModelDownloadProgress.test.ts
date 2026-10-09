import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ModelDownloadProgress } from './ModelDownloadProgress';
import { copyFor } from './copy';

describe('AI download progress accessibility', () => {
  it.each([0, 42, 99])('reports the actual %i percent without inventing completion', (progress) => {
    const markup = renderToStaticMarkup(
      createElement(ModelDownloadProgress, { progress, copy: copyFor('en') }),
    );
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain(`aria-valuenow="${progress}"`);
    expect(markup).toContain(`aria-valuetext="${progress}%"`);
    expect(markup).toContain(`width:${progress}%`);
    expect(markup).toContain('aria-describedby="model-download-note"');
    expect(markup).toContain(copyFor('en').modelDownloadNote);
  });
});
