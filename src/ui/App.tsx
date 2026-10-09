import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { analyze } from '../pipeline/analyze';
import type { Lang, Level, Verdict } from '../types';
import { copyFor } from './copy';

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const LANGUAGES: readonly Lang[] = ['en', 'fil', 'taglish'];
type Screen = 'welcome' | 'scan' | 'result' | 'learn';
type FeedbackKey =
  | 'clipboardUnavailable'
  | 'clipboardError'
  | 'screenshotTypeError'
  | 'screenshotLimitError'
  | 'analysisError';

function StatusMark({ level }: { level: Level }) {
  if (level === 'likely_scam') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M12 3.5 22 21H2L12 3.5Z" />
        <path d="M12 9v5m0 3h.01" />
      </svg>
    );
  }

  if (level === 'suspicious') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M12 7v6m0 4h.01" />
      </svg>
    );
  }

  if (level === 'probably_fine') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="9.5" />
        <path d="m7.5 12.5 3 3 6-7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.7 9a2.4 2.4 0 1 1 4.3 1.5c-.8 1-2 1.2-2 2.8m0 3h.01" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="m14.5 5-7 7 7 7M8 12h13" />
    </svg>
  );
}

function InertMessage({ text }: { text: string }) {
  const urlPattern = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+)/gi;
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//i.test(part) || /^www\./i.test(part) ? (
          <code className="url-fragment" aria-label={part} key={`${part}-${index}`}>
            {part.replace(/^https:\/\//i, 'hxxps://').replace(/^http:\/\//i, 'hxxp://')}
          </code>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function LanguagePicker({
  lang,
  onChange,
  label,
  className = '',
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
  label: string;
  className?: string;
}) {
  return (
    <label className={`language-picker ${className}`}>
      <span className="visually-hidden">{label}</span>
      <select
        aria-label={label}
        value={lang}
        onChange={(event) => {
          const selected = LANGUAGES.find((language) => language === event.currentTarget.value);
          if (selected) onChange(selected);
        }}
      >
        {LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {copyFor(language).languageName}
          </option>
        ))}
      </select>
    </label>
  );
}

