# 🍲 سوق وسفرة (Souq & Sofra) - مطعم ومخبز

منصة إلكترونية احترافية متكاملة لمطعم ومخبز **سوق وسفرة** (Good Food, Good Mood)، تتضمن واجهة متجر تفاعلية للعملاء مطابقة لتصميم وتجربة موقع More-In، بالإضافة إلى لوحة تحكم إدارية معزولة وشاملة.

---

## 🚀 كيفية تشغيل المشروع وقاعدة البيانات عبر الـ Migration

قاعدة البيانات مبنية بنظام **Entity Framework Core 8 Code-First Migrations**. لديك طريقتان سهلتان لتطبيق الـ Migration وإنشاء الجداول والبيانات:

### الخيار الأول: التشغيل المباشر (Auto-Migration & Seeding) ✨
عند تشغيل الباك إند لأول مرة، يقوم التطبيق تلقائياً في `Program.cs` بفحص قاعدة البيانات وتطبيق كافة الـ Migrations ثم تحميل بيانات المنيو الأصلية والفروع والإعدادات وحسابات الأدوار التي زُوّدت كلمات مرورها محلياً:
1. تأكد من أن سيرفر الـ SQL Server يعمل على جهازك.
2. عدّل سلسلة الاتصال في `Backend/SouqSofra.API/appsettings.json` إذا لزم الأمر:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=SouqSofraDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
3. شغّل الباك إند:
   ```bash
   cd Backend/SouqSofra.API
   dotnet run
   ```
   سيتم إنشاء قاعدة بيانات `SouqSofraDb` وجميع الجداول والبيانات فوراً!

---

### الخيار الثاني: تطبيق الـ Migration يدوياً عبر الـ CLI أو Visual Studio

#### من خلال الـ Terminal (CLI):
من مجلد `Backend/SouqSofra.API`:
```bash
dotnet ef database update --project ../SouqSofra.Infrastructure --startup-project .
```

#### أو من داخل Visual Studio (Package Manager Console):
1. افتح نافذة `Tools -> NuGet Package Manager -> Package Manager Console`.
2. اختر `Default project: SouqSofra.Infrastructure`.
3. اكتب الأمر:
   ```powershell
   Update-Database
   ```

*(إذا أردت إضافة Migration جديد مستقبلاً:)*
```bash
dotnet ef migrations add <MigrationName> --project ../SouqSofra.Infrastructure --startup-project SouqSofra.API
```

---

### 3. تشغيل الفرونت إند (Angular 18+)
1. انتقل إلى مجلد الفرونت إند:
   ```bash
   cd Frontend
   ```
2. قم بتثبيت الاعتماديات:
   ```bash
   npm install
   ```
3. شغل التطبيق:
   ```bash
   npm start
   ```
   التطبيق سيعمل على: `http://localhost:4200`

---

## 🔐 الحسابات الافتراضية والأدوار
يدعم النظام ثلاثة أدوار: `Admin` و`SuperAdmin` و`User`. عند ضبط كلمات مرورها محلياً، ينشئ بدء تشغيل الباك إند الحسابات التالية تلقائياً:

| الدور | البريد الافتراضي |
|---|---|
| Admin | `admin@souqsofra.com` |
| SuperAdmin | `superadmin@souqsofra.com` |
| User | `user@souqsofra.com` |

لا توجد كلمات مرور افتراضية داخل المستودع. لتجهيزها على جهاز التطوير، من مجلد `Backend/SouqSofra.API` فعّل User Secrets مرة واحدة ثم أدخل كلمات مرور مختلفة وقوية (12 حرفاً على الأقل):

```bash
dotnet user-secrets init
dotnet user-secrets set "BootstrapUsers:Admin:Password" "ضع-كلمة-مرور-قوية-هنا"
dotnet user-secrets set "BootstrapUsers:SuperAdmin:Password" "ضع-كلمة-مرور-مختلفة-هنا"
dotnet user-secrets set "BootstrapUsers:User:Password" "ضع-كلمة-مرور-مختلفة-هنا"
```

بعدها شغّل الباك إند؛ تُخزّن كلمات المرور كـ hashes، ولا تُعاد كتابة كلمة مرور حساب موجود. في بيئة النشر تُمرّر القيم كمتغيرات بيئة مثل `BootstrapUsers__Admin__Password`، ولا تضعها في `appsettings.json` أو Git. رابط لوحة الإدارة: `http://localhost:4200/admin`.

---

## 📞 بيانات المطعم الرسمية
- **الموقع:** أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين.
- **الهاتف:** 02 633 3136
- **الواتساب:** +971 50 315 7884
