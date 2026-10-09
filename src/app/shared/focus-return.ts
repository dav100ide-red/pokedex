import { DOCUMENT, inject } from '@angular/core';

/**
 * Remembers the focused element (usually the button that opened an overlay) and focuses it again
 * once the overlay closes: PrimeNG dialogs do not restore focus on their own.
 * Must be called in an injection context.
 */
export function injectFocusReturn() {
  const document = inject(DOCUMENT);
  let target: HTMLElement | null = null;

  return {
    capture(): void {
      target = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    restore(): void {
      if (target?.isConnected) {
        target.focus();
      }
      target = null;
    },
  };
}