function MainNavigation({
  screen,
  copy,
  onNavigate,
}: {
  screen: Screen;
  copy: ReturnType<typeof copyFor>;
  onNavigate: (screen: 'scan' | 'learn') => void;
}) {
  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <button
        type="button"
        aria-current={screen === 'scan' ? 'page' : undefined}
        onClick={() => onNavigate('scan')}
      >
        {copy.scanNav}
      </button>
      <button
        type="button"
        aria-current={screen === 'learn' ? 'page' : undefined}
        onClick={() => onNavigate('learn')}
      >
        {copy.learnNav}
      </button>
    </nav>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lang, setLang] = useState<Lang>('en');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [resultIsImage, setResultIsImage] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKey | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const copy = copyFor(lang);
  const overLimit = message.length > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    document.documentElement.lang = lang === 'taglish' ? 'en-PH' : lang;
  }, [lang]);

  useEffect(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme = colorScheme.matches ? 'dark' : 'light';
    };

    applyTheme();
    colorScheme.addEventListener('change', applyTheme);
    return () => colorScheme.removeEventListener('change', applyTheme);
  }, []);

  async function pasteFromClipboard() {
    setFeedback(null);
    if (!navigator.clipboard?.readText) {
      setFeedback('clipboardUnavailable');
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      setImage(null);
      setMessage(clipboardText);
    } catch {
      setFeedback('clipboardError');
    }
  }

  function selectScreenshot(file: File | undefined) {
    setFeedback(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImage(null);
      setFeedback('screenshotTypeError');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImage(null);
      setFeedback('screenshotLimitError');
      return;
    }
    setImage(file);
  }

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isAnalyzing || (!image && !message.trim()) || (!image && overLimit)) return;

    setFeedback(null);
    setIsAnalyzing(true);
    const sourceImage = image;
    const sourceMessage = sourceImage ? '' : message;

    try {
      const result = await analyze(sourceImage ? { image: sourceImage } : { text: sourceMessage }, {
        lang,
        useLLM: false,
      });
      setVerdict(result);
      setResultMessage(sourceMessage);
      setResultIsImage(Boolean(sourceImage));
      setScreen('result');
    } catch {
      setFeedback('analysisError');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function startAnotherCheck() {
    setMessage('');
    setImage(null);
    setVerdict(null);
    setResultMessage('');
    setResultIsImage(false);
    setFeedback(null);
    setScreen('scan');
    window.requestAnimationFrame(() => messageInput.current?.focus());
  }

  const feedbackText = feedback ? copy[feedback] : null;

  return (
    <div className="app-shell">
      <header className={`topbar${screen === 'result' ? ' topbar--result' : ''}`}>
        {screen === 'result' ? (
          <button
            className="back-button"
            type="button"
            aria-label={copy.backToScan}
            onClick={() => setScreen('scan')}
          >
            <BackIcon />
          </button>
        ) : null}
        <button
          className="brand"
          type="button"
          onClick={() => setScreen(screen === 'welcome' ? 'welcome' : 'scan')}
        >
          sane
        </button>
        {screen !== 'result' && (
          <MainNavigation screen={screen} copy={copy} onNavigate={setScreen} />
        )}
        <LanguagePicker
          className="topbar-language"
          label={copy.languageLabel}
          lang={lang}
          onChange={setLang}
        />
      </header>

      <main className={`page page--${screen}`}>
        {screen === 'welcome' && (
          <section className="welcome-layout" aria-labelledby="welcome-title">
            <div className="welcome-content">
              <h1 id="welcome-title">{copy.welcomeTitle}</h1>
              <p className="page-intro">{copy.welcomeDescription}</p>
              <fieldset className="language-choice">
                <legend>{copy.languageLabel}</legend>
                <div className="language-options">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language}
                      type="button"
                      aria-pressed={lang === language}
                      onClick={() => setLang(language)}
                    >
                      {copyFor(language).languageName}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                className="button button--primary welcome-start"
                type="button"
                onClick={() => setScreen('scan')}
              >
                {copy.start}
              </button>
              <p className="supporting-copy">{copy.localDescription}</p>
            </div>
            <div className="welcome-details">
              <section className="detail-block">
                <p className="detail-label">{copy.manualLabel}</p>
                <h2>{copy.manualTitle}</h2>
                <p>{copy.manualDescription}</p>
              </section>
              <section className="detail-block">
                <p className="detail-label">{copy.localLabel}</p>
                <h2>{copy.localTitle}</h2>
                <p>{copy.localDescription}</p>
              </section>
            </div>
          </section>
        )}

        {screen === 'scan' && (
          <>
            <div className="page-heading">
              <h1>{copy.scanTitle}</h1>
              <p className="page-intro">{copy.scanDescription}</p>
            </div>
            <div className="scan-layout">
              <form className="scan-form" onSubmit={runAnalysis}>
                {image ? (
                  <div className="selected-image" aria-live="polite">
                    <p>{copy.screenshotSelected(image.name)}</p>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => setImage(null)}
                    >
                      {copy.useText}
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="field-label" htmlFor="message-input">
                      {copy.messageLabel}
                    </label>
                    <textarea
                      ref={messageInput}
                      id="message-input"
                      rows={7}
                      value={message}
                      placeholder={copy.messagePlaceholder}
                      aria-describedby="message-count"
                      onChange={(event) => {
                        setMessage(event.currentTarget.value);
                        setFeedback(null);
                      }}
                    />
                    <div
                      id="message-count"
                      className={`character-count${overLimit ? ' character-count--error' : ''}`}
                      aria-live="polite"
                    >
                      {copy.characterCount(message.length, MAX_MESSAGE_LENGTH)}
                    </div>
                    {overLimit && <p className="field-error">{copy.overLimit}</p>}
                  </>
                )}

                <div className="input-actions">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={pasteFromClipboard}
                  >
                    {copy.paste}
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => fileInput.current?.click()}
                  >
                    {copy.upload}
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      selectScreenshot(event.currentTarget.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                </div>

                {feedbackText && (
                  <p className="field-error" role="alert">
                    {feedbackText}
                  </p>
                )}
                {image && <p className="supporting-copy">{copy.screenshotUnavailable}</p>}
                {isAnalyzing && (
                  <p className="loading-message" role="status">
                    {copy.checking}
                  </p>
                )}

                <button
                  className="button button--primary analyze-button"
                  type="submit"
                  disabled={isAnalyzing || (!image && !message.trim()) || (!image && overLimit)}
                >
                  {isAnalyzing ? copy.checking : copy.analyze}
                </button>
                <p className="supporting-copy">{copy.pasteOnlyNotice}</p>
              </form>

              <aside className="scan-help">
                <div className="notice notice--neutral">
                  <h2>{copy.readyTitle}</h2>
                  <p>{copy.readyDescription}</p>
                </div>
                <section className="how-to">
                  <h2>{copy.howTitle}</h2>
                  <ol>
                    {copy.howSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </section>
              </aside>
            </div>
          </>
        )}

        {screen === 'result' && verdict && (
          <>
            <div className="page-heading result-page-heading">
              <h1>{copy.resultTitle}</h1>
              <p className="page-intro">{copy.resultSubtitle}</p>
            </div>
            <div className="result-grid" aria-live="polite">
              <section className="result-primary">
                <div className={`verdict-strip verdict-strip--${verdict.level}`} role="status">
                  <StatusMark level={verdict.level} />
                  <h2>{copy.assessment[verdict.level].label}</h2>
                </div>
                <p className="coverage-label">
                  {resultIsImage ? copy.coverageImage : copy.coverageText}
                </p>
                <p className="assessment-summary">{copy.assessment[verdict.level].summary}</p>

                <div className="next-step">
                  <h2>
                    {copy.nextPrefix}: {copy.assessment[verdict.level].nextTitle}
                  </h2>
                  <p>{copy.assessment[verdict.level].nextStep}</p>
                </div>

                <section className="result-section">
                  <h2>{copy.modelTitle}</h2>
                  <p>
                    {verdict.usedModels.embeddings ||
                    verdict.usedModels.ocr ||
                    verdict.usedModels.llm
                      ? copy.modelRan
                      : copy.noModel}
                  </p>
                </section>

                <section className="result-section evidence-section">
                  <h2>{copy.rulesTitle}</h2>
                  {verdict.signals.length > 0 ? (
                    <ul>
                      {verdict.signals.map((signal, index) => (
                        <li key={`${signal.id}-${index}`}>{signal.label}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{copy.noSignals}</p>
                  )}
                  <p className="supporting-copy">{copy.signalNote}</p>
                </section>

                {verdict.level === 'probably_fine' && (
                  <aside className="notice notice--neutral">
                    <h2>{copy.notAGuaranteeTitle}</h2>
                    <p>{copy.notAGuarantee}</p>
                  </aside>
                )}
                {resultIsImage && (
                  <p className="field-error" role="status">
                    {copy.screenshotUnavailable}
                  </p>
                )}
              </section>

              <aside className="result-secondary">
                <section className="original-message">
                  <h2>{copy.originalTitle}</h2>
                  <p className="original-copy">
                    {resultIsImage ? copy.imageOriginal : <InertMessage text={resultMessage} />}
                  </p>
                  <p className="supporting-copy">{copy.originalNote}</p>
                </section>
                <button
                  className="button button--primary another-button"
                  type="button"
                  onClick={startAnotherCheck}
                >
                  {copy.another}
                </button>
              </aside>
            </div>
          </>
        )}

        {screen === 'learn' && (
          <>
            <div className="page-heading">
              <h1>{copy.learnTitle}</h1>
              <p className="page-intro">{copy.learnDescription}</p>
            </div>
            <div className="learn-layout">
              {copy.guides.map((guide) => (
                <section className="guide" key={guide.title}>
                  <h2>{guide.title}</h2>
                  <p>{guide.body}</p>
                </section>
              ))}
              <aside className="notice notice--neutral learn-notice">
                <h2>{copy.learnDisclaimerTitle}</h2>
                <p>{copy.learnDisclaimer}</p>
              </aside>
              <button
                className="button button--secondary learn-action"
                type="button"
                onClick={() => setScreen('scan')}
              >
                {copy.learnAction}
              </button>
            </div>
          </>
        )}
      </main>

      {screen !== 'result' && (
        <nav className="mobile-navigation" aria-label="Main navigation">
          <MainNavigation screen={screen} copy={copy} onNavigate={setScreen} />
        </nav>
      )}
    </div>
  );
}
