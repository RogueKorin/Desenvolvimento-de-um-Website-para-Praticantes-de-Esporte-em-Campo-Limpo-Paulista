import React, { useState } from "react";
import './entrar.css';
import logotipo_vertical from '../../assets/logotipo_vertical.png';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from "../../contexts/AuthProvider"; // <-- Importe o useAuth

export default function Entrar() {
  // 1. Lógica copiada do componente de teste
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- Obtenha a função 'login' do contexto de autenticação

  const [formData, setFormData] = useState({
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
    try {
      await login(formData.email, formData.senha);
      navigate("/home"); 

    } catch (err) {
      setError(err.response?.data?.msg || "Erro no servidor. Tente novamente.");
    }
  };

  return (
    <div className="login-page"> 
      <div className="login-container">

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
            <label htmlFor="login-email">E-mail</label>
            <input 
              type="email" 
              id="login-email" 
              name="email" // Atributo 'name' é essencial
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-senha">Senha</label>
            <input 
              type="password" 
              id="login-senha" 
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required 
            />
          </div>

          <p className="signup-link">
            Ainda não é cadastrado? <Link to="/cadastro">Cadastre-se!</Link>
          </p>

          <div className="login-actions">
            <button type="submit" className="btn-entrar-principal">
              Entrar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}