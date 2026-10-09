import { describe, expect, it } from 'vitest';
import {
  cleanOcrText,
  enhanceInPlace,
  isDarkImage,
  meanLuminance,
  targetSize,
} from './ocrPreprocess';

function pixels(values: number[]): Uint8ClampedArray {
  return Uint8ClampedArray.from(values.flatMap((v) => [v, v, v, 255]));
}

describe('targetSize', () => {
  it('upscales small screenshots, keeping the aspect ratio', () => {
    const size = targetSize(400, 800);
    expect(size.height).toBe(1200);
    expect(size.width).toBe(600);
  });

  it('downscales very large images and leaves ordinary phone screenshots alone', () => {
    expect(targetSize(4000, 8000).height).toBe(2600);
    expect(targetSize(1080, 2400)).toEqual({ width: 1080, height: 2400 });
  });

  it('never returns a zero size', () => {
    const size = targetSize(1, 1);
    expect(size.width).toBeGreaterThanOrEqual(1);
    expect(size.height).toBeGreaterThanOrEqual(1);
  });
});

describe('dark image handling', () => {
  it('detects dark and light images by luminance', () => {
    expect(isDarkImage(pixels(Array(64).fill(20)))).toBe(true);
    expect(isDarkImage(pixels(Array(64).fill(235)))).toBe(false);
    expect(meanLuminance(pixels(Array(64).fill(255)))).toBeCloseTo(1, 2);
  });

  it('inverts a dark image so that text becomes dark on a light background', () => {
    // Mostly dark background (30) with a few bright text pixels (230).
    const data = pixels([...Array(60).fill(30), ...Array(4).fill(230)]);
    enhanceInPlace(data, true);
    expect(data[0]).toBeGreaterThan(200); // background is now light
    expect(data[data.length - 4]).toBeLessThan(60); // text is now dark
    expect(data[3]).toBe(255);
  });

  it('stretches the contrast of a washed-out light image without inverting', () => {
    const data = pixels([...Array(60).fill(200), ...Array(4).fill(150)]);
    enhanceInPlace(data, false);
    expect(data[0]).toBe(255);
    expect(data[data.length - 4]).toBe(0);
  });
});

describe('cleanOcrText', () => {
  it('drops status-bar and chat-chrome lines but keeps the message', () => {
    const raw = [
      '9:41',
      '87%',
      'LTE',
      'Your GCash account has been limited.',
      'Verify at the link below',
      'Delivered',
      '',
      'Type a message',
    ].join('\n');
    expect(cleanOcrText(raw)).toBe(
      'Your GCash account has been limited.\nVerify at the link below',
    );
  });

  it('drops short symbol-only fragments and keeps short real words and numbers', () => {
    expect(cleanOcrText('— | _\nOTP 482913\n>>>')).toBe('OTP 482913');
  });

  it('removes zero-width characters and collapses spaces', () => {
    expect(cleanOcrText('Pay   the​   fee now')).toBe('Pay the fee now');
  });

  it('keeps Filipino text intact', () => {
    const text = 'Hindi mo kailangang magbayad. Bayad na ang shipping.';
    expect(cleanOcrText(text)).toBe(text);
  });
});
