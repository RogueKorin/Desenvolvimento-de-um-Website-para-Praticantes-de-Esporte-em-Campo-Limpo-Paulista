import React, { useState } from 'react';
import Sidebar from '../shared/sidebar.jsx';
import Footer from '../shared/footer.jsx'
import './UserLayout.css'; 

export default function UserLayout({ children }) {
  // 1. Estado para controlar se a Sidebar está visível. 
  // Iniciamos como 'false' (fechada) para refletir o estado padrão da tela.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  // Função para alternar o estado ao clicar no botão
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Aplica uma classe condicional ao container principal para adaptar o conteúdo
  const mainContentClasses = `user-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`;

  return (
    <div className="user-layout-wrapper">
      
      {/* 2. O Botão de Menu (Menu Hambúrguer) que chama a função de alternância */}
      <button 
        className="menu-toggle-button"
        onClick={toggleSidebar}
        // Exemplo: Ícone visual simples
        aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        ☰ 
      </button>

      {/* 3. A Sidebar (sempre renderizada, mas controlada por CSS) */}
      {/* Passamos o estado 'isSidebarOpen' para que ela saiba se deve deslizar para fora ou para dentro */}
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* 4. Overlay de Fundo: Para escurecer a tela e bloquear cliques quando a Sidebar está aberta */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}

      {/* 5. Área de Conteúdo (Main Content) */}
      <div className="user-content-area">
        
        {/* O conteúdo da página atual */}
        <main className={mainContentClasses}>
          {children}
        </main>
        
      </div>

      {/* 6. Footer Fixo na Base */}
      <Footer />
    </div>
  );
}