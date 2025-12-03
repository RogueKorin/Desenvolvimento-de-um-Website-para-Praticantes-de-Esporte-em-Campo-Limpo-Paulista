import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api'; // Atenção: Verifique se este caminho para a API está correto!
import './Cadastro.css';
import logotipo_vertical from '../../assets/logotipo_vertical.png';

export default function Cadastro() {
  // 1. Lógica copiada da página de teste
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação extra (opcional): verificar se senhas coincidem
    // if (formData.senha !== formData.confirmarSenha) {
    //   return setError("As senhas não coincidem!");
    // }

    try {
      const res = await api.post("/auth/register", formData);
      alert(res.data.msg || "Cadastro realizado com sucesso!"); // Mensagem de sucesso
      navigate("/entrar"); // Redireciona para a página de login
    } catch (err) {
      setError(err.response?.data?.msg || "Erro no servidor. Tente novamente.");
    }
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-container">

        <div className="cadastro-header">
          <Link to="/" className="link-voltar">
            &larr; Voltar
          </Link>
          
          <div className="logo-area">
            <img src={logotipo_vertical} alt="Logotipo Connect Life" className="cadastro-logo" />
          </div>
        </div>

        {/* 2. Formulário conectado à lógica */}
        <form className="cadastro-form" onSubmit={handleSubmit}>

          {/* Adicionado para exibir mensagens de erro */}
          {error && (
            <div className="alert alert-danger" role="alert" style={{ width: '100%', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input 
              type="text" 
              id="nome"
              name="nome" // Atributo name é essencial
              value={formData.nome}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required 
            />
          </div>
          

          
          <p className="login-link">
            Já possui uma conta? <Link to="/entrar">Entrar</Link> {/* 4. Usando <Link> */}
          </p>

          <div className="cadastro-actions">
            <button type="submit" className="btn-cadastro-principal">
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}