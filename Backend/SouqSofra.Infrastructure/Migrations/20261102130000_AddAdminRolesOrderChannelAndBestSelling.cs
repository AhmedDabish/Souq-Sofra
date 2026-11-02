using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SouqSofra.Infrastructure.Data;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261102130000_AddAdminRolesOrderChannelAndBestSelling")]
    public partial class AddAdminRolesOrderChannelAndBestSelling : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(name: "IsManuallyBestSelling", table: "Products", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<string>(name: "OrderChannel", table: "Orders", type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Website");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "OrderChannel", table: "Orders");
            migrationBuilder.DropColumn(name: "IsManuallyBestSelling", table: "Products");
        }
    }
}
