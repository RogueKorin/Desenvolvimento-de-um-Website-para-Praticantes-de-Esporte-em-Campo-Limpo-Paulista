import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/api';
import { useAuth } from '../../../../contexts/AuthProvider';
import './CriarEventos.css'; // Importe o arquivo CSS
import logotipo_vertical from '../../../../assets/logotipo_vertical.png'; // Logotipo Importado

export default function CriarEvento() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [locais, setLocais] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const esportes = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Outro'];

  const [formData, setFormData] = useState({
    chat: '',
    nome: '',
    descricao: '',
    dataHora: '',
    local: '',
    esporte: 'Outro',
  });
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario) {
        setLoading(false);
        return;
      }
      
      try {
        const locaisRes = await api.get('/locais'); 
        setLocais(locaisRes.data);

        const chatsRes = await api.get('/chats');
        const criados = chatsRes.data.filter(chat => 
            chat.creator && chat.creator._id === usuario._id && chat.isGroup
        );
        setComunidades(criados);

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar locais ou comunidades.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    const payload = { 
        ...formData,
        dataHora: new Date(formData.dataHora) 
    };

    const chatSelecionado = comunidades.find(c => c._id === formData.chat);
    if (!chatSelecionado) {
        setSubmitError('Comunidade inválida ou você não tem permissão para criar evento nela.');
        return;
    }

    try {
      await api.post('/eventos', payload); 
      alert('Evento criado com sucesso!');
      navigate('/eventos');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Erro ao criar evento. Verifique os dados.';
      setSubmitError(msg);
    }
  };

  if (loading) {
    return (
      <div className="criar-evento-loading">
        <div className="criar-evento-spinner"></div>
        <p className="criar-evento-loading-text">Carregando dados...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="criar-evento-page">
        <div className="criar-evento-card">
          <div className="criar-evento-alert-error">{error}</div>
        </div>
      </div>
    );
  }
  
  if (comunidades.length === 0) {
      return (
          <div className="criar-evento-page">
              <div className="criar-evento-card">
                  <div className="criar-evento-header">
                      <button 
                        className="criar-evento-back-button" 
                        onClick={() => navigate(-1)}
                      >
                          ← Voltar
                      </button>
                      {/* NOVO: Substituição do Emoji/Texto pela Imagem (1ª OCORRÊNCIA) */}
                      <div className="criar-evento-logo">
                          <img 
                              src={logotipo_vertical} 
                              alt="Connect Life Logotipo" 
                              className="criar-evento-logo-img" 
                          />
                      </div>
                  </div>
                  <h1 className="criar-evento-title">Criar evento</h1>
                  <p className="criar-evento-empty-message">
                      Você precisa ser o criador de uma comunidade (chat de grupo) para poder criar um evento para ela.
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="criar-evento-page">
      <div className="criar-evento-card">
        <div className="criar-evento-header">
          <button 
            className="criar-evento-back-button" 
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>
          {/* NOVO: Substituição do Emoji/Texto pela Imagem (2ª OCORRÊNCIA) */}
          <div className="criar-evento-logo">
            <img 
                src={logotipo_vertical} 
                alt="Connect Life Logotipo" 
                className="criar-evento-logo-img" 
            />
          </div>
        </div>

        <h1 className="criar-evento-title">Criar evento</h1>
        <p className="criar-evento-subtitle">
          Preencha os dados e crie seu próprio evento!
        </p>
        
        {submitError && (
          <div className="criar-evento-alert-error">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="criar-evento-form">
          
          {/* Seleção de Comunidade */}
          <div className="form-group">
            <label className="criar-evento-label" htmlFor="chat">
              Comunidade
            </label>
            <select
              id="chat"
              name="chat"
              value={formData.chat}
              onChange={handleChange}
              className="criar-evento-select"
              required
            >
              <option value="">Selecione uma comunidade</option>
              {comunidades.map(chat => (
                <option key={chat._id} value={chat._id}>
                  {chat.name}
                </option>
              ))}
            </select>
            <small className="form-text">
              Apenas comunidades que você criou
            </small>
          </div>

          {/* Nome do Evento */}
          <div className="form-group">
            <label className="criar-evento-label" htmlFor="nome">
              Nome do evento
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="criar-evento-input"
              placeholder="Digite o nome do evento"
              required
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="criar-evento-label" htmlFor="descricao">
              Descrição do evento
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="criar-evento-textarea"
              placeholder="Descreva seu evento"
            />
          </div>

          {/* Data/Hora e Esporte (lado a lado) */}
          <div className="criar-evento-row-group">
            <div className="criar-evento-form-half">
              <label className="criar-evento-label" htmlFor="dataHora">
                Data e hora
              </label>
              <input
                type="datetime-local"
                id="dataHora"
                name="dataHora"
                value={formData.dataHora}
                onChange={handleChange}
                className="criar-evento-input"
                required
              />
            </div>

            <div className="criar-evento-form-half">
              <label className="criar-evento-label" htmlFor="esporte">
                Tipo de Esporte
              </label>
              <select
                id="esporte"
                name="esporte"
                value={formData.esporte}
                onChange={handleChange}
                className="criar-evento-select"
                required
              >
                {esportes.map(esporte => (
                  <option key={esporte} value={esporte}>
                    {esporte}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Local */}
          <div className="form-group">
            <label className="criar-evento-label" htmlFor="local">
              Local
            </label>
            <select
              id="local"
              name="local"
              value={formData.local}
              onChange={handleChange}
              className="criar-evento-select"
              required
            >
              <option value="">Selecione o local</option>
              {locais.map(local => (
                <option key={local._id} value={local._id}>
                  {local.nome} ({local.endereco})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="criar-evento-submit">
            Criar evento
          </button>
        </form>
      </div>
    </div>
  );
}