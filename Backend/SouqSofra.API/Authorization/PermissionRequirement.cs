using Microsoft.AspNetCore.Authorization;

namespace SouqSofra.API.Authorization
{
    public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
    {
        public string Permission { get; } = permission;
    }

    public static class PermissionPolicy
    {
        public static string For(string permission) => $"Permission:{permission}";
    }
}
