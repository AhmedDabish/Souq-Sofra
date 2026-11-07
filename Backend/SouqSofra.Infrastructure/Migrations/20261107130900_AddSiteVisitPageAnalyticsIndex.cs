using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SouqSofra.Infrastructure.Data;

#nullable disable

namespace SouqSofra.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261107130900_AddSiteVisitPageAnalyticsIndex")]
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
