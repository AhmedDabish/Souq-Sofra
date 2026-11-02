using Microsoft.EntityFrameworkCore.Migrations;
using SouqSofra.Infrastructure.Data;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    public partial class AddEnglishOrderVariantName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VariantNameEn",
                table: "OrderItems",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "VariantNameEn", table: "OrderItems");
        }
    }
}
