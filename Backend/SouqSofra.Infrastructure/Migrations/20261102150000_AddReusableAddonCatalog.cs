using Microsoft.EntityFrameworkCore.Migrations;
using SouqSofra.Infrastructure.Data;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    public partial class AddReusableAddonCatalog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AddonTemplates",
                columns: table => new
                {
                    AddonTemplateId = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table => table.PrimaryKey("PK_AddonTemplates", x => x.AddonTemplateId));

            migrationBuilder.AddColumn<int>(name: "CatalogTemplateId", table: "ProductAddons", type: "int", nullable: true);
            migrationBuilder.CreateIndex(name: "IX_AddonTemplates_ScopeType_CategoryId_ProductId_IsAvailable", table: "AddonTemplates", columns: new[] { "ScopeType", "CategoryId", "ProductId", "IsAvailable" });
            migrationBuilder.CreateIndex(name: "IX_ProductAddons_CatalogTemplateId", table: "ProductAddons", column: "CatalogTemplateId");
            migrationBuilder.AddForeignKey(name: "FK_ProductAddons_AddonTemplates_CatalogTemplateId", table: "ProductAddons", column: "CatalogTemplateId", principalTable: "AddonTemplates", principalColumn: "AddonTemplateId", onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql(@"
                DECLARE @AddonMap TABLE (AddonId int NOT NULL, TemplateId int NOT NULL);
                MERGE INTO AddonTemplates AS target
                USING ProductAddons AS source ON 1 = 0
                WHEN NOT MATCHED THEN INSERT (NameAr, NameEn, Price, IsAvailable, ScopeType, CategoryId, ProductId)
                    VALUES (source.NameAr, source.NameEn, source.Price, source.IsAvailable, N'Product', NULL, source.ProductId)
                OUTPUT source.AddonId, inserted.AddonTemplateId INTO @AddonMap (AddonId, TemplateId);
                UPDATE existingAddon
                SET CatalogTemplateId = addonMap.TemplateId
                FROM ProductAddons AS existingAddon
                INNER JOIN @AddonMap AS addonMap ON addonMap.AddonId = existingAddon.AddonId;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_ProductAddons_AddonTemplates_CatalogTemplateId", table: "ProductAddons");
            migrationBuilder.DropIndex(name: "IX_ProductAddons_CatalogTemplateId", table: "ProductAddons");
            migrationBuilder.DropColumn(name: "CatalogTemplateId", table: "ProductAddons");
            migrationBuilder.DropTable(name: "AddonTemplates");
        }
    }
}
