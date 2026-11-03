using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SouqSofra.Domain.Authorization;
using SouqSofra.Infrastructure.Data;

namespace SouqSofra.API.Authorization
{
    public sealed class PermissionAuthorizationHandler(AppDbContext db) : AuthorizationHandler<PermissionRequirement>
    {
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            var role = context.User.FindFirstValue(ClaimTypes.Role);
            if (role == "SuperAdmin")
            {
                context.Succeed(requirement);
                return;
            }

            if (!int.TryParse(context.User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return;
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.UserId == userId && item.IsActive);
            if (user == null) return;

            IReadOnlyCollection<string> permissions;
            if (string.IsNullOrWhiteSpace(user.PermissionsJson))
                permissions = PermissionCatalog.ForRole(user.RoleId);
            else
            {
                try { permissions = JsonSerializer.Deserialize<string[]>(user.PermissionsJson) ?? []; }
                catch (JsonException) { permissions = []; }
            }

            if (permissions.Contains(requirement.Permission, StringComparer.Ordinal))
                context.Succeed(requirement);
        }
    }
}
