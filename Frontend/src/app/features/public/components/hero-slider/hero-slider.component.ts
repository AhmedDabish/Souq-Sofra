import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';
import { ApiService } from '../../../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="container-wide mx-auto px-2 md:px-4 pt-4 sm:pt-6">
      <div class="relative w-full aspect-[2/1] sm:aspect-[1500/390] rounded-2xl lg:rounded-[32px] overflow-hidden bg-[#681c0f] shadow-sm">
        @for (slide of slides; track slide.image; let i = $index) {
          <div class="absolute inset-0 transition-opacity duration-700" [class.opacity-100]="activeIndex() === i" [class.opacity-0]="activeIndex() !== i" [class.pointer-events-none]="activeIndex() !== i">
            <img [src]="slide.image" [alt]="language.isEnglish() ? slide.titleEn : slide.alt" class="absolute inset-0 w-full h-full object-cover">
            <div [class.bg-gradient-to-l]="!language.isEnglish()" [class.bg-gradient-to-r]="language.isEnglish()" class="absolute inset-0 from-[#20130d]/75 via-[#20130d]/20 to-transparent"></div>
            <div [class.right-0]="!language.isEnglish()" [class.left-0]="language.isEnglish()" [class.text-right]="!language.isEnglish()" [class.text-left]="language.isEnglish()" class="absolute inset-y-0 z-10 w-full md:w-[58%] flex flex-col justify-center p-5 sm:p-10 lg:p-16 text-white">
              <span class="inline-flex self-start md:self-end rounded-full bg-[#f47621] px-3 py-1 text-[10px] sm:text-xs font-bold shadow">{{ language.t('طازج يومياً من سوق وسفرة', 'Fresh every day from Souq & Sofra') }}</span>
              <h1 class="mt-3 text-xl sm:text-3xl lg:text-5xl font-black font-baloo leading-tight max-w-2xl">{{ language.isEnglish() ? slide.titleEn : slide.title }}</h1>
              <p class="mt-2 sm:mt-3 text-[11px] sm:text-sm lg:text-base text-white/90 max-w-xl leading-relaxed">{{ language.isEnglish() ? slide.subtitleEn : slide.subtitle }}</p>
              <div class="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                <a href="/menu" class="rounded-full bg-[#f47621] hover:bg-[#e66b1c] text-white text-[11px] sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 shadow transition-colors">{{ language.t('اكتشف المنيو', 'Explore the menu') }}</a>
                <a href="tel:026333136" class="rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 backdrop-blur">{{ language.t('اتصل بنا', 'Contact us') }}</a>
              </div>
            </div>
          </div>
        }
        <button type="button" (click)="previous()" [attr.aria-label]="language.t('الصورة السابقة', 'Previous slide')" class="absolute z-20 left-3 sm:left-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 text-[#681c0f] hover:bg-white shadow flex items-center justify-center">‹</button>
        <button type="button" (click)="next()" [attr.aria-label]="language.t('الصورة التالية', 'Next slide')" class="absolute z-20 right-3 sm:right-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 text-[#681c0f] hover:bg-white shadow flex items-center justify-center">›</button>
        <div class="absolute z-20 bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          @for (slide of slides; track slide.image; let i = $index) { <button type="button" (click)="activeIndex.set(i)" [attr.aria-label]="language.t('الانتقال إلى الشريحة', 'Go to slide') + ' ' + (i + 1)" [class]="activeIndex() === i ? 'h-2 w-6 rounded-full bg-white transition-all' : 'h-2 w-2 rounded-full bg-white/60 transition-all'"></button> }
        </div>
      </div>
    </section>
  `
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  language = inject(LanguageService);
  activeIndex = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  slides = [
    { image: 'assets/banners/banner-1.jpg', alt: 'أطباق سوق وسفرة الطازجة', title: 'سفرة عامرة.. بطعم أصيل', titleEn: 'A table full of authentic flavor', subtitle: 'اختار من أشهى الأطباق والمخبوزات، ونحضّر طلبك طازج بكل حب.', subtitleEn: 'Choose from our favorite dishes and baked goods, freshly prepared with care.' },
    { image: 'assets/banners/banner-2.jpg', alt: 'وجبات متنوعة من سوق وسفرة', title: 'كل اللي بتحبه.. في مكان واحد', titleEn: 'Everything you love, all in one place', subtitle: 'من الفطائر والمخبوزات إلى الوجبات اليومية، تجربة تناسب كل سفرة.', subtitleEn: 'From feteer and bakery favorites to everyday meals, there is something for every table.' },
    { image: 'assets/banners/banner-3.jpg', alt: 'وجبات طازجة من مطعم سوق وسفرة', title: 'اختار وجبتك واطلبها بسهولة', titleEn: 'Choose your meal and order with ease', subtitle: 'تصفح القائمة، أضف اختياراتك للسلة، واستمتع بطلبك من سوق وسفرة.', subtitleEn: 'Browse the menu, add your favorites to the cart, and enjoy your Souq & Sofra order.' }
  ];

  ngOnInit() {
    this.api.getSettings().subscribe({ next: settings => {
      this.slides = this.slides.map((slide, i) => {
        const url = settings[`HeroBanner${i + 1}`];
        return url ? { ...slide, image: this.imageUrl(url) } : slide;
      });
    }, error: () => {} });
    this.timer = setInterval(() => this.next(), 5500);
  }
  private imageUrl(url: string): string {
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }
  ngOnDestroy() { if (this.timer) clearInterval(this.timer); }
  next() { this.activeIndex.update(i => (i + 1) % this.slides.length); }
  previous() { this.activeIndex.update(i => (i - 1 + this.slides.length) % this.slides.length); }
}
