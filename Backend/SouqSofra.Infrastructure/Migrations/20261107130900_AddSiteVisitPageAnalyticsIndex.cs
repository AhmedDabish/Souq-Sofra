using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    public partial class AddSiteVisitPageAnalyticsIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Cover the date-filtered PagePath aggregation and distinct-session count.
            // This avoids scanning the separate time-only index and performing row lookups.
            migrationBuilder.DropIndex(
                name: "IX_SiteVisits_VisitedAtUtc",
                table: "SiteVisits");

            migrationBuilder.CreateIndex(
                name: "IX_SiteVisits_VisitedAtUtc_PagePath",
                table: "SiteVisits",
                columns: new[] { "VisitedAtUtc", "PagePath" })
                .Annotation("SqlServer:Include", new[] { "SessionKeyHash" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SiteVisits_VisitedAtUtc_PagePath",
                table: "SiteVisits");

            migrationBuilder.CreateIndex(
                name: "IX_SiteVisits_VisitedAtUtc",
                table: "SiteVisits",
                column: "VisitedAtUtc");
        }
    }
}
