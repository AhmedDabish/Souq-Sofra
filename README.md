# 🍲 سوق وسفرة (Souq & Sofra) - مطعم ومخبز

منصة إلكترونية احترافية متكاملة لمطعم ومخبز **سوق وسفرة** (Good Food, Good Mood)، تتضمن واجهة متجر تفاعلية للعملاء مطابقة لتصميم وتجربة موقع More-In، بالإضافة إلى لوحة تحكم إدارية معزولة وشاملة.

---

## 🚀 كيفية تشغيل المشروع وقاعدة البيانات عبر الـ Migration

قاعدة البيانات مبنية بنظام **Entity Framework Core 8 Code-First Migrations**. لديك طريقتان سهلتان لتطبيق الـ Migration وإنشاء الجداول والبيانات:

### الخيار الأول: التشغيل المباشر (Auto-Migration & Seeding) ✨
عند تشغيل الباك إند لأول مرة، يقوم التطبيق تلقائياً في `Program.cs` بفحص قاعدة البيانات وتطبيق كافة الـ Migrations ثم تحميل بيانات المنيو الأصلية، الفروع، الإعدادات، وحساب الأدمن تلقائياً:
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

## 🔐 بيانات الدخول الافتراضية للوحة التحكم (Admin)
- **رابط لوحة التحكم:** `http://localhost:4200/admin`
- **البريد الإلكتروني:** `admin@souqsofra.com`
- **كلمة المرور:** `Admin@123456`

---

## 📞 بيانات المطعم الرسمية
- **الموقع:** أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين.
- **الهاتف:** 02 633 3136
- **الواتساب:** +971 50 315 7884
