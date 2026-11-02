import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly key = 'souq-sofra-language';
  readonly isEnglish = signal(typeof localStorage !== 'undefined' && localStorage.getItem(this.key) === 'en');

  toggle() {
    this.isEnglish.update(value => !value);
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.key, this.isEnglish() ? 'en' : 'ar');
  }
}
