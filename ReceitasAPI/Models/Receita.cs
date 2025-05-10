namespace ReceitasAPI.Models;

public class Receita
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string ModoPreparo { get; set; } = string.Empty;

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public List<Ingrediente> Ingredientes { get; set; } = new();
}
