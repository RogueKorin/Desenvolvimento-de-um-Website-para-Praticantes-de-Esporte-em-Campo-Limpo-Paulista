import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from "../../contexts/AuthProvider"; // <-- Já importado
import { useNavigate } from 'react-router-dom';

import logotipo_vertical_dark from '../../assets/logotipo_vertical_dark.png'


export default function Sidebar({ isOpen }) {
  // 1. NOVO: Desestruturar 'usuario' de useAuth()
  const { logout, usuario } = useAuth();

  // Variável de checagem para simplificar a renderização
  const isAdmin = usuario && usuario.tipo === 'admin';

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/entrar");
  };

  const sidebarClasses = `sidebar ${isOpen ? 'is-open' : ''}`;

  return (
    <nav className={sidebarClasses}>

      {/* 1. Logotipo Horizontal (Topo Centralizado) */}
      <div className="sidebar-logo-container">
        <img
          src={logotipo_vertical_dark}
          alt="Logotipo Connect Life"
          className="sidebar-logo"
        />
      </div>

      <div className="sidebar-menu">
        <Link to="/home" className="sidebar-item sidebar-main-item">
          Página inicial
        </Link>

        <div className="sidebar-group-title">Utilidades</div>
        <Link to="/comunidades" className="sidebar-item">
          Comunidades
        </Link>
        <Link to="/eventos" className="sidebar-item">
          Eventos
        </Link>
        <Link to="/locais" className="sidebar-item">
          Locais
        </Link>
        <Link to="/agenda" className="sidebar-item">
          Agenda
        </Link>
        <Link to="/conversas" className="sidebar-item">
          Conversas
        </Link>


        {/* 2. NOVO: Link de Administrador */}
        {isAdmin && (
          <div className="admin-section">
            <div className="sidebar-group-title admin-title">Administração</div>
            <Link to="/admin/users" className="sidebar-item sidebar-admin-item">
              Gerenciar Usuários
            </Link>
            <Link to="/admin/comunidades" className="sidebar-item sidebar-admin-item">
              Gerenciar Comunidades
            </Link>
          </div>
        )}

        {/* TÍTULO DO GRUPO: Pessoais */}
        <div className="sidebar-group-title">Pessoais</div>

        <Link to="/meuperfil" className="sidebar-item sidebar-profile-link">
          Minha conta
        </Link>

        {/* 3. Botão de Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-logout-button" // Usando esta classe para estilizar
        >
          Sair
        </button>
      </div>

    </nav>
  );
}