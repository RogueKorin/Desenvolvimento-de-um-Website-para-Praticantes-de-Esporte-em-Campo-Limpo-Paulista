// src/components/BotaoCriacao.js

import React from 'react';
import { Link } from 'react-router-dom';
import './botaocriar.css';

/**
 * Componente BotaoCriacao
 * @param {string} to - A rota (URL) para onde o botão deve navegar.
 * @param {string} text - O texto que aparece após o '+'. Ex: "Criar comunidade".
 */
const BotaoCriacao = ({ to, text }) => {
  return (
    <Link to={to} className="botao-criacao-link">
      + {text}
    </Link>
  );
};

export default BotaoCriacao;