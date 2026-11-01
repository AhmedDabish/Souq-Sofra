# 🍲 سوق وسفرة (Souq & Sofra) - مطعم ومخبز

منصة إلكترونية احترافية متكاملة لمطعم ومخبز **سوق وسفرة** (Good Food, Good Mood)، تتضمن واجهة متجر تفاعلية للعملاء مطابقة لتصميم وتجربة موقع More-In، بالإضافة إلى لوحة تحكم إدارية معزولة وشاملة.

---

## 🚀 كيفية تشغيل المشروع محلياً

### 1. قاعدة البيانات (SQL Server)
1. افتح **SQL Server Management Studio (SSMS)** أو **Azure Data Studio**.
2. نفذ السكريبت الأول لإنشاء الجداول:
   ```sql
   database/01_Schema.sql
   ```
3. نفذ السكريبت الثاني لتحميل كافة تصنيفات ومنتجات المنيو الأصلية:
   ```sql
   database/02_SeedData.sql
   ```

### 2. الباك إند (.NET 8 Web API)
1. انتقل إلى مجلد الباك إند:
   ```bash
   cd Backend/SouqSofra.API
   ```
2. تأكد من ضبط سلسلة الاتصال في `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=SouqSofraDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
3. For JWT signing, do not use a committed key. Set the `Jwt__Key` environment variable (or use .NET User Secrets) to a strong private value before running the API. The value in `appsettings.json` is only a placeholder.
4. شغل السيرفر:
   ```bash
   dotnet restore
   dotnet run
   ```
   الـ API سيعمل حسب `Properties/launchSettings.json` على `https://localhost:2810` أو `http://localhost:2811` (Swagger متاح على `/swagger`).

### 3. الفرونت إند (Angular 18+)
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
