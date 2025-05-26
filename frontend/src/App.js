import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5299";
console.log("API usada:", API);

function App() {
  const [categorias, setCategorias] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [receitaEditando, setReceitaEditando] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ nome: "" });
  const [form, setForm] = useState({
    nome: "",
    modoPreparo: "",
    categoriaId: "",
    ingredientesTexto: "",
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/categorias`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro no fetch de categorias");
        return res.json();
      })
      .then(data => {
        setCategorias(data);
        setErro(null);
      })
      .catch(err => {
        setErro(err.message);
        setCategorias([]);
      })
      .finally(() => setLoading(false));
  
    carregarReceitas();
  }, []);

  const carregarReceitas = () => {
    fetch(`${API}/receitas`)
      .then(res => res.json())
      .then(setReceitas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingredientes = form.ingredientesTexto
      .split("\n")
      .map(linha => {
        const [nome, quantidade] = linha.split("-").map(s => s.trim());
        return { nome, quantidade };
      });

    const receitaData = {
      nome: form.nome,
      modoPreparo: form.modoPreparo,
      categoriaId: parseInt(form.categoriaId),
      ingredientes
    };

    if (receitaEditando) {
      // Se está editando uma receita existente
      await fetch(`${API}/receitas/${receitaEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receitaData)
      });
      setReceitaEditando(null); // Limpa o estado de edição
    } else {
      // Se está criando uma nova receita
      await fetch(`${API}/receitas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receitaData)
      });
    }

    // Limpa o formulário independente se foi edição ou criação
    setForm({
      nome: "",
      modoPreparo: "",
      categoriaId: "",
      ingredientesTexto: "",
    });

    carregarReceitas();
  };

  const excluirReceita = async (id) => {
    await fetch(`${API}/receitas/${id}`, { method: "DELETE" });
    carregarReceitas();
  };

  // Funções para gerenciamento de categorias
  const handleCategoriaSubmit = async (e) => {
    e.preventDefault();
    
    if (!formCategoria.nome.trim()) return;
    
    if (categoriaEditando) {
      // Editar categoria existente
      await fetch(`${API}/categorias/${categoriaEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCategoria)
      });
      setCategoriaEditando(null);
    } else {
      // Criar nova categoria
      await fetch(`${API}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCategoria)
      });
    }
    
    // Limpa o formulário e recarrega categorias
    setFormCategoria({ nome: "" });
    
    // Recarregar lista de categorias
    fetch(`${API}/categorias`)
      .then(res => res.json())
      .then(data => {
        setCategorias(data);
      })
      .catch(err => console.error("Erro ao recarregar categorias:", err));
  };

  const editarCategoria = (categoria) => {
    setFormCategoria({ nome: categoria.nome });
    setCategoriaEditando(categoria.id);
  };

  const excluirCategoria = async (id) => {
    try {
      await fetch(`${API}/categorias/${id}`, { method: "DELETE" });
      
      // Recarregar lista de categorias
      fetch(`${API}/categorias`)
        .then(res => res.json())
        .then(setCategorias);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Não foi possível excluir a categoria. Ela pode estar sendo usada por alguma receita.");
    }
  };

  const editarReceita = (receita) => {
    // Prepara o formato dos ingredientes para o textarea
    const ingredientesTexto = receita.ingredientes
      .map(i => `${i.nome} - ${i.quantidade}`)
      .join('\n');

    // Define os dados no formulário
    setForm({
      nome: receita.nome,
      modoPreparo: receita.modoPreparo,
      categoriaId: receita.categoriaId,
      ingredientesTexto: ingredientesTexto
    });

    // Marca essa receita como sendo editada
    setReceitaEditando(receita.id);
    
    // Scroll até o formulário para facilitar a edição
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log("Renderizando App", { categorias, receitas, loading, erro, form });
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Receitas</h1>

      {loading && <p>Carregando categorias...</p>}
      {erro && <p style={{color: "red"}}>Erro ao carregar categorias: {erro}</p>}

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h2>Gerenciar Categorias</h2>
        
        {/* Formulário para adicionar/editar categorias */}
        <form onSubmit={handleCategoriaSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            placeholder="Nome da categoria"
            value={formCategoria.nome}
            onChange={(e) => setFormCategoria({ nome: e.target.value })}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
            required
          />
          <button 
            type="submit"
            style={{ 
              backgroundColor: categoriaEditando ? '#FF9800' : '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '10px 15px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {categoriaEditando ? 'Atualizar' : 'Adicionar'}
          </button>
        </form>
        
        {/* Lista de categorias */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {categorias.map(cat => (
            <div key={cat.id} style={{ 
              backgroundColor: '#e1e1e1', 
              padding: '10px 15px', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>{cat.nome}</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => editarCategoria(cat)}
                  style={{ 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    padding: '5px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => excluirCategoria(cat.id)}
                  style={{ 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    padding: '5px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2>{receitaEditando ? 'Editar Receita' : 'Cadastrar Nova Receita'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        <input
          placeholder="Nome da receita"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
        />
        <textarea
          placeholder="Modo de preparo"
          value={form.modoPreparo}
          onChange={(e) => setForm({ ...form, modoPreparo: e.target.value })}
          required
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minHeight: '100px', resize: 'vertical' }}
        />
        <select
          value={form.categoriaId}
          onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
          required
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: 'white' }}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
        <textarea
          placeholder="Ingredientes (nome - quantidade por linha)"
          value={form.ingredientesTexto}
          onChange={(e) => setForm({ ...form, ingredientesTexto: e.target.value })}
          required
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minHeight: '100px', resize: 'vertical' }}
        />
        <button 
          type="submit"
          style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4CAF50', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Salvar Receita
        </button>
      </form>

      <h2>Receitas Cadastradas</h2>
      {receitas.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", borderRadius: "8px", margin: "15px 0", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>{r.nome}</h3>
          <p style={{ margin: "8px 0" }}><strong>Modo de preparo:</strong> {r.modoPreparo}</p>
          <p style={{ margin: "8px 0" }}><strong>Categoria:</strong> {r.categoria?.nome}</p>
          <div style={{ margin: "15px 0" }}>
            <strong>Ingredientes:</strong>
            <ul style={{ marginTop: "5px", paddingLeft: "20px" }}>
              {r.ingredientes.map(i => (
                <li key={i.id} style={{ margin: "5px 0" }}>{i.nome} - {i.quantidade}</li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => editarReceita(r)} 
              style={{ 
                backgroundColor: "#2196F3", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                padding: "8px 15px", 
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Editar
            </button>
            <button 
              onClick={() => excluirReceita(r.id)} 
              style={{ 
                backgroundColor: "#f44336", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                padding: "8px 15px", 
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
