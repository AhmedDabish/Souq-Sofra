using Microsoft.EntityFrameworkCore;
using SouqSofra.Domain.Entities;

namespace SouqSofra.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
        public DbSet<ProductAddon> ProductAddons => Set<ProductAddon>();
        public DbSet<AddonTemplate> AddonTemplates => Set<AddonTemplate>();
        public DbSet<OrderItemAddon> OrderItemAddons => Set<OrderItemAddon>();
        public DbSet<Branch> Branches => Set<Branch>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<User> Users => Set<User>();
        public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
        public DbSet<RestaurantReview> RestaurantReviews => Set<RestaurantReview>();
        public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
        public DbSet<SiteVisit> SiteVisits => Set<SiteVisit>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");
                entity.HasKey(c => c.CategoryId);
                entity.Property(c => c.NameAr).IsRequired().HasMaxLength(150);
                entity.Property(c => c.NameEn).IsRequired().HasMaxLength(150);
                entity.Property(c => c.Slug).IsRequired().HasMaxLength(150);
                entity.Property(c => c.IconUrl).HasMaxLength(500);
                entity.Property(c => c.ImageUrl).HasMaxLength(500);
            });

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");
                entity.HasKey(p => p.ProductId);
                entity.Property(p => p.NameAr).IsRequired().HasMaxLength(200);
                entity.Property(p => p.NameEn).IsRequired().HasMaxLength(200);
                entity.Property(p => p.DescriptionAr).HasMaxLength(1000);
                entity.Property(p => p.DescriptionEn).HasMaxLength(1000);
                entity.Property(p => p.BasePrice).HasPrecision(18, 2);
                entity.Property(p => p.DiscountPrice).HasPrecision(18, 2);
                entity.Property(p => p.ImageUrl).HasMaxLength(500);
                entity.Property(p => p.IsManuallyBestSelling).HasDefaultValue(false);

                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(p => p.CategoryId);
            });

            // ProductVariant configuration
            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.ToTable("ProductVariants");
                entity.HasKey(v => v.VariantId);
                entity.Property(v => v.NameAr).IsRequired().HasMaxLength(100);
                entity.Property(v => v.NameEn).IsRequired().HasMaxLength(100);
                entity.Property(v => v.Price).HasPrecision(18, 2);

                entity.HasOne(v => v.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(v => v.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(v => v.ProductId);
            });

            // Product add-ons are priced and validated by the server.
            modelBuilder.Entity<ProductAddon>(entity =>
            {
                entity.ToTable("ProductAddons");
                entity.HasKey(a => a.AddonId);
                entity.Property(a => a.NameAr).IsRequired().HasMaxLength(100);
                entity.Property(a => a.NameEn).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Price).HasPrecision(18, 2);
                entity.HasOne(a => a.Product)
                      .WithMany(p => p.Addons)
                      .HasForeignKey(a => a.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(a => a.ProductId);
                entity.HasIndex(a => a.CatalogTemplateId);
                entity.HasOne(a => a.CatalogTemplate)
                      .WithMany()
                      .HasForeignKey(a => a.CatalogTemplateId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AddonTemplate>(entity =>
            {
                entity.ToTable("AddonTemplates");
                entity.HasKey(a => a.AddonTemplateId);
                entity.Property(a => a.NameAr).IsRequired().HasMaxLength(100);
                entity.Property(a => a.NameEn).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Price).HasPrecision(18, 2);
                entity.Property(a => a.ScopeType).IsRequired().HasMaxLength(20);
                entity.HasIndex(a => new { a.ScopeType, a.CategoryId, a.ProductId, a.IsAvailable });
            });

            // Branch configuration
            modelBuilder.Entity<Branch>(entity =>
            {
                entity.ToTable("Branches");
                entity.HasKey(b => b.BranchId);
                entity.Property(b => b.NameAr).IsRequired().HasMaxLength(150);
                entity.Property(b => b.NameEn).IsRequired().HasMaxLength(150);
                entity.Property(b => b.AddressAr).IsRequired().HasMaxLength(300);
                entity.Property(b => b.AddressEn).IsRequired().HasMaxLength(300);
                entity.Property(b => b.Phone).IsRequired().HasMaxLength(50);
                entity.Property(b => b.WhatsApp).IsRequired().HasMaxLength(50);
                entity.Property(b => b.Latitude).HasPrecision(10, 6);
                entity.Property(b => b.Longitude).HasPrecision(10, 6);
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");
                entity.HasKey(o => o.OrderId);
                entity.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
                entity.Property(o => o.CustomerName).IsRequired().HasMaxLength(150);
                entity.Property(o => o.CustomerPhone).IsRequired().HasMaxLength(50);
                entity.Property(o => o.CustomerEmail).HasMaxLength(150);
                entity.Property(o => o.DeliveryAddress).IsRequired().HasMaxLength(500);
                entity.Property(o => o.PaymentMethod).IsRequired().HasMaxLength(50);
                entity.Property(o => o.OrderStatus).IsRequired().HasMaxLength(50);
                entity.Property(o => o.OrderChannel).IsRequired().HasMaxLength(30).HasDefaultValue("Website");
                entity.Property(o => o.Notes).HasMaxLength(500);
                entity.Property(o => o.SubTotal).HasPrecision(18, 2);
                entity.Property(o => o.DeliveryFee).HasPrecision(18, 2);
                entity.Property(o => o.TotalAmount).HasPrecision(18, 2);

                entity.HasOne(o => o.Branch)
                      .WithMany(b => b.Orders)
                      .HasForeignKey(o => o.BranchId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(o => o.OrderNumber).IsUnique();
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("OrderItems");
                entity.HasKey(oi => oi.OrderItemId);
                entity.Property(oi => oi.ProductNameAr).IsRequired().HasMaxLength(200);
                entity.Property(oi => oi.ProductNameEn).IsRequired().HasMaxLength(200);
                entity.Property(oi => oi.VariantNameAr).HasMaxLength(100);
                entity.Property(oi => oi.VariantNameEn).HasMaxLength(100);
                entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
                entity.Property(oi => oi.TotalPrice).HasPrecision(18, 2);

                entity.HasOne(oi => oi.Order)
                      .WithMany(o => o.Items)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Product)
                      .WithMany()
                      .HasForeignKey(oi => oi.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(oi => oi.Variant)
                      .WithMany()
                      .HasForeignKey(oi => oi.VariantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<OrderItemAddon>(entity =>
            {
                entity.ToTable("OrderItemAddons");
                entity.HasKey(a => a.OrderItemAddonId);
                entity.Property(a => a.NameAr).IsRequired().HasMaxLength(100);
                entity.Property(a => a.NameEn).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Price).HasPrecision(18, 2);
                entity.HasOne(a => a.OrderItem)
                      .WithMany(item => item.Addons)
                      .HasForeignKey(a => a.OrderItemId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(a => a.OrderItemId);
            });

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(150);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
                entity.Property(u => u.PhoneNumber).HasMaxLength(50);
                entity.Property(u => u.PermissionsJson).HasColumnType("nvarchar(max)");

                entity.HasIndex(u => u.Email).IsUnique();
            });

            // SiteSetting configuration
            modelBuilder.Entity<SiteSetting>(entity =>
            {
                entity.ToTable("SiteSettings");
                entity.HasKey(s => s.SettingKey);
                entity.Property(s => s.SettingKey).HasMaxLength(100);
                entity.Property(s => s.SettingValue).IsRequired().HasMaxLength(1000);
                entity.Property(s => s.Description).HasMaxLength(500);
            });

            // Anonymous first-party page analytics. The client session identifier is hashed by the API.
            modelBuilder.Entity<SiteVisit>(entity =>
            {
                entity.ToTable("SiteVisits");
                entity.HasKey(visit => visit.SiteVisitId);
                entity.Property(visit => visit.SessionKeyHash).IsRequired().HasMaxLength(64);
                entity.Property(visit => visit.PagePath).IsRequired().HasMaxLength(200);
                entity.HasIndex(visit => visit.VisitedAtUtc);
                entity.HasIndex(visit => visit.PagePath);
                entity.HasIndex(visit => new { visit.VisitedAtUtc, visit.SessionKeyHash });
            });

            // RestaurantReview configuration
            modelBuilder.Entity<RestaurantReview>(entity =>
            {
                entity.ToTable("RestaurantReviews");
                entity.HasKey(r => r.ReviewId);
                entity.Property(r => r.CustomerName).IsRequired().HasMaxLength(150);
                entity.Property(r => r.PhoneNumber).HasMaxLength(30);
                entity.Property(r => r.Comment).IsRequired().HasMaxLength(1000);
                entity.Property(r => r.AvatarUrl).HasMaxLength(500);
                entity.Property(r => r.VideoUrl).HasMaxLength(500);
                entity.Property(r => r.Rating).IsRequired();
            });

            // ProductReview configuration
            modelBuilder.Entity<ProductReview>(entity =>
            {
                entity.ToTable("ProductReviews");
                entity.HasKey(pr => pr.ProductReviewId);
                entity.Property(pr => pr.CustomerName).IsRequired().HasMaxLength(150);
                entity.Property(pr => pr.PhoneNumber).HasMaxLength(30);
                entity.Property(pr => pr.Comment).HasMaxLength(1000);
                entity.Property(pr => pr.Rating).IsRequired();

                entity.HasOne(pr => pr.Product)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(pr => pr.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(pr => pr.ProductId);
            });
        }
    }
}
