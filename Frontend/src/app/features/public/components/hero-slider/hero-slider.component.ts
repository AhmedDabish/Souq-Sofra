import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-6">
      <div class="relative w-full aspect-[21/9] sm:aspect-[25/8] rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-[#2d2013] to-[#4a3520] flex items-center">
        
        <!-- Slide Content -->
        <div class="relative z-10 px-6 sm:px-16 text-white max-w-2xl space-y-3 sm:space-y-4">
          <span class="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs sm:text-sm font-bold">
            مخبوزات وفطائر طازجة يومياً
          </span>
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-black font-baloo leading-tight">
            طعم زمان وسفرة زمان بأصالة سوق وسفرة
          </h1>
          <p class="text-sm sm:text-base text-gray-300 font-medium">
            تذوق أشهى الفطائر المشلتتة بالسمن البلدي، المناقيش التركية، وحواوشي على أصوله من فرننا مباشرة إلى سفرتك.
          </p>
          <div class="pt-2 flex gap-3">
            <a href="#menu-section" class="px-6 py-2.5 rounded-full bg-primary hover:bg-primaryHover text-white font-bold text-sm shadow-lg transition-transform active:scale-95">
              تصفح المنيو الآن
            </a>
            <a href="tel:026333136" class="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm transition-colors">
              اتصل بنا 02 633 3136
            </a>
          </div>
        </div>

        <!-- Background Decorative Element / Image -->
        <div class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style="background-image: url('assets/Souq_Sofra_Menu.png');"></div>
        <div class="absolute left-8 top-1/2 -translate-y-1/2 hidden md:block w-72 h-72 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl opacity-90">
          <img src="assets/MAIN.jpg" alt="Logo" class="w-full h-full object-cover">
        </div>

      </div>
    </div>
  `
})
export class HeroSliderComponent {}
