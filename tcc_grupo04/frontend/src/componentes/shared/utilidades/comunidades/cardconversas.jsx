// src/components/CardConversa.js

import React from 'react';
import { Link } from 'react-router-dom';
import './cardconversas.css';

const CardConversa = ({ id, titulo, ultimaMensagem, isNova }) => {
  
  // O item inteiro é um Link para a página de chat
  return (
    <Link 
      to={`/comunidades/conversas/${id}`} 
      className={`card-conversa ${isNova ? 'card-conversa--nova' : ''}`}
    >
      <div className="card-conversa__conteudo">
        <p className="card-conversa__titulo">{titulo}</p>
        <p className="card-conversa__mensagem">{ultimaMensagem}</p>
      </div>
      
      {/* Ícone de informação/notificação (o 'i' do wireframe) */}
      {isNova && (
        <span className="card-conversa__notificacao">i</span> 
      )}
    </Link>
  );
};

export default CardConversa;