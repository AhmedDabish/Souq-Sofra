using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SouqSofra.Application.Common;
using SouqSofra.Domain.Entities;

namespace SouqSofra.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context, IConfiguration configuration)
        {
            // 1. Auto-apply EF Core Migrations if relational
            try
            {
                if (context.Database.IsRelational())
                {
                    await context.Database.MigrateAsync();
                }
            }
            catch
            {
                // In environments where migration is run manually or permissions are constrained
            }

            // 2. Seed Default Site Settings
            if (!await context.SiteSettings.AnyAsync())
            {
                var settings = new List<SiteSetting>
                {
                    new() { SettingKey = "BrandNameAr", SettingValue = "سوق وسفرة", Description = "اسم المطعم بالعربية" },
                    new() { SettingKey = "BrandNameEn", SettingValue = "Souq & Sofra", Description = "Restaurant Brand Name English" },
                    new() { SettingKey = "SloganAr", SettingValue = "مطعم ومخبز - طعم أصيل، مزاج جميل", Description = "الشعار الترويجي بالعربية" },
                    new() { SettingKey = "SloganEn", SettingValue = "Bakery & Restaurant - Good Food, Good Mood", Description = "Slogan English" },
                    new() { SettingKey = "Phone", SettingValue = "02 633 3136", Description = "رقم الهاتف الموحد" },
                    new() { SettingKey = "WhatsApp", SettingValue = "+971 50 315 7884", Description = "رقم الواتساب للطلبات" },
                    new() { SettingKey = "AddressAr", SettingValue = "أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين", Description = "عنوان الفرع الرئيسي" },
                    new() { SettingKey = "AddressEn", SettingValue = "Abu Dhabi - Corniche - Opposite Al Madina Fresh Mart and Al Nilein Bank", Description = "Branch Address" },
                    new() { SettingKey = "CurrencyAr", SettingValue = "درهم", Description = "العملة بالعربية" },
                    new() { SettingKey = "CurrencyEn", SettingValue = "AED", Description = "Currency English" },
                    new() { SettingKey = "DeliveryFee", SettingValue = "10.00", Description = "رسوم التوصيل الثابتة" },
                    new() { SettingKey = "Announcement", SettingValue = "", Description = "شريط الإعلانات أعلى الموقع" }
                };
                await context.SiteSettings.AddRangeAsync(settings);
                await context.SaveChangesAsync();
            }

            // Clear the retired default promotion from existing databases without
            // overwriting any announcement that an administrator has since configured.
            var retiredAnnouncement = await context.SiteSettings.FirstOrDefaultAsync(setting =>
                setting.SettingKey == "Announcement" &&
                setting.SettingValue == "أهلاً بكم في مطعم ومخبز سوق وسفرة - خصم 15% على جميع الفطائر والمخبوزات الطازجة!");
            if (retiredAnnouncement is not null)
            {
                retiredAnnouncement.SettingValue = string.Empty;
                await context.SaveChangesAsync();
            }

            // 3. Seed Default Branch
            if (!await context.Branches.AnyAsync())
            {
                var branch = new Branch
                {
                    NameAr = "فرع الكورنيش - أبوظبي",
                    NameEn = "Corniche Branch - Abu Dhabi",
                    AddressAr = "أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين",
                    AddressEn = "Abu Dhabi - Corniche - Opposite Al Madina Fresh Mart and Al Nilein Bank",
                    Phone = "02 633 3136",
                    WhatsApp = "+971 50 315 7884",
                    Latitude = 24.492500m,
                    Longitude = 54.356200m,
                    IsActive = true
                };
                await context.Branches.AddAsync(branch);
                await context.SaveChangesAsync();
            }

            // 4. Seed default accounts for all three roles. Passwords are supplied
            // via local user-secrets or deployment environment variables, never source control.
            await SeedBootstrapUserAsync(context, configuration, "Admin", "admin@souqsofra.com", "مدير سوق وسفرة", 1);
            await SeedBootstrapUserAsync(context, configuration, "SuperAdmin", "superadmin@souqsofra.com", "مدير النظام", 3);
            await SeedBootstrapUserAsync(context, configuration, "User", "user@souqsofra.com", "مستخدم", 2);

            // 5. Seed Menu Categories
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new() { NameAr = "فطائر البيتزا التركية", NameEn = "Turkish Pide", Slug = "turkish-pide", DisplayOrder = 1, IconUrl = "assets/categories/pide.png" },
                    new() { NameAr = "المناقيش", NameEn = "Manakeesh", Slug = "manakeesh", DisplayOrder = 2, IconUrl = "assets/categories/manakeesh.png" },
                    new() { NameAr = "سندوتشات الراب", NameEn = "Signature Wraps", Slug = "signature-wraps", DisplayOrder = 3, IconUrl = "assets/categories/wraps.png" },
                    new() { NameAr = "المعجنات الصغيرة", NameEn = "Small Pastries", Slug = "small-pastries", DisplayOrder = 4, IconUrl = "assets/categories/pastries.png" },
                    new() { NameAr = "مقبلات وسلطات", NameEn = "Appetizers & Salads", Slug = "appetizers-salads", DisplayOrder = 5, IconUrl = "assets/categories/salads.png" },
                    new() { NameAr = "حواوشي وسندوتشات فينو", NameEn = "Hawawshi & Veno", Slug = "hawawshi-veno", DisplayOrder = 6, IconUrl = "assets/categories/hawawshi.png" },
                    new() { NameAr = "سندوتشات خبز بلدي", NameEn = "Baladi Sandwiches", Slug = "baladi-sandwiches", DisplayOrder = 7, IconUrl = "assets/categories/baladi.png" },
                    new() { NameAr = "سندوتشات ع الماشي", NameEn = "On The Go Sandwiches", Slug = "on-the-go", DisplayOrder = 8, IconUrl = "assets/categories/on-the-go.png" },
                    new() { NameAr = "تشكيلة الخبز الطازج", NameEn = "Fresh Breads", Slug = "fresh-breads", DisplayOrder = 9, IconUrl = "assets/categories/bread.png" },
                    new() { NameAr = "مخبوزات ونواشف 250 جم", NameEn = "Bakery & Cookies 250g", Slug = "bakery-cookies", DisplayOrder = 10, IconUrl = "assets/categories/cookies.png" },
                    new() { NameAr = "بوكسات السلاف والعزائم", NameEn = "Catering Boxes", Slug = "catering-boxes", DisplayOrder = 11, IconUrl = "assets/categories/boxes.png" },
                    new() { NameAr = "منتجات الحبة الكاملة", NameEn = "Whole Grain Line", Slug = "whole-grain", DisplayOrder = 12, IconUrl = "assets/categories/wholegrain.png" },
                    new() { NameAr = "البيتزا", NameEn = "Pizza", Slug = "pizza", DisplayOrder = 13, IconUrl = "assets/categories/pizza.png" },
                    new() { NameAr = "الفطير المشلتت", NameEn = "Feteer Meshaltet", Slug = "feteer-meshaltet", DisplayOrder = 14, IconUrl = "assets/categories/feteer.png" },
                    new() { NameAr = "الفطير الحلو", NameEn = "Sweet Feteer", Slug = "sweet-feteer", DisplayOrder = 15, IconUrl = "assets/categories/sweet-feteer.png" }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();

                // 6. Seed Products under categories
                var cPide = categories.First(c => c.Slug == "turkish-pide");
                var cManakeesh = categories.First(c => c.Slug == "manakeesh");
                var cWraps = categories.First(c => c.Slug == "signature-wraps");
                var cHawawshi = categories.First(c => c.Slug == "hawawshi-veno");
                var cFeteer = categories.First(c => c.Slug == "feteer-meshaltet");
                var cSweetFeteer = categories.First(c => c.Slug == "sweet-feteer");
                var cBoxes = categories.First(c => c.Slug == "catering-boxes");

                var products = new List<Product>
                {
                    // Turkish Pide
                    new() { CategoryId = cPide.CategoryId, NameAr = "فطيرة جبنة عكاوي تركية", NameEn = "Turkish Akkawi Cheese Pide", BasePrice = 18.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cPide.CategoryId, NameAr = "فطيرة سجق بالجبنة", NameEn = "Sogok with Cheese Pide", BasePrice = 20.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cPide.CategoryId, NameAr = "فطيرة لحم بالعجين", NameEn = "Meat with Dough Pide", BasePrice = 18.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },
                    new() { CategoryId = cPide.CategoryId, NameAr = "فطيرة كرافت عسل", NameEn = "Kraft with Honey Pide", BasePrice = 17.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },
                    new() { CategoryId = cPide.CategoryId, NameAr = "فطيرة سبانخ مع جبن", NameEn = "Spinach with Cheese Pide", BasePrice = 20.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },

                    // Manakeesh
                    new() { CategoryId = cManakeesh.CategoryId, NameAr = "منقوشة زعتر", NameEn = "Zaatar Manakeesh", BasePrice = 6.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cManakeesh.CategoryId, NameAr = "منقوشة جبنة عكاوي", NameEn = "Akkawi Cheese Manakeesh", BasePrice = 10.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cManakeesh.CategoryId, NameAr = "منقوشة لبنة وزعتر", NameEn = "Labneh & Zaatar Manakeesh", BasePrice = 10.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },
                    new() { CategoryId = cManakeesh.CategoryId, NameAr = "منقوشة مشكل جبن", NameEn = "Mixed Cheese Manakeesh", BasePrice = 21.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },

                    // Signature Wraps
                    new() { CategoryId = cWraps.CategoryId, NameAr = "سوق وسفرة تشيكن راب", NameEn = "Souq & Sofra Chicken Wrap", BasePrice = 20.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cWraps.CategoryId, NameAr = "بافلو تشيكن راب", NameEn = "Buffalo Chicken Wrap", BasePrice = 21.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cWraps.CategoryId, NameAr = "كفتة راب", NameEn = "Kofta Wrap", BasePrice = 21.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },
                    new() { CategoryId = cWraps.CategoryId, NameAr = "حلومي راب", NameEn = "Halloumi Wrap", BasePrice = 20.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },

                    // Hawawshi & Veno
                    new() { CategoryId = cHawawshi.CategoryId, NameAr = "حواوشي بلدي مخصوص", NameEn = "Baladi Hawawshi Special", BasePrice = 22.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cHawawshi.CategoryId, NameAr = "حواوشي بسطرمة وجبن", NameEn = "Basterma Hawawshi", BasePrice = 25.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() {
                        CategoryId = cHawawshi.CategoryId,
                        NameAr = "سندوتش كبدة اسكندراني",
                        NameEn = "Alexandrian Liver Sandwich",
                        BasePrice = 15.00m,
                        ImageUrl = "assets/MAIN.jpg",
                        IsAvailable = true,
                        IsFeatured = true,
                        Variants = new List<ProductVariant>
                        {
                            new() { NameAr = "خبز فينو", NameEn = "Veno Bread", Price = 15.00m, IsDefault = true },
                            new() { NameAr = "خبز بلدي", NameEn = "Baladi Bread", Price = 15.00m, IsDefault = false }
                        }
                    },
                    new() { CategoryId = cHawawshi.CategoryId, NameAr = "سندوتش سجق شرقي", NameEn = "Oriental Sausage Sandwich", BasePrice = 12.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },

                    // Feteer Meshaltet
                    new() {
                        CategoryId = cFeteer.CategoryId,
                        NameAr = "فطير مشلتت سمن بلدي (عسل وجبن)",
                        NameEn = "Baladi Ghee Feteer Meshaltet",
                        BasePrice = 35.00m,
                        ImageUrl = "assets/MAIN.jpg",
                        IsAvailable = true,
                        IsFeatured = true,
                        Variants = new List<ProductVariant>
                        {
                            new() { NameAr = "حجم وسط", NameEn = "Medium Size", Price = 35.00m, IsDefault = true },
                            new() { NameAr = "حجم كبير", NameEn = "Large Size", Price = 63.00m, IsDefault = false }
                        }
                    },
                    new() {
                        CategoryId = cFeteer.CategoryId,
                        NameAr = "فطير مشلتت مشكل لحوم",
                        NameEn = "Mixed Meats Feteer",
                        BasePrice = 37.00m,
                        ImageUrl = "assets/MAIN.jpg",
                        IsAvailable = true,
                        IsFeatured = true,
                        Variants = new List<ProductVariant>
                        {
                            new() { NameAr = "حجم وسط", NameEn = "Medium Size", Price = 37.00m, IsDefault = true },
                            new() { NameAr = "حجم كبير", NameEn = "Large Size", Price = 45.00m, IsDefault = false }
                        }
                    },
                    new() { CategoryId = cFeteer.CategoryId, NameAr = "فطير مشلتت كيري وسجق", NameEn = "Kiri & Sogok Feteer", BasePrice = 37.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },

                    // Sweet Feteer
                    new() { CategoryId = cSweetFeteer.CategoryId, NameAr = "فطير حلو نوتيلا", NameEn = "Nutella Sweet Feteer", BasePrice = 20.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() {
                        CategoryId = cSweetFeteer.CategoryId,
                        NameAr = "فطير كنافة دبي الفاخر",
                        NameEn = "Dubai Knafeh Feteer",
                        BasePrice = 30.00m,
                        ImageUrl = "assets/MAIN.jpg",
                        IsAvailable = true,
                        IsFeatured = true,
                        Variants = new List<ProductVariant>
                        {
                            new() { NameAr = "حجم وسط", NameEn = "Medium Size", Price = 30.00m, IsDefault = true },
                            new() { NameAr = "حجم كبير", NameEn = "Large Size", Price = 35.00m, IsDefault = false }
                        }
                    },
                    new() { CategoryId = cSweetFeteer.CategoryId, NameAr = "فطير قشطة وعسل ومكسرات", NameEn = "Qeshta, Honey & Nuts Feteer", BasePrice = 30.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = false },

                    // Catering Boxes
                    new() { CategoryId = cBoxes.CategoryId, NameAr = "بوكس ميني مناقيش (25 قطعة)", NameEn = "Mini Manakeesh Box (25 Pcs)", BasePrice = 62.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true },
                    new() { CategoryId = cBoxes.CategoryId, NameAr = "بوكس سمبوسة مشكل (25 قطعة)", NameEn = "Mixed Sambosa Box (25 Pcs)", BasePrice = 62.00m, ImageUrl = "assets/MAIN.jpg", IsAvailable = true, IsFeatured = true }
                };

                await context.Products.AddRangeAsync(products);
                await context.SaveChangesAsync();
            }

            // Replace the storefront catalog once with the bilingual menu supplied by the owner.
            // The initializer archives old products to keep their historical orders intact.
            await MenuCatalogV2Initializer.ApplyAsync(context);
        }

        private const string LegacyDefaultAdminPasswordHash = "jm5qtRcShtk8AL+DvQozYQ==:t9jeA8Uawu/5NkZyj3ydmT1h5hF5hQrEisCPxOUX8/Y=";

        private static async Task SeedBootstrapUserAsync(
            AppDbContext context,
            IConfiguration configuration,
            string accountKey,
            string defaultEmail,
            string fullName,
            int roleId)
        {
            var password = configuration[$"BootstrapUsers:{accountKey}:Password"];
            if (string.IsNullOrWhiteSpace(password)) return;
            if (password.Length < 12)
                throw new InvalidOperationException($"Bootstrap password for {accountKey} must be at least 12 characters.");

            var configuredEmail = configuration[$"BootstrapUsers:{accountKey}:Email"];
            var email = string.IsNullOrWhiteSpace(configuredEmail) ? defaultEmail : configuredEmail.Trim();
            var normalizedEmail = email.ToLowerInvariant();
            var existingUser = await context.Users.FirstOrDefaultAsync(user => user.Email.ToLower() == normalizedEmail);
            if (existingUser is not null)
            {
                // Rotate only the known, publicly documented legacy admin credential.
                if (accountKey == "Admin" && existingUser.PasswordHash == LegacyDefaultAdminPasswordHash)
                {
                    existingUser.PasswordHash = PasswordHasher.HashPassword(password);
                    await context.SaveChangesAsync();
                }
                return;
            }

            await context.Users.AddAsync(new User
            {
                FullName = fullName,
                Email = email,
                PasswordHash = PasswordHasher.HashPassword(password),
                RoleId = roleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }
    }
}
