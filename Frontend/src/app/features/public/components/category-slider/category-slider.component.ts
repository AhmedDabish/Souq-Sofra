import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../../core/models/models';

@Component({
  selector: 'app-category-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-[1500px] mx-auto px-3 sm:px-6 py-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-black font-baloo text-[#681c0f]">أقسام منيو سوق وسفرة</h2>
        <span class="text-xs sm:text-sm font-bold text-[#f47621] cursor-pointer hover:underline">عرض جميع الأقسام</span>
      </div>

      <!-- Scrollable horizontal category badges matching More-In -->
      <div class="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        <button 
          (click)="selectCategory(0)"
          [class]="selectedId === 0 
            ? 'bg-[#f47621] text-white border-[#f47621] shadow-md' 
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#fbb042]'"
          class="shrink-0 px-5 py-2.5 rounded-full border text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm">
          <span>🍽</span>
          <span>الكل</span>
        </button>

        @for (cat of categories; track cat.categoryId) {
          <button 
            (click)="selectCategory(cat.categoryId)"
            [class]="selectedId === cat.categoryId 
              ? 'bg-[#f47621] text-white border-[#f47621] shadow-md' 
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#fbb042]'"
            class="shrink-0 px-4 py-2 rounded-full border text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-xs group">
            <span class="w-7 h-7 rounded-full bg-[#fff7ec] group-hover:bg-[#fbb042]/30 flex items-center justify-center text-xs">
              🥐
            </span>
            <span>{{ cat.nameAr }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class CategorySliderComponent {
  @Input() categories: Category[] = [];
  @Input() selectedId: number = 0;
  @Output() categorySelected = new EventEmitter<number>();

  selectCategory(id: number) {
    this.categorySelected.emit(id);
  }
}
