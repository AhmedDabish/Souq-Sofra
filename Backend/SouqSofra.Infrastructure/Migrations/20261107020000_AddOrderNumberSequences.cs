using Microsoft.EntityFrameworkCore.Migrations;
using SouqSofra.Infrastructure.Data;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    public partial class AddOrderNumberSequences : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Orders_OrderNumber", table: "Orders");
            migrationBuilder.CreateIndex(name: "IX_Orders_OrderNumber", table: "Orders", column: "OrderNumber");
            migrationBuilder.CreateIndex(name: "IX_Orders_CreatedAt", table: "Orders", column: "CreatedAt");
            migrationBuilder.CreateIndex(name: "IX_Orders_OrderStatus", table: "Orders", column: "OrderStatus");
            migrationBuilder.CreateIndex(name: "IX_Products_IsAvailable_IsFeatured_ProductId", table: "Products", columns: new[] { "IsAvailable", "IsFeatured", "ProductId" });
            migrationBuilder.CreateIndex(name: "IX_OrderItems_ProductId_OrderId", table: "OrderItems", columns: new[] { "ProductId", "OrderId" });
            migrationBuilder.CreateTable(
                name: "OrderNumberSequences",
                columns: table => new
                {
                    WindowId = table.Column<long>(type: "bigint", nullable: false),
                    LastNumber = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_OrderNumberSequences", x => x.WindowId));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "OrderNumberSequences");
            migrationBuilder.DropIndex(name: "IX_Products_IsAvailable_IsFeatured_ProductId", table: "Products");
            migrationBuilder.DropIndex(name: "IX_OrderItems_ProductId_OrderId", table: "OrderItems");
            migrationBuilder.DropIndex(name: "IX_Orders_OrderStatus", table: "Orders");
            migrationBuilder.DropIndex(name: "IX_Orders_CreatedAt", table: "Orders");
            migrationBuilder.DropIndex(name: "IX_Orders_OrderNumber", table: "Orders");
            migrationBuilder.CreateIndex(name: "IX_Orders_OrderNumber", table: "Orders", column: "OrderNumber", unique: true);
        }
    }
}
