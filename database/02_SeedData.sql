-- =============================================
-- Souq & Sofra Seed Data (SQL Server)
-- Menu items extracted from Souq_Sofra_Menu.png
-- =============================================

USE SouqSofraDb;
GO

-- 1. Insert Roles
INSERT INTO Roles (RoleName) VALUES ('Admin'), ('Manager'), ('Cashier'), ('Customer');

-- 2. Insert Default Admin (Password: Admin@123456 - PBKDF2/SHA256 Hash placeholder)
INSERT INTO Users (FullName, Email, PasswordHash, PhoneNumber, RoleId, IsActive)
VALUES (N'مدير سوق وسفرة', 'admin@souqsofra.com', 'AQAAAAIAAYagAAAAEI8uW+xV0m...samplehash...', '+971503157884', 1, 1);

-- 3. Insert Branch
INSERT INTO Branches (NameAr, NameEn, AddressAr, AddressEn, Phone, WhatsApp, Latitude, LongLongitude)
VALUES (
    N'فرع الكورنيش - أبوظبي',
    'Corniche Branch - Abu Dhabi',
    N'أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين',
    'Abu Dhabi - Corniche - Opposite Al Madina Fresh Mart and Al Nilein Bank',
    '026333136',
    '+971503157884',
    24.492500,
    54.356200
);

-- 4. Insert Categories
SET IDENTITY_INSERT Categories ON;

INSERT INTO Categories (CategoryId, NameAr, NameEn, Slug, DisplayOrder, IconUrl) VALUES
(1, N'فطائر البيتزا التركية', 'Turkish Pide', 'turkish-pide', 1, '/assets/categories/pide.png'),
(2, N'المناقيش', 'Manakeesh', 'manakeesh', 2, '/assets/categories/manakeesh.png'),
(3, N'سندوتشات الراب', 'Signature Wraps', 'signature-wraps', 3, '/assets/categories/wraps.png'),
(4, N'المعجنات الصغيرة', 'Small Pastries', 'small-pastries', 4, '/assets/categories/pastries.png'),
(5, N'مقبلات وسلطات', 'Appetizers & Salads', 'appetizers-salads', 5, '/assets/categories/salads.png'),
(6, N'حواوشي وسندوتشات فينو', 'Hawawshi & Veno', 'hawawshi-veno', 6, '/assets/categories/hawawshi.png'),
(7, N'سندوتشات خبز بلدي', 'Baladi Sandwiches', 'baladi-sandwiches', 7, '/assets/categories/baladi.png'),
(8, N'سندوتشات ع الماشي', 'On The Go Sandwiches', 'on-the-go', 8, '/assets/categories/on-the-go.png'),
(9, N'تشكيلة الخبز الطازج', 'Fresh Breads', 'fresh-breads', 9, '/assets/categories/bread.png'),
(10, N'مخبوزات ونواشف 250 جم', 'Bakery & Cookies 250g', 'bakery-cookies', 10, '/assets/categories/cookies.png'),
(11, N'بوكسات السلاف والعزائم', 'Catering Boxes', 'catering-boxes', 11, '/assets/categories/boxes.png'),
(12, N'منتجات الحبة الكاملة', 'Whole Grain Line', 'whole-grain', 12, '/assets/categories/wholegrain.png'),
(13, N'البيتزا', 'Pizza', 'pizza', 13, '/assets/categories/pizza.png'),
(14, N'الفطير المشلتت', 'Feteer Meshaltet', 'feteer-meshaltet', 14, '/assets/categories/feteer.png'),
(15, N'الفطير الحلو', 'Sweet Feteer', 'sweet-feteer', 15, '/assets/categories/sweet-feteer.png');

SET IDENTITY_INSERT Categories OFF;

-- 5. Insert Products
SET IDENTITY_INSERT Products ON;

-- Turkish Pide
INSERT INTO Products (ProductId, CategoryId, NameAr, NameEn, BasePrice, ImageUrl, IsAvailable, IsFeatured) VALUES
(101, 1, N'فطيرة جبنة عكاوي تركية', 'Turkish Akkawi Cheese Pide', 18.00, '/assets/products/pide_akkawi.jpg', 1, 1),
(102, 1, N'فطيرة سجق بالجبنة', 'Sogok with Cheese Pide', 20.00, '/assets/products/pide_sogok.jpg', 1, 1),
(103, 1, N'فطيرة لحم بالعجين', 'Meat with Dough Pide', 18.00, '/assets/products/pide_meat.jpg', 1, 1),
(104, 1, N'فطيرة كرافت عسل', 'Kraft with Honey Pide', 17.00, '/assets/products/pide_kraft.jpg', 1, 0),
(105, 1, N'فطيرة سبانخ مع جبن', 'Spinach with Cheese Pide', 20.00, '/assets/products/pide_spinach.jpg', 1, 0),

-- Manakeesh
(201, 2, N'منقوشة زعتر', 'Zaatar Manakeesh', 6.00, '/assets/products/manakeesh_zaatar.jpg', 1, 1),
(202, 2, N'منقوشة جبنة عكاوي', 'Akkawi Cheese Manakeesh', 10.00, '/assets/products/manakeesh_akkawi.jpg', 1, 1),
(203, 2, N'منقوشة لبنة وزعتر', 'Labneh & Zaatar Manakeesh', 10.00, '/assets/products/manakeesh_labneh.jpg', 1, 0),
(204, 2, N'منقوشة مشكل جبن', 'Mixed Cheese Manakeesh', 21.00, '/assets/products/manakeesh_cheese.jpg', 1, 0),

