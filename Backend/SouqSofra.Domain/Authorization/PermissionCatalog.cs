namespace SouqSofra.Domain.Authorization
{
    public static class PermissionCatalog
    {
        public static readonly string[] All =
        [
            "dashboard.view", "analytics.view",
            "orders.view", "orders.create", "orders.update", "orders.delete",
            "products.view", "products.create", "products.update", "products.delete",
            "categories.view", "categories.create", "categories.update", "categories.delete",
            "addons.view", "addons.create", "addons.update", "addons.delete",
            "settings.view", "settings.update",
            "reviews.view", "reviews.create", "reviews.update", "reviews.delete", "media.upload",
            "branches.view", "branches.create", "branches.update", "branches.delete",
            "users.view", "users.create", "users.update", "users.delete"
        ];

        public static IReadOnlyList<string> ForRole(int roleId) => roleId switch
        {
            1 => All.Where(permission => !permission.StartsWith("users.", StringComparison.Ordinal) || permission == "users.view").ToArray(),
            2 => ["orders.view", "orders.update"],
            3 => All,
            _ => []
        };

        public static bool IsKnown(string? permission) => permission != null && All.Contains(permission, StringComparer.Ordinal);
    }
}
