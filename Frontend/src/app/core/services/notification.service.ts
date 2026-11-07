import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationMessage {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  current = signal<NotificationMessage | null>(null);
  confirmation = signal<{ message: string; resolve: (confirmed: boolean) => void } | null>(null);
  private nextId = 0;
  private dismissTimer?: ReturnType<typeof setTimeout>;

  show(message: string, type: NotificationType = 'success', duration = 3800): void {
    if (!message) return;
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    const notification = { id: ++this.nextId, type, message };
    this.current.set(notification);
    this.dismissTimer = setTimeout(() => {
      if (this.current()?.id === notification.id) this.current.set(null);
    }, duration);
  }

  dismiss(): void {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.current.set(null);
  }

  confirm(message: string): Promise<boolean> {
    if (this.confirmation()) return Promise.resolve(false);
    return new Promise(resolve => this.confirmation.set({ message, resolve }));
  }

  resolveConfirmation(confirmed: boolean): void {
    const pending = this.confirmation();
    if (!pending) return;
    this.confirmation.set(null);
    pending.resolve(confirmed);
  }
}
