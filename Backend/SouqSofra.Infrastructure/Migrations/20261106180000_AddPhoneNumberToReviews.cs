using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SouqSofra.Infrastructure.Data;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261106180000_AddPhoneNumberToReviews")]
    public partial class AddPhoneNumberToReviews : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "PhoneNumber", table: "RestaurantReviews", type: "nvarchar(30)", maxLength: 30, nullable: true);
            migrationBuilder.AddColumn<string>(name: "PhoneNumber", table: "ProductReviews", type: "nvarchar(30)", maxLength: 30, nullable: true);
        }
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "PhoneNumber", table: "ProductReviews");
            migrationBuilder.DropColumn(name: "PhoneNumber", table: "RestaurantReviews");
        }
    }
}
