import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly key = 'souq-sofra-language';
  private readonly document = inject(DOCUMENT);
  readonly isEnglish = signal(this.readSavedLanguage());

  constructor() {
    effect(() => {
      const english = this.isEnglish();
      this.document.documentElement.lang = english ? 'en' : 'ar';
      this.document.documentElement.dir = english ? 'ltr' : 'rtl';
    });
  }

  private readSavedLanguage(): boolean {
    try { return typeof localStorage !== 'undefined' && localStorage.getItem(this.key) === 'en'; } catch { return false; }
  }

  t(arabic: string, english: string): string { return this.isEnglish() ? english : arabic; }

  toggle() {
    this.isEnglish.update(value => !value);
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.key, this.isEnglish() ? 'en' : 'ar'); } catch { /* Language still switches for this session. */ }
  }
}
