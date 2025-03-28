using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Posts.Interfaces;
using alukasiewicz.api.Module.Posts.Services;
using alukasiewicz.api.Module.Resources.Interfaces;
using alukasiewicz.api.Module.Resources.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddTransient<IResourcesService, ResourcesService>();
builder.Services.AddTransient<IItemAliasService, ItemAliasService>();
builder.Services.AddTransient<IItemService, ItemService>();

builder.Services.AddControllers();
builder.Services.AddDbContext<BaseDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("BaseConnection")));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
