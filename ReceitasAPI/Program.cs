using Microsoft.EntityFrameworkCore;
using ReceitasAPI.Data;
using ReceitasAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Configura o banco de dados SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=receitas.db"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();

// 🔹 Endpoints de Categoria
app.MapGet("/categorias", async (AppDbContext db) =>
    await db.Categorias.ToListAsync());

app.MapPost("/categorias", async (AppDbContext db, Categoria categoria) =>
{
    db.Categorias.Add(categoria);
    await db.SaveChangesAsync();
    return Results.Created($"/categorias/{categoria.Id}", categoria);
});

app.MapPut("/categorias/{id}", async (AppDbContext db, int id, Categoria input) =>
{
    var categoria = await db.Categorias.FindAsync(id);
    if (categoria is null) return Results.NotFound();

    categoria.Nome = input.Nome;
    await db.SaveChangesAsync();
    return Results.Ok(categoria);
});

app.MapDelete("/categorias/{id}", async (AppDbContext db, int id) =>
{
    var categoria = await db.Categorias.FindAsync(id);
    if (categoria is null) return Results.NotFound();

    db.Categorias.Remove(categoria);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
