using alukasiewicz.api.Database;
using alukasiewicz.api.Module.Groups.Interfaces;
using alukasiewicz.api.Module.Groups.Services;
using alukasiewicz.api.Module.Matchings.Interfaces;
using alukasiewicz.api.Module.Matchings.Services;
using alukasiewicz.api.Module.Posts.Interfaces;
using alukasiewicz.api.Module.Posts.Services;
using alukasiewicz.api.Module.Resources.Interfaces;
using alukasiewicz.api.Module.Resources.Services;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddTransient<IResourcesService, ResourcesService>();
builder.Services.AddTransient<IItemAliasService, ItemAliasService>();
builder.Services.AddTransient<IItemService, ItemService>();
builder.Services.AddTransient<IGroupService, GroupService>();
builder.Services.AddTransient<IMatchingService,MatchingService>();

builder.Services.AddControllers();
builder.Services.AddDbContext<BaseDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("BaseConnection")));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddResponseCompression((options) =>
{
    options.Providers.Add<GzipCompressionProvider>();
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseResponseCompression();

app.UseCors();

app.MapControllers();

app.Run();
