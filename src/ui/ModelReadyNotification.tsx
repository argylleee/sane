import { useEffect, useRef } from 'react';
import { Toast, toast } from '@heroui/react';
import { CircleCheck, X } from 'lucide-react';
import type { EmbeddingsStatus } from '../ai';
import type { copyFor } from './copy';

export function ModelReadyNotification({
  state,
  copy,
}: {
  state: EmbeddingsStatus['state'];
  copy: ReturnType<typeof copyFor>;
}) {
  const previousState = useRef(state);

  useEffect(() => {
    if (previousState.current === 'loading' && state === 'ready') {
      toast.success(copy.modelReadyStatus, { description: copy.modelReadyNote, timeout: 3000 });
    }
    previousState.current = state;
  }, [state, copy.modelReadyStatus, copy.modelReadyNote]);

  return (
    <Toast.Provider
      placement="top end"
      maxVisibleToasts={1}
      className="model-toast-region"
      aria-label={copy.notificationLabel}
    >
      {({ toast: notification }) => (
        <Toast toast={notification} className="model-toast clay-panel" variant="success">
          <Toast.Indicator className="model-toast-icon">
            <CircleCheck size={24} />
          </Toast.Indicator>
          <Toast.Content className="min-w-0 flex-1 space-y-1">
            <Toast.Title className="block text-text font-semibold">
              {notification.content.title}
            </Toast.Title>
            <Toast.Description className="block text-sm text-secondary">
              {notification.content.description}
            </Toast.Description>
          </Toast.Content>
          <Toast.CloseButton className="model-toast-close" aria-label={copy.dismissNotification}>
            <X size={18} />
          </Toast.CloseButton>
        </Toast>
      )}
    </Toast.Provider>
  );
}
