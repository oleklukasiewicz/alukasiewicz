using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace alukasiewicz.api.Migrations
{
    /// <inheritdoc />
    public partial class DefaultGroupFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "Groups",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "Groups");
        }
    }
}
