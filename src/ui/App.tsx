// OWNER: frontend. Minimal slice: paste box -> analyze() -> verdict. User text is rendered as text only.
import { useState } from 'react';
import { detectCapabilities } from '../ai/capabilities';
import { analyze } from '../pipeline/analyze';
import type { Verdict } from '../types';

const caps = detectCapabilities();

export function App() {
  const [text, setText] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  async function check() {
    setVerdict(await analyze({ text }, { lang: 'en', useLLM: false }));
  }

  return (
    <main className="app">
      <h1>Sane</h1>
      <p>Paste a suspicious message. It is checked on your device.</p>
      <label htmlFor="msg">Message</label>
      <textarea id="msg" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" onClick={check} disabled={!text.trim()}>
        Check message
      </button>
      {verdict && (
        <section aria-live="polite">
          <h2>{verdict.level.replace('_', ' ')}</h2>
          <p>{verdict.explanation.headline}</p>
          <ul>
            {verdict.explanation.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      )}
      <footer>
        <small>
          Device: tier {caps.tier}, WebGPU {caps.webgpu ? 'yes' : 'no'}, memory{' '}
          {caps.deviceMemoryGb ?? 'unknown'} GB
        </small>
      </footer>
    </main>
  );
}
