import React from 'react';
import './AuthLayout.css'; 

export default function AuthLayout({ children }) {
  return (
    // Container Principal: Define o fundo cinza claro e usa Flexbox para centralizar
    <div className="auth-layout-container">
      
      {/* Caixa do Formulário: Onde o formulário de Login/Cadastro fica */}
      <div className="auth-box">
        {/* Aqui é onde o conteúdo específico da página (Login ou Cadastro) é renderizado */}
        {children}
      </div>
      
    </div>
  );
}