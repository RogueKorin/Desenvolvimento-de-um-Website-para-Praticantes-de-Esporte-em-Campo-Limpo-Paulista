// src/components/CardLocal.js

import { Link } from "react-router-dom";
import React from "react";
import "./cardlocal.css";

// Adicionando as props 'isAdmin' e 'onDelete'
const CardLocal = ({ nome, endereco, comodidadePrincipal, imagemUrl, id, isAdmin, onDelete }) => {
  // A lógica para o ícone de comodidade pode vir aqui
  const statusComodidade = comodidadePrincipal ? "Disponível" : "Indisponível";

  return (
    <div className="card-local">
      <div
        className="card-local__imagem"
        style={{ backgroundImage: `url(${imagemUrl})` }}
      >
        {/* Placeholder para a imagem */}
      </div>

      <div className="card-local__conteudo">
        <h3 className="card-local__nome">{nome}</h3>
        <p className="card-local__endereco">{endereco}</p>

        {isAdmin ? (
            // Se for Admin, mostra o botão de Apagar
            <button
              onClick={onDelete}
              className="card-local__botao-apagar" // Nova classe para o estilo vermelho
            >
              Apagar local
            </button>
        ) : (
            null
        )}
      </div>
    </div>
  );
};

export default CardLocal;