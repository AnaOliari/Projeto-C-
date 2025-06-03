namespace ReceitasAPI.Models;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;

    public List<Receita> Receitas { get; set; } = new();
}