-- Signature Wraps
(301, 3, N'سوق وسفرة تشيكن راب', 'Souq & Sofra Chicken Wrap', 20.00, '/assets/products/wrap_chicken.jpg', 1, 1),
(302, 3, N'بافلو تشيكن راب', 'Buffalo Chicken Wrap', 21.00, '/assets/products/wrap_buffalo.jpg', 1, 1),
(303, 3, N'كفتة راب', 'Kofta Wrap', 21.00, '/assets/products/wrap_kofta.jpg', 1, 0),
(304, 3, N'حلومي راب', 'Halloumi Wrap', 20.00, '/assets/products/wrap_halloumi.jpg', 1, 0),

-- Hawawshi & Veno
(401, 6, N'حواوشي بلدي مخصوص', 'Baladi Hawawshi Special', 22.00, '/assets/products/hawawshi_baladi.jpg', 1, 1),
(402, 6, N'حواوشي بسطرمة وجبن', 'Basterma Hawawshi', 25.00, '/assets/products/hawawshi_basterma.jpg', 1, 1),
(403, 6, N'سندوتش كبدة اسكندراني', 'Alexandrian Liver Sandwich', 15.00, '/assets/products/kebda.jpg', 1, 1),
(404, 6, N'سندوتش سجق شرقي', 'Oriental Sausage Sandwich', 12.00, '/assets/products/sogok.jpg', 1, 0),

-- Feteer Meshaltet
(501, 14, N'فطير مشلتت سمن بلدي (عسل وجبن)', 'Baladi Ghee Feteer Meshaltet', 35.00, '/assets/products/feteer_plain.jpg', 1, 1),
(502, 14, N'فطير مشلتت مشكل لحوم', 'Mixed Meats Feteer', 37.00, '/assets/products/feteer_meat.jpg', 1, 1),
(503, 14, N'فطير مشلتت كيري وسجق', 'Kiri & Sogok Feteer', 37.00, '/assets/products/feteer_kiri.jpg', 1, 1),

-- Sweet Feteer
(601, 15, N'فطير حلو نوتيلا', 'Nutella Sweet Feteer', 20.00, '/assets/products/feteer_nutella.jpg', 1, 1),
(602, 15, N'فطير كنافة دبي الفاخر', 'Dubai Knafeh Feteer', 30.00, '/assets/products/feteer_dubai.jpg', 1, 1),
(603, 15, N'فطير قشطة وعسل ومكسرات', 'Qeshta, Honey & Nuts Feteer', 30.00, '/assets/products/feteer_honey.jpg', 1, 1),

-- Catering Boxes
(701, 11, N'بوكس ميني مناقيش (25 قطعة)', 'Mini Manakeesh Box (25 Pcs)', 62.00, '/assets/products/box_manakeesh.jpg', 1, 1),
(702, 11, N'بوكس سمبوسة مشكل (25 قطعة)', 'Mixed Sambosa Box (25 Pcs)', 62.00, '/assets/products/box_sambosa.jpg', 1, 1);

SET IDENTITY_INSERT Products OFF;

-- 6. Insert Product Variants (Sizes & Bread types)
INSERT INTO ProductVariants (ProductId, NameAr, NameEn, Price, IsDefault) VALUES
-- Alexandrian Liver (Fino / Baladi)
(403, N'خبز فينو', 'Veno Bread', 15.00, 1),
(403, N'خبز بلدي', 'Baladi Bread', 15.00, 0),
-- Feteer Meshaltet (Medium / Large)
(501, N'حجم وسط', 'Medium Size', 35.00, 1),
(501, N'حجم كبير', 'Large Size', 63.00, 0),
(502, N'حجم وسط', 'Medium Size', 37.00, 1),
(502, N'حجم كبير', 'Large Size', 45.00, 0),
-- Sweet Feteer Dubai Knafeh
(602, N'حجم وسط', 'Medium Size', 30.00, 1),
(602, N'حجم كبير', 'Large Size', 35.00, 0);

-- 7. Insert Site Settings
INSERT INTO SiteSettings (SettingKey, SettingValue, Description) VALUES
('BrandNameAr', N'سوق وسفرة', N'اسم المطعم بالعربية'),
('BrandNameEn', 'Souq & Sofra', 'Restaurant Brand Name English'),
('SloganAr', N'مطعم ومخبز - طعم أصيل، مزاج جميل', N'الشعار الترويجي بالعربية'),
('SloganEn', 'Bakery & Restaurant - Good Food, Good Mood', 'Slogan English'),
('Phone', '02 633 3136', 'رقم الهاتف الموحد'),
('WhatsApp', '+971 50 315 7884', 'رقم الواتساب للطلبات'),
('AddressAr', N'أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين', N'عنوان الفرع الرئيسي'),
('AddressEn', 'Abu Dhabi - Corniche - Opposite Al Madina Fresh Mart and Al Nilein Bank', 'Branch Address'),
('CurrencyAr', N'درهم', N'العملة بالعربية'),
('CurrencyEn', 'AED', 'Currency English'),
('DeliveryFee', '10.00', 'رسوم التوصيل الثابتة');
GO
