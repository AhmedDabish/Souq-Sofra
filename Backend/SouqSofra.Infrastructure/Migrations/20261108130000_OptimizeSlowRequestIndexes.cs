using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    public partial class OptimizeSlowRequestIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderStatus_CreatedAt",
                table: "Orders",
                columns: new[] { "OrderStatus", "CreatedAt" })
                .Annotation("SqlServer:Include", new[] { "TotalAmount", "OrderChannel" });

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems");
            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId")
                .Annotation("SqlServer:Include", new[] { "ProductId", "Quantity" });

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_ProductId_OrderId",
                table: "OrderItems");
            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductId_OrderId",
                table: "OrderItems",
                columns: new[] { "ProductId", "OrderId" })
                .Annotation("SqlServer:Include", new[] { "Quantity" });

            migrationBuilder.CreateIndex(
                name: "IX_SiteVisits_SessionKeyHash_PagePath_VisitedAtUtc",
                table: "SiteVisits",
                columns: new[] { "SessionKeyHash", "PagePath", "VisitedAtUtc" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_OrderStatus_CreatedAt",
                table: "Orders");
            migrationBuilder.DropIndex(
                name: "IX_SiteVisits_SessionKeyHash_PagePath_VisitedAtUtc",
                table: "SiteVisits");
            migrationBuilder.DropIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems");
            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");
            migrationBuilder.DropIndex(
                name: "IX_OrderItems_ProductId_OrderId",
                table: "OrderItems");
            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductId_OrderId",
                table: "OrderItems",
                columns: new[] { "ProductId", "OrderId" });
        }
    }
}
