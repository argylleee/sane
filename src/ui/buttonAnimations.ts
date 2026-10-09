// Global button click animation system (tactile spring pop, radial liquid ripple, shockwave, and particle sparks)
export function initButtonAnimations(): () => void {
  let lastPointerTime = 0;

  function triggerAnimation(event: MouseEvent | PointerEvent, targetButton: HTMLElement) {
    if (
      (targetButton as HTMLButtonElement).disabled ||
      targetButton.getAttribute('aria-disabled') === 'true' ||
      targetButton.classList.contains('disabled')
    ) {
      return;
    }

    const rect = targetButton.getBoundingClientRect();
    const isKeyboard = event.clientX === 0 && event.clientY === 0;
    const clientX = isKeyboard ? rect.left + rect.width / 2 : event.clientX;
    const clientY = isKeyboard ? rect.top + rect.height / 2 : event.clientY;

    // 1. Tactile spring pop + shockwave halo
    targetButton.classList.remove('button-clicked');
    void targetButton.offsetWidth; // Force reflow so animation re-triggers
    targetButton.classList.add('button-clicked');

    // 2. Liquid radial ripple inside the button
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2.4;

    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple-wave';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${relX}px`;
    ripple.style.top = `${relY}px`;

    targetButton.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 550);

    // 3. Micro-sparkle particle burst (unless reduced motion is preferred)
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!prefersReducedMotion && document.body) {
      const particleCount = 6;
      const isDark = document.documentElement.classList.contains('dark');

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'btn-click-particle';
        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 16 + Math.random() * 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const sizePx = 3.5 + Math.random() * 2.5;

        particle.style.left = `${clientX}px`;
        particle.style.top = `${clientY}px`;
        particle.style.width = `${sizePx.toFixed(1)}px`;
        particle.style.height = `${sizePx.toFixed(1)}px`;
        particle.style.setProperty('--p-tx', `${tx.toFixed(1)}px`);
        particle.style.setProperty('--p-ty', `${ty.toFixed(1)}px`);

        if (isDark) {
          particle.style.background = i % 2 === 0 ? '#75C698' : '#DCEBE0';
          particle.style.boxShadow = '0 0 6px rgba(117, 198, 152, 0.7)';
        } else {
          particle.style.background = i % 2 === 0 ? '#124F38' : '#75C698';
          particle.style.boxShadow = '0 0 5px rgba(18, 79, 56, 0.5)';
        }

        document.body.appendChild(particle);
        setTimeout(() => {
          particle.remove();
        }, 460);
      }
    }

    setTimeout(() => {
      targetButton.classList.remove('button-clicked');
    }, 450);
  }

  function handlePointerDown(event: PointerEvent) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('button, [role="button"], [data-slot="button"]');
    if (!button) return;

    lastPointerTime = Date.now();
    triggerAnimation(event, button);
  }

  function handleClick(event: MouseEvent) {
    // Only handle if not already triggered by pointerdown (e.g. keyboard triggers with Enter or Space)
    if (Date.now() - lastPointerTime < 280) return;

    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('button, [role="button"], [data-slot="button"]');
    if (!button) return;

    triggerAnimation(event, button);
  }

  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('click', handleClick, { passive: true });

  return () => {
    window.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('click', handleClick);
  };
}
