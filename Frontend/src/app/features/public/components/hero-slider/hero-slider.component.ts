import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container-wide mx-auto px-2 md:px-4 pt-4 sm:pt-6">
      <div class="relative w-full aspect-[2/1] sm:aspect-[1500/390] rounded-2xl lg:rounded-[32px] overflow-hidden bg-[#681c0f] shadow-sm">
        @for (slide of slides; track slide.image; let i = $index) {
          <div class="absolute inset-0 transition-opacity duration-700" [class.opacity-100]="activeIndex() === i" [class.opacity-0]="activeIndex() !== i" [class.pointer-events-none]="activeIndex() !== i">
            <img [src]="slide.image" [alt]="slide.alt" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-l from-[#20130d]/75 via-[#20130d]/20 to-transparent"></div>
            <div class="absolute inset-y-0 right-0 z-10 w-full md:w-[58%] flex flex-col justify-center text-right p-5 sm:p-10 lg:p-16 text-white">
              <span class="inline-flex self-start md:self-end rounded-full bg-[#f47621] px-3 py-1 text-[10px] sm:text-xs font-bold shadow">طازج يومياً من سوق وسفرة</span>
              <h1 class="mt-3 text-xl sm:text-3xl lg:text-5xl font-black font-baloo leading-tight max-w-2xl">{{ slide.title }}</h1>
              <p class="mt-2 sm:mt-3 text-[11px] sm:text-sm lg:text-base text-white/90 max-w-xl leading-relaxed">{{ slide.subtitle }}</p>
              <div class="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                <a href="/menu" class="rounded-full bg-[#f47621] hover:bg-[#e66b1c] text-white text-[11px] sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 shadow transition-colors">اكتشف المنيو</a>
                <a href="tel:026333136" class="rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 backdrop-blur">اتصل بنا</a>
              </div>
            </div>
          </div>
        }
        <button type="button" (click)="previous()" aria-label="الصورة السابقة" class="absolute z-20 left-3 sm:left-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 text-[#681c0f] hover:bg-white shadow flex items-center justify-center">‹</button>
        <button type="button" (click)="next()" aria-label="الصورة التالية" class="absolute z-20 right-3 sm:right-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 text-[#681c0f] hover:bg-white shadow flex items-center justify-center">›</button>
        <div class="absolute z-20 bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          @for (slide of slides; track slide.image; let i = $index) { <button type="button" (click)="activeIndex.set(i)" [attr.aria-label]="'الانتقال إلى الشريحة ' + (i + 1)" [class]="activeIndex() === i ? 'h-2 w-6 rounded-full bg-white transition-all' : 'h-2 w-2 rounded-full bg-white/60 transition-all'"></button> }
        </div>
      </div>
    </section>
  `
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  activeIndex = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  slides = [
    { image: 'assets/banners/banner-1.jpg', alt: 'أطباق سوق وسفرة الطازجة', title: 'سفرة عامرة.. بطعم أصيل', subtitle: 'اختار من أشهى الأطباق والمخبوزات، ونحضّر طلبك طازج بكل حب.' },
    { image: 'assets/banners/banner-2.jpg', alt: 'وجبات متنوعة من سوق وسفرة', title: 'كل اللي بتحبه.. في مكان واحد', subtitle: 'من الفطائر والمخبوزات إلى الوجبات اليومية، تجربة تناسب كل سفرة.' },
    { image: 'assets/banners/banner-3.jpg', alt: 'وجبات طازجة من مطعم سوق وسفرة', title: 'اختار وجبتك واطلبها بسهولة', subtitle: 'تصفح القائمة، أضف اختياراتك للسلة، واستمتع بطلبك من سوق وسفرة.' }
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
