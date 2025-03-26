using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace alukasiewicz.api.Migrations
{
    /// <inheritdoc />
    public partial class ItemsChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TileImegeResourceId",
                table: "Posts",
                newName: "TileImageResourceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TileImageResourceId",
                table: "Posts",
                newName: "TileImegeResourceId");
        }
    }
}
