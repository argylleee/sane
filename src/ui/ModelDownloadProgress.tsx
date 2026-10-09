import { ProgressBar } from '@heroui/react';
import { CloudDownload } from 'lucide-react';
import type { copyFor } from './copy';

export function ModelDownloadProgress({
  progress,
  copy,
}: {
  progress: number;
  copy: ReturnType<typeof copyFor>;
}) {
  return (
    <div className="model-download space-y-3">
      <ProgressBar
        className="model-progress"
        value={progress}
        aria-labelledby="model-download-label"
        aria-describedby="model-download-note"
      >
        <span id="model-download-label" className="flex items-center gap-2 text-text font-semibold">
          <CloudDownload size={18} />
          {copy.modelDownloadTitle}
        </span>
        <ProgressBar.Output className="model-progress-output" />
        <ProgressBar.Track className="model-progress-track">
          <ProgressBar.Fill className="model-progress-fill" />
        </ProgressBar.Track>
      </ProgressBar>
      <p id="model-download-note" className="text-sm text-secondary">
        {copy.modelDownloadNote}
      </p>
    </div>
  );
}
