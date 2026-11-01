-- =============================================
-- Souq & Sofra Database Schema (SQL Server)
-- =============================================

CREATE DATABASE SouqSofraDb;
GO

USE SouqSofraDb;
GO

-- 1. Users & Roles (Authentication & Authorization)
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(50) NULL,
    RoleId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- 2. Categories
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    NameAr NVARCHAR(150) NOT NULL,
    NameEn NVARCHAR(150) NOT NULL,
    Slug NVARCHAR(150) NOT NULL UNIQUE,
    IconUrl NVARCHAR(255) NULL,
    ImageUrl NVARCHAR(255) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 3. Products
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    NameEn NVARCHAR(200) NOT NULL,
    DescriptionAr NVARCHAR(MAX) NULL,
    DescriptionEn NVARCHAR(MAX) NULL,
    BasePrice DECIMAL(18,2) NOT NULL,
    DiscountPrice DECIMAL(18,2) NULL,
    ImageUrl NVARCHAR(255) NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    IsFeatured BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId) ON DELETE CASCADE
);

-- 4. Product Variants (Sizes & Addons: صغير / وسط / كبير / فينو / بلدي)
CREATE TABLE ProductVariants (
    VariantId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    NameAr NVARCHAR(100) NOT NULL,
    NameEn NVARCHAR(100) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ProductVariants_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE
);

-- 5. Customers & Branches
CREATE TABLE Branches (
    BranchId INT IDENTITY(1,1) PRIMARY KEY,
    NameAr NVARCHAR(150) NOT NULL,
    NameEn NVARCHAR(150) NOT NULL,
    AddressAr NVARCHAR(300) NOT NULL,
    AddressEn NVARCHAR(300) NOT NULL,
    Phone NVARCHAR(50) NOT NULL,
    WhatsApp NVARCHAR(50) NOT NULL,
    Latitude DECIMAL(9,6) NULL,
    Longitude DECIMAL(9,6) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- 6. Orders
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
    CustomerName NVARCHAR(150) NOT NULL,
    CustomerPhone NVARCHAR(50) NOT NULL,
    CustomerEmail NVARCHAR(150) NULL,
    DeliveryAddress NVARCHAR(500) NOT NULL,
    BranchId INT NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    DeliveryFee DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL DEFAULT 'CashOnDelivery', -- CashOnDelivery, Card, Online
    OrderStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Preparing, OnTheWay, Delivered, Cancelled
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Orders_Branches FOREIGN KEY (BranchId) REFERENCES Branches(BranchId)
);

-- 7. Order Items
CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    ProductNameAr NVARCHAR(200) NOT NULL,
    ProductNameEn NVARCHAR(200) NOT NULL,
    VariantNameAr NVARCHAR(100) NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    TotalPrice DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- 8. Site Settings (Brand, Banners, Social, Contacts)
CREATE TABLE SiteSettings (
    SettingKey NVARCHAR(100) PRIMARY KEY,
    SettingValue NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(255) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 9. Audit Logs (For admin security tracking)
CREATE TABLE AuditLogs (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Action NVARCHAR(100) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(50) NULL,
    Details NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Indexes for performance
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Orders_OrderStatus ON Orders(OrderStatus);
CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt);
GO
