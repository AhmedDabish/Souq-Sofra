import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Category } from '../../../../core/models/models';

@Component({
  selector: 'app-category-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="widget-container">
      <section class="container-wide widget-spacing my-6 md:my-10">
        <!-- Header: Title + View All Link (More-In exact match) -->
        <div class="flex items-center justify-between widget-content-spacing mb-4 sm:mb-6">
          <h2 class="theme-title text-xl sm:text-2xl lg:text-3xl font-extrabold text-primaryDark">
            {{ title }}
          </h2>
          @if (showViewAll) {
            <a
              routerLink="/menu"
              class="bg-gray text-primary px-4 py-2 rounded-full font-medium text-xs sm:text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors duration-200 shrink-0">
              {{ isEnglish ? 'View all' : 'عرض الكل' }}
            </a>
          }
        </div>

        <!-- Carousel Container with More-In style & navigation buttons -->
        <div class="relative group/swiper w-full select-none" dir="ltr">

          <!-- Scrollable Track (RTL) -->
          <div
            #sliderRef
            (scroll)="onScroll()"
            (scrollend)="onScroll()"
            class="flex snap-x snap-mandatory gap-2.5 overscroll-x-contain overflow-x-auto scroll-smooth py-2 px-4 touch-pan-x sm:gap-3 sm:px-5 items-stretch" dir="ltr">

            <!-- "All" (جميع الأقسام) Category Card -->
            <div [attr.dir]="isEnglish ? 'ltr' : 'rtl'" class="w-[135px] shrink-0 snap-start sm:w-[150px] h-auto">
              <div
                role="button"
                tabindex="0"
                (click)="selectCategory(0)"
                (keydown.enter)="selectCategory(0)"
                [class.active]="selectedId === 0"
                class="w-full flex flex-col justify-between items-center bg-gray h-full hover:bg-primaryDark/10 px-3 py-2 sm:py-3 theme-rounded transition-all duration-300 group cursor-pointer border-b-3 border-transparent hover:border-primaryDark hover:shadow-sm category-card">

                <div class="py-1 relative transition-transform duration-300 rounded-[inherit] group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-6 flex items-center justify-center category-img">
                  <div class="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full bg-[#fdefd8] border-2 border-[#fdefd8] group-hover:border-primary/30 flex items-center justify-center p-2 transition-all">
                    <img
                      src="https://morein-pro.fsn1.your-objectstorage.com/categories-image/bcedef61-639b-4d93-8e49-e9d974586a8f.png"
                      [alt]="isEnglish ? 'All categories' : 'جميع الأقسام'"
                      loading="lazy"
                      class="object-contain w-full h-full rounded-[inherit]" />
                  </div>
                </div>

                <h3 class="pb-2 2xl:text-base text-xs sm:text-sm text-primaryDark transition-colors text-center category-card-text font-bold mt-2">
                  {{ isEnglish ? 'All categories' : 'جميع الأقسام' }}
                </h3>
              </div>
            </div>

            <!-- Dynamic Category Cards from Backend -->
            @for (cat of categories; track cat.categoryId) {
              <div [attr.dir]="isEnglish ? 'ltr' : 'rtl'" class="w-[135px] shrink-0 snap-start sm:w-[150px] h-auto">
                <div
                  role="button"
                  tabindex="0"
                  (click)="selectCategory(cat.categoryId)"
                  (keydown.enter)="selectCategory(cat.categoryId)"
                  [class.active]="selectedId === cat.categoryId"
                  class="w-full flex flex-col justify-between items-center bg-gray h-full hover:bg-primaryDark/10 px-3 py-2 sm:py-3 theme-rounded transition-all duration-300 group cursor-pointer border-b-3 border-transparent hover:border-primaryDark hover:shadow-sm category-card">

                  <div class="py-1 relative transition-transform duration-300 rounded-[inherit] group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-6 flex items-center justify-center category-img">
                    <div class="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full bg-[#fdefd8] border-2 border-[#fdefd8] group-hover:border-primary/30 flex items-center justify-center p-2 transition-all">
                      <img
                        [src]="getCategoryImage(cat)"
                        [alt]="isEnglish ? (cat.nameEn || cat.nameAr) : cat.nameAr"
                        loading="lazy"
                        (error)="onImageError($event, cat)"
                        class="object-contain w-full h-full rounded-[inherit]" />
                    </div>
                  </div>

                  <h3 class="pb-2 2xl:text-base text-xs sm:text-sm text-primaryDark transition-colors text-center category-card-text font-bold mt-2 truncate max-w-full px-1" [title]="isEnglish ? (cat.nameEn || cat.nameAr) : cat.nameAr">
                    {{ isEnglish ? (cat.nameEn || cat.nameAr) : cat.nameAr }}
                  </h3>
                </div>
              </div>
            }
          </div>

          <!-- Carousel Navigation Buttons matching More-In -->
          <!-- In RTL: Prev is on the Right (scrolls towards start) -->
          <button
            type="button"
            (click)="scrollPrev()"
            [disabled]="isAtStart"
            class="cursor-pointer cat-swiper-prev absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-primary transition-all duration-300 opacity-100 md:opacity-0 md:group-hover/swiper:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed pointer-events-auto"
            [attr.aria-label]="isEnglish ? 'Previous categories' : 'الأقسام السابقة'">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 rtl:rotate-180">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <!-- In RTL: Next is on the Left (scrolls towards end) -->
          <button
            type="button"
            (click)="scrollNext()"
            [disabled]="isAtEnd"
            class="cursor-pointer cat-swiper-next absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-primary transition-all duration-300 opacity-100 md:opacity-0 md:group-hover/swiper:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed pointer-events-auto"
            [attr.aria-label]="isEnglish ? 'Next categories' : 'الأقسام التالية'">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 rtl:rotate-180">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

        </div>
      </section>
    </div>
  `
})
export class CategorySliderComponent implements AfterViewInit, OnChanges {
  @Input() categories: Category[] = [];
  @Input() selectedId: number = 0;
  @Input() showViewAll: boolean = true;
  @Input() title: string = 'أقسام منيو سوق وسفرة';
  @Input() isEnglish = false;
  @Output() categorySelected = new EventEmitter<number>();

  @ViewChild('sliderRef') sliderRef?: ElementRef<HTMLDivElement>;

  isAtStart = true;
  isAtEnd = false;

  private readonly MOREIN_IMAGES: { [key: string]: string } = {
    'offers': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/bcedef61-639b-4d93-8e49-e9d974586a8f.png',
    'chicken': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/classic-chicken.png',
    'wraps': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/chicken.png',
    'meat': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/meat.png',
    'hawawshi': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/fb79cbea-e413-4089-b37e-4aa3e89131e3.png',
    'seafood': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/sea-food.png',
    'salads': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/salad-1.png',
    'appetizers': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/appetizer.png',
    'desserts': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/deserts.png',
    'drinks': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/drinks.png',
    'kids': 'https://morein-pro.fsn1.your-objectstorage.com/categories-image/kids-meal.png'
  };

  ngAfterViewInit() {
    // Wait until Angular completes the initial view check before changing the
    // button disabled bindings based on the rendered track dimensions.
    requestAnimationFrame(() => this.updateScrollState());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categories']) {
      requestAnimationFrame(() => this.updateScrollState());
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollState();
  }

  onScroll() {
    this.updateScrollState();
  }

  selectCategory(id: number) {
    this.categorySelected.emit(id);
  }

  scrollNext() {
    const el = this.sliderRef?.nativeElement;
    if (!el) return;
    const step = Math.max(240, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: step, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 450);
  }

  scrollPrev() {
    const el = this.sliderRef?.nativeElement;
    if (!el) return;
    const step = Math.max(240, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: -step, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 450);
  }

  updateScrollState() {
    const el = this.sliderRef?.nativeElement;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 5) {
      this.isAtStart = true;
      this.isAtEnd = true;
      return;
    }
    const current = Math.min(maxScroll, Math.max(0, el.scrollLeft));
    this.isAtStart = current <= 10;
    this.isAtEnd = current >= maxScroll - 15;
  }

  getCategoryImage(cat: Category): string {
    const url = cat.imageUrl || cat.iconUrl;
    if (!url) {
      return this.getDefaultFallback(cat);
    }
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('assets/')) {
      return url;
    }
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  onImageError(event: Event, cat: Category) {
    const img = event.target as HTMLImageElement;
    if (img) {
      const fallback = this.getDefaultFallback(cat);
      if (img.src !== fallback) {
        img.src = fallback;
      }
    }
  }

  private getDefaultFallback(cat: Category): string {
    const slug = (cat.slug || '').toLowerCase();
    const name = (cat.nameAr || '').toLowerCase();

    if (slug.includes('pide') || name.includes('تركية') || name.includes('بيتزا')) return this.MOREIN_IMAGES['chicken'];
    if (slug.includes('manakeesh') || name.includes('مناقيش')) return this.MOREIN_IMAGES['chicken'];
    if (slug.includes('wrap') || name.includes('راب')) return this.MOREIN_IMAGES['wraps'];
    if (slug.includes('pastr') || name.includes('معجنات')) return this.MOREIN_IMAGES['chicken'];
    if (slug.includes('salad') || name.includes('سلط') || name.includes('مقبلات')) return this.MOREIN_IMAGES['salads'];
    if (slug.includes('hawawshi') || name.includes('حواوشي')) return this.MOREIN_IMAGES['hawawshi'];
    if (slug.includes('baladi') || name.includes('بلدي') || name.includes('لحم')) return this.MOREIN_IMAGES['meat'];
    if (slug.includes('on-the-go') || name.includes('ماشي')) return this.MOREIN_IMAGES['wraps'];
    if (slug.includes('bread') || name.includes('خبز')) return this.MOREIN_IMAGES['chicken'];
    if (slug.includes('cookie') || name.includes('مخبوزات')) return this.MOREIN_IMAGES['desserts'];
    if (slug.includes('box') || name.includes('بوكس')) return this.MOREIN_IMAGES['kids'];
    if (slug.includes('wholegrain') || name.includes('كاملة')) return this.MOREIN_IMAGES['chicken'];
    if (slug.includes('sweet') || name.includes('حلو')) return this.MOREIN_IMAGES['desserts'];
    if (slug.includes('feteer') || name.includes('فطير')) return this.MOREIN_IMAGES['chicken'];
    if (slug.includes('drink') || name.includes('مشروب')) return this.MOREIN_IMAGES['drinks'];

    return this.MOREIN_IMAGES['offers'];
  }
}
