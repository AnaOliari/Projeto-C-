namespace ReceitasAPI.Models;

public class Ingrediente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Quantidade { get; set; } = string.Empty;

    public int ReceitaId { get; set; }
    public Receita? Receita { get; set; }
}
