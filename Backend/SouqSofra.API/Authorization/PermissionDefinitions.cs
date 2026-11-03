namespace SouqSofra.API.Authorization
{
    public sealed record PermissionDefinition(string Key, string Group, string GroupEn, string Label, string LabelEn);

    public static class PermissionDefinitions
    {
        public static readonly IReadOnlyList<PermissionDefinition> All =
        [
            new("dashboard.view", "لوحة المؤشرات", "Dashboard", "مشاهدة المؤشرات", "View dashboard"),
            new("orders.view", "الطلبات", "Orders", "مشاهدة الطلبات", "View orders"),
            new("orders.create", "الطلبات", "Orders", "إنشاء طلب", "Create orders"),
            new("orders.update", "الطلبات", "Orders", "تعديل الحالة والبيانات", "Update status and details"),
            new("orders.delete", "الطلبات", "Orders", "حذف الطلبات", "Delete orders"),
            new("products.view", "المنتجات", "Products", "مشاهدة المنتجات", "View products"),
            new("products.create", "المنتجات", "Products", "إضافة المنتجات", "Add products"),
            new("products.update", "المنتجات", "Products", "تعديل المنتجات", "Edit products"),
            new("products.delete", "المنتجات", "Products", "حذف المنتجات", "Delete products"),
            new("categories.view", "أقسام المنيو", "Menu categories", "مشاهدة الأقسام", "View categories"),
            new("categories.create", "أقسام المنيو", "Menu categories", "إضافة الأقسام", "Add categories"),
            new("categories.update", "أقسام المنيو", "Menu categories", "تعديل الأقسام", "Edit categories"),
            new("categories.delete", "أقسام المنيو", "Menu categories", "حذف الأقسام", "Delete categories"),
            new("addons.view", "الإضافات", "Add-ons", "مشاهدة الإضافات", "View add-ons"),
            new("addons.create", "الإضافات", "Add-ons", "إضافة الإضافات", "Add add-ons"),
            new("addons.update", "الإضافات", "Add-ons", "تعديل الإضافات", "Edit add-ons"),
            new("addons.delete", "الإضافات", "Add-ons", "حذف الإضافات", "Delete add-ons"),
            new("settings.view", "الإعدادات", "Settings", "مشاهدة الإعدادات", "View settings"),
            new("settings.update", "الإعدادات", "Settings", "تعديل الإعدادات", "Edit settings"),
            new("media.upload", "الوسائط", "Media", "رفع الصور والملفات", "Upload images and files"),
            new("branches.view", "الفروع", "Branches", "مشاهدة الفروع", "View branches"),
            new("branches.create", "الفروع", "Branches", "إضافة الفروع", "Add branches"),
            new("branches.update", "الفروع", "Branches", "تعديل الفروع", "Edit branches"),
            new("branches.delete", "الفروع", "Branches", "حذف الفروع", "Delete branches"),
            new("users.view", "المستخدمون", "Users", "مشاهدة المستخدمين", "View users"),
            new("users.create", "المستخدمون", "Users", "إضافة المستخدمين", "Add users"),
            new("users.update", "المستخدمون", "Users", "تعديل الأدوار والصلاحيات", "Edit roles and permissions"),
            new("users.delete", "المستخدمون", "Users", "إيقاف المستخدمين", "Deactivate users")
        ];
    }
}
