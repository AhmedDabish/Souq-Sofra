import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, DeveloperLogFile } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

type LogRow = {
  timestamp: string;
  eventType: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  traceId: string;
  exceptionType: string;
  exceptionMessage: string;
  stackTrace: string;
  commandText: string;
};

@Component({
  selector: 'app-developer-logs', standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-[#f7f8fa] font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'"><app-admin-sidebar />
      <main class="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:mr-64 lg:px-8">
        <header class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-900"><span class="h-2 w-2 rounded-full bg-amber-500"></span>{{ language.t('للمطور فقط', 'Developer access only') }}</div>
            <h1 class="text-2xl font-black text-slate-900 sm:text-3xl">{{ language.t('ملفات السجلات', 'System logs') }}</h1>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{{ language.t('اختر الفترة ونزّل سجلات النظام في ملف Excel. يحتوي الملف على تفاصيل أخطاء الطلبات واستعلامات قاعدة البيانات، فاحتفظ به بأمان.', 'Choose a date range and download system logs as an Excel workbook. Logs may include error details and database queries, so store the file securely.') }}</p>
          </div>
          <button type="button" (click)="loadFiles()" [disabled]="loading() || exporting()" class="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-orange-200 disabled:opacity-50 sm:self-auto">↻ {{ language.t('تحديث السجلات', 'Refresh logs') }}</button>
        </header>

        @if (error()) { <div class="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{{ error() }}</div> }
        <section class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div class="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
            <label class="text-xs font-bold text-slate-600">{{ language.t('من تاريخ', 'From date') }}
              <input type="date" [ngModel]="fromDate()" (ngModelChange)="fromDate.set($event || '')" [max]="toDate() || today" class="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
            </label>
            <label class="text-xs font-bold text-slate-600">{{ language.t('إلى تاريخ', 'To date') }}
              <input type="date" [ngModel]="toDate()" (ngModelChange)="toDate.set($event || '')" [min]="fromDate() || null" [max]="today" class="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400" />
            </label>
            <button type="button" (click)="loadFiles()" [disabled]="loading() || invalidRange()" class="min-h-11 rounded-xl bg-[#7c2d12] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-50">{{ loading() ? language.t('جارٍ البحث…', 'Searching…') : language.t('عرض الملفات', 'Find log files') }}</button>
          </div>
          @if (invalidRange()) { <p class="border-b border-rose-100 bg-rose-50 px-5 py-3 text-xs font-semibold text-rose-700">{{ language.t('حدد فترة صحيحة بحد أقصى 31 يومًا.', 'Choose a valid range of up to 31 days.') }}</p> }
          <div class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p class="text-sm font-extrabold text-slate-800">{{ files().length }} {{ language.t('ملف يومي متاح', 'daily log files available') }}</p><p class="mt-1 text-xs text-slate-500">{{ language.t('السجلات محفوظة على الخادم لمدة محدودة، والتحميل متاح لحساب المطور فقط.', 'Logs are retained on the server for a limited period; downloads are restricted to the Developer account.') }}</p></div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" (click)="selectAll()" [disabled]="!files().length || exporting()" class="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-orange-300 disabled:opacity-50">{{ selectedCount() === files().length && files().length ? language.t('إلغاء التحديد', 'Clear selection') : language.t('تحديد الكل', 'Select all') }}</button>
              <button type="button" (click)="exportSelected()" [disabled]="!selectedCount() || exporting()" class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">▦ {{ exporting() ? language.t('جارٍ تجهيز Excel…', 'Preparing Excel…') : language.t('تنزيل المحدد Excel', 'Download selected as Excel') }}</button>
            </div>
          </div>
          @if (loading() && !hasLoaded()) { <div class="p-10 text-center text-sm text-slate-500">{{ language.t('جارٍ تحميل قائمة السجلات…', 'Loading available logs…') }}</div> }
          @else if (!files().length) { <div class="p-10 text-center"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">▤</div><p class="font-bold text-slate-700">{{ language.t('لا توجد ملفات سجلات في الفترة المختارة.', 'No log files were found in the selected period.') }}</p><p class="mt-1 text-xs text-slate-500">{{ language.t('قد تكون السجلات غير مفعّلة أو انتهت مدة الاحتفاظ بها.', 'Logging may be disabled, or the retention period may have expired.') }}</p></div> }
          @else {
            <div class="divide-y divide-slate-100">
              @for (file of files(); track file.date) {
                <label class="flex cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-orange-50/40 sm:px-6">
                  <input type="checkbox" [checked]="isSelected(file.date)" (change)="toggleFile(file.date)" [disabled]="exporting()" class="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-300" />
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">▤</span>
                  <span class="min-w-0 flex-1"><span class="block text-sm font-extrabold text-slate-800">{{ formatDate(file.date) }}</span><span class="mt-1 block text-xs text-slate-500">api-{{ file.date }}.jsonl · {{ file.sizeBytes | number }} {{ language.t('بايت', 'bytes') }}</span></span>
                  <span class="hidden text-[11px] text-slate-400 sm:block">{{ language.t('آخر تحديث', 'Updated') }} {{ formatTime(file.lastModifiedUtc) }}</span>
                </label>
              }
            </div>
          }
          <div class="border-t border-slate-100 bg-amber-50/60 px-5 py-3 text-[11px] leading-5 text-amber-950/75">{{ language.t('تُجمع الملفات المحددة في مصنف Excel واحد. إذا لم تظهر سجلات SQL، فتحقق من إعدادات مجلد Logs وصلاحيات الكتابة على الخادم.', 'Selected daily files are combined into one Excel workbook. If SQL logs are missing, check the Logs directory and server write permissions.') }}</div>
        </section>
      </main>
    </div>
  `
})
export class DeveloperLogsComponent {
  language = inject(LanguageService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  today = this.localDate();
  fromDate = signal(this.daysAgo(6));
  toDate = signal(this.today);
  files = signal<DeveloperLogFile[]>([]);
  selectedDates = signal<Set<string>>(new Set());
  loading = signal(false);
  exporting = signal(false);
  error = signal('');
  hasLoaded = signal(false);
  invalidRange = computed(() => {
    const from = this.fromDate(), to = this.toDate();
    if (!from || !to || from > to) return true;
    return (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000 > 30;
  });
  selectedCount = computed(() => this.selectedDates().size);

  constructor() {
    if (!this.auth.isDeveloperAccount()) this.error.set(this.language.t('هذه الصفحة متاحة لحساب المطور فقط.', 'This page is available to the Developer account only.'));
    else this.loadFiles();
  }

  loadFiles(): void {
    if (!this.auth.isDeveloperAccount() || this.invalidRange() || this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.api.getDeveloperLogFiles(this.fromDate(), this.toDate()).subscribe({
      next: files => {
        this.files.set(files);
        this.selectedDates.set(new Set(files.map(file => file.date)));
        this.loading.set(false); this.hasLoaded.set(true);
      },
      error: error => {
        this.loading.set(false); this.hasLoaded.set(true); this.files.set([]); this.selectedDates.set(new Set());
        this.error.set(error?.status === 403
          ? this.language.t('الخادم رفض الوصول. تأكد أنك مسجل بحساب Developer الصحيح.', 'The server denied access. Sign in with the Developer account.')
          : this.language.t('تعذر تحميل ملفات السجلات. تحقق من اتصال الخادم.', 'Could not load log files. Check the server connection.'));
      }
    });
  }

  isSelected(date: string): boolean { return this.selectedDates().has(date); }
  toggleFile(date: string): void {
    this.selectedDates.update(current => { const next = new Set(current); next.has(date) ? next.delete(date) : next.add(date); return next; });
  }
  selectAll(): void {
    this.selectedDates.set(this.selectedDates().size === this.files().length ? new Set() : new Set(this.files().map(file => file.date)));
  }

  async exportSelected(): Promise<void> {
    if (!this.auth.isDeveloperAccount() || this.exporting() || !this.selectedCount()) return;
    this.exporting.set(true); this.error.set('');
    try {
      const dates = [...this.selectedDates()].sort();
      const rows: LogRow[] = [];
      for (const date of dates) {
        const text = await new Promise<string>((resolve, reject) => this.api.downloadDeveloperLog(date).subscribe({ next: resolve, error: reject }));
        for (const line of text.split(/\r?\n/)) {
          if (!line.trim()) continue;
          try { rows.push(this.toLogRow(JSON.parse(line), date)); } catch { rows.push(this.toLogRow({ exceptionMessage: line }, date)); }
        }
      }
      if (!rows.length) {
        this.error.set(this.language.t('الملفات المختارة لا تحتوي على سجلات.', 'The selected files contain no log entries.'));
        return;
      }
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Souq & Sofra Developer Logs'; workbook.created = new Date();
      const sheet = workbook.addWorksheet(this.language.t('السجلات', 'Logs').slice(0, 31), { views: [{ rightToLeft: !this.language.isEnglish(), state: 'frozen', ySplit: 1 }] });
      const headers = [
        this.language.t('التاريخ والوقت UTC', 'Timestamp UTC'), this.language.t('نوع السجل', 'Event type'),
        this.language.t('الطريقة', 'Method'), this.language.t('المسار', 'Path'), this.language.t('كود الحالة', 'Status code'),
        this.language.t('المدة (مللي ثانية)', 'Duration (ms)'), this.language.t('رقم التتبع', 'Trace ID'),
        this.language.t('نوع الخطأ', 'Exception type'), this.language.t('رسالة الخطأ', 'Exception message'),
        this.language.t('تفاصيل الخطأ', 'Stack trace'), this.language.t('استعلام قاعدة البيانات', 'Database command')
      ];
      sheet.columns = headers.map((header, index) => ({ header, key: String(index), width: [24, 15, 13, 36, 14, 18, 32, 34, 55, 70, 70][index], style: { alignment: { vertical: 'top', wrapText: true } } }));
      rows.forEach(row => sheet.addRow([row.timestamp, row.eventType, row.method, row.path, row.statusCode || '', row.durationMs || '', row.traceId, row.exceptionType, row.exceptionMessage, row.stackTrace, row.commandText]));
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
      sheet.getRow(1).height = 32;
      sheet.getRow(1).eachCell(cell => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C2D12' } }; cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `souq-sofra-logs-${dates[0]}-to-${dates[dates.length - 1]}.xlsx`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Developer log export failed', error);
      this.error.set(this.language.t('تعذر تنزيل السجلات أو إنشاء ملف Excel. حاول مرة أخرى.', 'Could not download logs or create the Excel file. Please try again.'));
    } finally { this.exporting.set(false); }
  }

  formatDate(date: string): string { return new Date(`${date}T00:00:00`).toLocaleDateString(this.language.isEnglish() ? 'en-AE' : 'ar-AE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }); }
  formatTime(value: string): string { return new Date(value).toLocaleTimeString(this.language.isEnglish() ? 'en-AE' : 'ar-AE', { hour: '2-digit', minute: '2-digit' }); }
  private toLogRow(value: unknown, fallbackDate: string): LogRow {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const get = (name: string): unknown => {
      const key = Object.keys(source).find(candidate => candidate.toLowerCase() === name.toLowerCase());
      return key ? source[key] : undefined;
    };
    const text = (name: string): string => {
      const item = get(name);
      return item === null || item === undefined ? '' : String(item);
    };
    return {
      timestamp: text('timestampUtc') || fallbackDate,
      eventType: text('eventType'), method: text('method'), path: text('path'),
      statusCode: Number(get('statusCode') || 0), durationMs: Number(get('durationMs') || 0),
      traceId: text('traceId'), exceptionType: text('exceptionType'), exceptionMessage: text('exceptionMessage'),
      stackTrace: text('stackTrace'), commandText: text('commandText')
    };
  }
  private localDate(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  private daysAgo(days: number): string { const d = new Date(); d.setDate(d.getDate() - days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
}
