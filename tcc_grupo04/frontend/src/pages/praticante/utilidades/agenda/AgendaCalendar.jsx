// AgendaCalendar.jsx (CORRIGIDO com Lógica de API)

import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

// Importações necessárias para a API e Layout
import api from '../../../../api/api'; // <--- AJUSTE ESTE CAMINHO
import UserLayout from '../../../../componentes/layout/userlayout'; // <--- AJUSTE ESTE CAMINHO

import './AgendaCalendar.css';

// Rota de listagem de eventos (usando filtro para incluir todos os eventos passados e futuros)
const API_URL = '/eventos?futura=false';

// O componente não recebe mais a prop 'events'
const AgendaCalendar = () => {
    // 1. ESTADOS
    const [eventosApi, setEventosApi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);


    // 2. FUNÇÃO DE BUSCA E FORMATAÇÃO DE DADOS
    const fetchAndFormatEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(API_URL);
            const rawEvents = response.data;

            // Mapeia e formata os eventos do backend para o formato do FullCalendar
            const formattedEvents = rawEvents.map(evento => {
                const eventDate = new Date(evento.dataHora);
                
                // O FullCalendar aceita o formato Date.toISOString() completo para eventos com hora
                const dateStr = eventDate.toISOString(); 
                
                const timeStr = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const title = `${evento.nome} - ${evento.Esporte || 'Evento'}`;

                return {
                    // Propriedades padrão do FullCalendar
                    title: title, 
                    // 'date' ou 'start' são aceitos. Usamos 'start' para melhor compatibilidade.
                    start: dateStr, 
                    
                    // Propriedades estendidas para o painel de detalhes
                    extendedProps: {
                        time: timeStr,
                        // 'game' será a Comunidade / Chat
                        game: evento.chat?.name || 'Comunidade Desconhecida', 
                        // 'location' será o Local do evento
                        location: `${evento.local?.nome} (${evento.local?.endereco})` || 'Local Desconhecido',
                        // Adicionar a descrição para o painel de detalhes
                        descricao: evento.descricao
                    }
                };
            });

            setEventosApi(formattedEvents);

        } catch (err) {
            console.error("Erro ao carregar eventos para o calendário:", err);
            setError(err.response?.data?.msg || "Não foi possível carregar a agenda de eventos.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. EFEITO PARA CARREGAR OS DADOS NA MONTAGEM DO COMPONENTE
    useEffect(() => {
        fetchAndFormatEvents();
    }, [fetchAndFormatEvents]);


    // 4. LÓGICA DE EVENTOS (incluindo o evento estático como fallback ou exemplo)

    const defaultEvents = [
        {
          title: 'Inicio interclasse Etecamp (Exemplo Estático)',
          date: '2025-10-20',
          extendedProps: {
            time: '08:00',
            game: '3_ai x 2_a (Comunidade)',
            location: 'Ginasio de Campo Limpo Paulista',
            descricao: 'Exemplo de evento estático de demonstração.'
          }
        }
      ];

    // Se houver eventos da API, usamos eles. Caso contrário, usamos o evento de exemplo.
    const displayEvents = eventosApi.length > 0 ? eventosApi : defaultEvents;


    // 5. Função chamada ao clicar em um evento
    const handleEventClick = (info) => {
        const event = info.event;
        setSelectedEvent({
            title: event.title,
            date: event.startStr,
            time: event.extendedProps.time,
            // Usamos os extendedProps para mostrar no painel
            game: event.extendedProps.game, 
            location: event.extendedProps.location,
            descricao: event.extendedProps.descricao
        });
    };

    // 6. RENDERIZAÇÃO
    if (loading) {
        return <UserLayout><div className="loading-state">Carregando Agenda...</div></UserLayout>;
    }
    
    if (error) {
        return <UserLayout><div className="error-state alert alert-danger">{error}</div></UserLayout>;
    }


    return (
        <UserLayout>
        <div className="agenda-container">
          <div className="agenda-header">
            <h1>Sua Agenda</h1>
            <p>Confira todas as competições e eventos disponíveis aqui!</p>
          </div>

          <div className="agenda-content">
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={ptBrLocale}
                events={displayEvents}
                eventClick={handleEventClick}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                }}
                buttonText={{
                    today: 'Hoje'
                }}
                height="auto"
                dayMaxEvents={true}
                eventColor="#000000ff" // Verde
              />
            </div>

            <div className="event-details-panel">
              {selectedEvent ? (
                <>
                  <h2>{selectedEvent.title}</h2>
                  <div className="event-info">
                    <p><strong>Comunidade/Chat:</strong> {selectedEvent.game}</p>
                    <p><strong>Local:</strong> {selectedEvent.location}</p>
                    <p><strong>Data:</strong> {new Date(selectedEvent.date).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Hora:</strong> {selectedEvent.time}</p>
                    <hr/>
                    <p><strong>Descrição:</strong> {selectedEvent.descricao}</p>
                  </div>
                </>
              ) : (
                <div className="no-event-selected">
                  <p>Clique em um evento no calendário para ver os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </UserLayout>
    );
};

export default AgendaCalendar;