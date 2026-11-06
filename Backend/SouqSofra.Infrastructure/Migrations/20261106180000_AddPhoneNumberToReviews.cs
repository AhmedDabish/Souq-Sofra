using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
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
