import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; 
import logotipo_horizontal_dark from '../../assets/logotipo_horizontal_dark.png'; 

export default function Footer() {
  return (  
    <footer className="logged-footer">
      
      {/* 1. Links de Navegação (Esquerda) */}
      <nav className="footer-nav-links">
        <Link to="/sobre-nos" className="footer-link">Sobre nós</Link>
        <Link to="/sobre-marca" className="footer-link">Sobre a marca</Link>
      </nav>
      
      {/* 2. Direitos Autorais (Centro) */}
      <div className="footer-copyright">
        © 2025 Grupo 4. Todos os direitos reservados.
      </div>

      {/* 3. Logotipo Horizontal (Direita) */}
      <img 
        src={logotipo_horizontal_dark} 
        alt="Logotipo Connect Life" 
        className="footer-logo-horizontal" 
      />
    </footer>
  );
}