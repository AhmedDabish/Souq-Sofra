import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-notification-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notifications.current(); as notice) {
      <div class="fixed inset-x-4 top-4 z-[200] mx-auto flex max-w-md justify-center sm:inset-x-auto sm:end-5 sm:mx-0" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
        <div role="status" aria-live="polite" class="flex w-full items-start gap-3 rounded-2xl border bg-white/95 p-4 shadow-[0_18px_55px_-22px_rgba(35,22,12,.45)] backdrop-blur-xl animate-[notification-in_.2s_ease-out]"
             [class.border-emerald-200]="notice.type === 'success'" [class.border-rose-200]="notice.type === 'error'" [class.border-sky-200]="notice.type === 'info'">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-black" [class.bg-emerald-50]="notice.type === 'success'" [class.text-emerald-700]="notice.type === 'success'" [class.bg-rose-50]="notice.type === 'error'" [class.text-rose-700]="notice.type === 'error'" [class.bg-sky-50]="notice.type === 'info'" [class.text-sky-700]="notice.type === 'info'">{{ notice.type === 'success' ? '✓' : notice.type === 'error' ? '!' : 'i' }}</span>
          <p class="min-w-0 flex-1 pt-1 text-sm font-semibold leading-6 text-slate-800">{{ notice.message }}</p>
          <button type="button" (click)="notifications.dismiss()" class="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" [attr.aria-label]="language.t('إغلاق التنبيه','Dismiss notification')">×</button>
        </div>
      </div>
    }
    @if (notifications.confirmation(); as prompt) {
      <div class="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" (click)="notifications.resolveConfirmation(false)">
        <section role="alertdialog" aria-modal="true" class="w-full max-w-sm rounded-3xl border border-white/60 bg-white p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl">⚠️</div>
          <h2 class="font-baloo text-lg font-black text-slate-900">{{ language.t('تأكيد الإجراء','Confirm action') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ prompt.message }}</p>
          <div class="mt-6 flex gap-3">
            <button type="button" (click)="notifications.resolveConfirmation(false)" class="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">{{ language.t('إلغاء','Cancel') }}</button>
            <button type="button" (click)="notifications.resolveConfirmation(true)" class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700">{{ language.t('تأكيد الحذف','Confirm delete') }}</button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`@keyframes notification-in { from { opacity: 0; transform: translateY(-8px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }`]
})
export class NotificationHostComponent {
  notifications = inject(NotificationService);
  language = inject(LanguageService);
  @HostListener('document:keydown.escape') onEscape(): void {
    if (this.notifications.confirmation()) this.notifications.resolveConfirmation(false);
    else this.notifications.dismiss();
  }
}
