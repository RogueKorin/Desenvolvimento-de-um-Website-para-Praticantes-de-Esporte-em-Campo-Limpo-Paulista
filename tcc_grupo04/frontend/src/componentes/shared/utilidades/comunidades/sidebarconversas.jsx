// src/components/SidebarConversas.js

import React from 'react';
import CardConversa from './cardconversas'; 
import './sidebarconversas.css';

// Dados de Exemplo (Simulando o que viria de uma API)
const listaConversas = [
  { id: 1, titulo: "Equipe de fut etcamp", ultimaMensagem: "prof_et_fisica: Treino amanhã...", isNova: false },
  { id: 2, titulo: "muryllo_pery", ultimaMensagem: "Treino de peito hoje?", isNova: true },
  { id: 3, titulo: "Vôlei no ginásio", ultimaMensagem: "Envie uma mensagem...", isNova: false },
];

const SidebarConversas = () => {
  return (
    <div className="sidebar-conversas">
      <h3 className="sidebar-conversas__titulo">Conversas</h3>
      
      <div className="sidebar-conversas__lista">
        {listaConversas.map((conversa) => (
          <CardConversa 
            key={conversa.id}
            id={conversa.id}
            titulo={conversa.titulo}
            ultimaMensagem={conversa.ultimaMensagem}
            isNova={conversa.isNova}
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarConversas;