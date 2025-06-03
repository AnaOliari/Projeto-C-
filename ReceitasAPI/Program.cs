using Microsoft.EntityFrameworkCore;
using ReceitasAPI.Data;
using ReceitasAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Configura o banco de dados SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=receitas.db"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5299); // Permite acessar via 192.168.1.x:5299
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// IMPORTANTE: CORS deve vir antes de outros middlewares
app.UseCors();

//app.UseHttpsRedirection();
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

app.MapGet("/receitas", async (AppDbContext db) =>
    await db.Receitas
        .Include(r => r.Categoria)
        .Include(r => r.Ingredientes)
        .ToListAsync());


app.MapPost("/receitas", async (AppDbContext db, Receita receita) =>
{
    // Verifica se a categoria existe
    var categoria = await db.Categorias.FindAsync(receita.CategoriaId);
    if (categoria is null) return Results.BadRequest("Categoria não encontrada.");

    // Adiciona a receita com ingredientes
    db.Receitas.Add(receita);
    await db.SaveChangesAsync();

    return Results.Created($"/receitas/{receita.Id}", receita);
});

app.MapGet("/receitas/{id}", async (AppDbContext db, int id) =>
{
    var receita = await db.Receitas
        .Include(r => r.Categoria)
        .Include(r => r.Ingredientes)
        .FirstOrDefaultAsync(r => r.Id == id);

    return receita is not null ? Results.Ok(receita) : Results.NotFound();
});

app.MapPut("/receitas/{id}", async (AppDbContext db, int id, Receita input) =>
{
    var receita = await db.Receitas
        .Include(r => r.Ingredientes)
        .FirstOrDefaultAsync(r => r.Id == id);

    if (receita is null)
        return Results.NotFound();

    var categoria = await db.Categorias.FindAsync(input.CategoriaId);
    if (categoria is null)
        return Results.BadRequest("Categoria não encontrada.");

    // Atualiza os dados da receita
    receita.Nome = input.Nome;
    receita.ModoPreparo = input.ModoPreparo;
    receita.CategoriaId = input.CategoriaId;

    // Remove ingredientes antigos
    db.Ingredientes.RemoveRange(receita.Ingredientes);

    // Adiciona os novos ingredientes
    receita.Ingredientes = input.Ingredientes.Select(i => new Ingrediente
    {
        Nome = i.Nome,
        Quantidade = i.Quantidade
    }).ToList();

    await db.SaveChangesAsync();
    return Results.Ok(receita);
});

app.MapDelete("/receitas/{id}", async (AppDbContext db, int id) =>
{
    var receita = await db.Receitas.FindAsync(id);
    if (receita is null)
        return Results.NotFound();

    db.Receitas.Remove(receita);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
