using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SouqSofra.Infrastructure.Data;
using SouqSofra.API.Authorization;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT Authorization Support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Souq & Sofra API (سوق وسفرة)",
        Version = "v1",
        Description = "Restaurant & Bakery Management Web API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Bearer token here (e.g. eyJhbGciOi...)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// SQL Server Connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions => sqlServerOptions.MigrationsAssembly("SouqSofra.Infrastructure")));

// JWT Authentication Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SouqSofra_SuperSecret_Jwt_SecurityKey_2026_AbuDhabi_Dubai_UAE_123456789!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SouqSofraAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SouqSofraApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var userIdText = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = context.Principal?.FindFirst(ClaimTypes.Role)?.Value;
            if (!int.TryParse(userIdText, out var userId) || string.IsNullOrWhiteSpace(roleClaim))
            {
                context.Fail("Invalid user claims.");
                return;
            }

            var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(candidate => candidate.UserId == userId && candidate.IsActive);
            var currentRole = user?.RoleId switch { 1 => "Admin", 2 => "User", 3 => "SuperAdmin", _ => null };
            if (currentRole == null || !string.Equals(currentRole, roleClaim, StringComparison.Ordinal))
                context.Fail("The account is inactive or its role has changed. Please sign in again.");
        }
    };
});

builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in SouqSofra.Domain.Authorization.PermissionCatalog.All)
        options.AddPolicy(PermissionPolicy.For(permission), policy => policy.Requirements.Add(new PermissionRequirement(permission)));
});

// Robust CORS Policy for Angular Frontend & Localhost
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                try
                {
                    var uri = new Uri(origin);
                    return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Auto-run EF Core Migrations and Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        await DbInitializer.InitializeAsync(context, app.Configuration);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating and seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Souq & Sofra API v1");
    });
}

// 1. CORS Middleware MUST be placed at the very top of request pipeline
app.UseRouting();
app.UseCors("AllowAngular");
app.UseStaticFiles();

// Only redirect to HTTPS in production (preserves local HTTP port 2811 for Angular)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
