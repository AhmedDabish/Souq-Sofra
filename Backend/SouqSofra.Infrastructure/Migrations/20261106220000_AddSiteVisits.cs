using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    public partial class AddSiteVisits : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteVisits",
                columns: table => new
                {
                    SiteVisitId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionKeyHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    PagePath = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    VisitedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_SiteVisits", x => x.SiteVisitId));

            migrationBuilder.CreateIndex(name: "IX_SiteVisits_PagePath", table: "SiteVisits", column: "PagePath");
            migrationBuilder.CreateIndex(name: "IX_SiteVisits_VisitedAtUtc", table: "SiteVisits", column: "VisitedAtUtc");
            migrationBuilder.CreateIndex(name: "IX_SiteVisits_VisitedAtUtc_SessionKeyHash", table: "SiteVisits", columns: new[] { "VisitedAtUtc", "SessionKeyHash" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SiteVisits");
        }
    }
}
