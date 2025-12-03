import React from 'react';
import { Link } from 'react-router-dom';
import './cardcomunidade.css';

// Componente CardComunidade
const CardComunidade = ({ id, nome, descricao, membros, status, imagem, onJoin }) => {
  
  // Sua lógica original para texto do botão
  const isMembro = status === 'Membro'; 
  const buttonText = isMembro ? 'Entrar' : 'Entrar'; 
  
  return (
    <div className="card-comunidade">
        
      <div className="card-comunidade__esquerda">
        <div className="card-comunidade__imagem-placeholder">
            <img 
                // ✅ NOVO: Usa a prop 'imagem' diretamente, pois ela já é absoluta
                src={imagem} 
                alt={`Imagem de ${nome}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} 
                // O tratamento de erro (fallback) não é mais necessário aqui, 
                // pois getImageUrl já cuida disso.
                // Mas podemos deixá-lo para um 'segundo fallback' se houver problemas de rede.
                onError={(e) => {
                    e.target.onerror = null; 
                    // Tenta um placeholder de tamanho diferente, se a URL absoluta falhar por algum motivo
                    e.target.src = `https://via.placeholder.com/150/CCCCCC/808080?text=NP`; 
                }}
            />
        </div>
        
        <div className="card-comunidade__info">
            <h3 className="card-comunidade__nome">{nome}</h3>
            <p className="card-comunidade__descricao">{descricao}</p>
        </div>
      </div>
      
      <div className="card-comunidade__direita">
        <div className="card-comunidade__status-membros">
            {membros} Membros
        </div>

        <div className="card-comunidade__acoes">
            <button
                className="card-comunidade__botao-acao"
                // 3. Agora, clique chama a função onJoin passada pelo pai
                onClick={onJoin} 
            >
                {buttonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CardComunidade;