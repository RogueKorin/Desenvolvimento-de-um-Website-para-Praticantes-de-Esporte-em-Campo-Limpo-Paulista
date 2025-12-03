import React, { useState, useEffect, useCallback } from "react";
// Importações essenciais
import { useAuth } from "../../../../contexts/AuthProvider"; // Ajuste o caminho conforme sua estrutura
import api from "../../../../api/api"; // Ajuste o caminho
import UserLayout from "../../../../componentes/layout/userlayout"; // Ajuste o caminho
import "./eventos.css"; // Estilos específicos para a página de eventos

// 1. NOVO: Importe o componente BotaoCriacao
import BotaoCriacao from "../../../../componentes/shared/utilidades/botaocriar"; 

// 2. NOVO: Importe o CSS do botão para garantir o estilo correto (caso não seja global)
import "../../../../componentes/shared/utilidades/botaocriar.css"; 


// URL base da API
const API_BASE_URL = '/eventos';

const Eventos = () => {
    // 1. ESTADOS E AUTENTICAÇÃO
    const { loading: authLoading, usuario } = useAuth(); // Inclui 'usuario' para checagem de Admin
    // Checagem de Admin
    const isAdmin = usuario && usuario.tipo === 'admin'; 

    // --- ESTADOS DA LISTA DE EVENTOS ---
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true); // Loading da lista
    const [error, setError] = useState(null);
    const [futuros, setFuturos] = useState(true); // Estado para o filtro de eventos futuros

    // Função para buscar os eventos do backend
    const fetchEventos = useCallback(async (apenasFuturos) => {
        setLoading(true);
        setError(null);
        try {
            // Se apenasFuturos for true, adiciona o query param 'futura=true'
            const url = `${API_BASE_URL}?futura=${apenasFuturos ? 'true' : 'false'}`;
            
            // Usa a instância 'api' corrigida com o Interceptor!
            const response = await api.get(url);
            
            setEventos(response.data);
        } catch (err) {
            console.error("Erro ao buscar eventos:", err);
            // Captura a mensagem do backend se disponível
            setError(err.response?.data?.msg || "Erro ao carregar a lista de eventos.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. EFEITO PARA CARREGAR OS DADOS
    useEffect(() => {
        if (!authLoading) {
            fetchEventos(futuros);
        }
    }, [authLoading, fetchEventos, futuros]); // Roda quando a autenticação termina ou o filtro muda


    // 3. FUNÇÃO PARA RENDERIZAR O CONTEÚDO
    const renderContent = () => {
        if (loading) {
            // O loading precisa ser adaptado para ocupar a tela inteira (opcional)
            return <div className="eventos-loading">Carregando eventos...</div>;
        }

        if (error) {
            return <div className="eventos-error alert alert-danger">{error}</div>;
        }

        if (eventos.length === 0) {
            return <div className="eventos-empty-state">Nenhum evento {futuros ? 'futuro' : ''} encontrado.</div>;
        }

        return (
            // A lista de cards em si
            <div className="eventos-lista"> 
                {eventos.map(evento => (
                    // Seu card de evento
                    <div key={evento._id} className="card-evento">
                        <h3>{evento.nome}</h3>
                        <p>{evento.descricao}</p>
                        <p>
                            <strong>Comunidade:</strong> {evento.chat?.name || 'Desconhecida'}
                            <br/>
                            <strong>Local:</strong> {evento.local?.nome || 'Desconhecido'} ({evento.local?.endereco || ''})
                        </p>
                        <p>
                            <strong>Data:</strong> {new Date(evento.dataHora).toLocaleDateString()}
                            {' - '}
                            <strong>Hora:</strong> {new Date(evento.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p><strong>Esporte:</strong> {evento.esporte}</p>
                    </div>
                ))}
            </div>
        );
    };


    return (
        // 1. CONTAINER PRINCIPAL: Class 'pagina-eventos'
        <UserLayout>
            {/* CONTAINER COM POSIÇÃO RELATIVA PARA O BOTÃO FLUTUAR */}
            <div className="pagina-eventos" style={{ position: 'relative' }}> 
                
                {/* NOVO: BOTÃO DE CRIAÇÃO - VISÍVEL APENAS PARA ADMIN */}
                {/* 3. ADICIONE O BotaoCriacao. Você deve definir a rota (URL) de criação do evento. */}
                {(
                    <BotaoCriacao
                        to="/criar-eventos" // AJUSTE esta rota para a URL correta do seu formulário de criação
                        text="Novo Evento"
                    />
                )}
                
                {/* 2. HEADER: Class 'eventos-header' */}
                <div className="eventos-header">
                    <h1>Eventos</h1>
                    <p>Confira os próximos eventos esportivos e comunitários na sua região.</p>
                </div>
                
                {/* 3. FILTROS: Class 'eventos-filters' */}
                <div className="eventos-filters">
                    <button 
                        className={`btn ${futuros ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFuturos(true)}
                        disabled={loading}
                    >
                        Próximos Eventos
                    </button>
                    <button 
                        className={`btn ${!futuros ? 'btn-primary' : 'btn-outline-secondary'} ms-2`}
                        onClick={() => setFuturos(false)}
                        disabled={loading}
                    >
                        Todos os Eventos
                    </button>
                </div>
                
                {/* 4. CONTEÚDO/LISTA: Class 'eventos-listagem-container' */}
                <div className="eventos-listagem-container">
                    {renderContent()}
                </div>
            </div>
        </UserLayout>
    );
};

export default Eventos;