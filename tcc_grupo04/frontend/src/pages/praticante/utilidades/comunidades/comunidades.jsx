import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthProvider"; 
import api from "../../../../api/api"; 

import BotaoCriacao from "../../../../componentes/shared/utilidades/botaocriar";
import CardComunidade from "../../../../componentes/shared/utilidades/comunidades/cardcomunidade";
import UserLayout from "../../../../componentes/layout/userlayout";
import { useNavigate } from "react-router-dom"; 
import "./comunidades.css";

// Lista de esportes para o dropdown de filtro
const esportesDisponiveis = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Natação', 'Ciclismo']; 

const Comunidades = () => {
    // 1. LÓGICA E ESTADOS VINDOS DO BACKEND
    const { token, loading: authLoading } = useAuth();
    
    const [comunidades, setComunidades] = useState([]);
    // Estado para o filtro de esporte (null = Todos)
    const [esporteSelecionado, setEsporteSelecionado] = useState(null); 
    // Estado para gerenciar os filtros dos dropdowns
    const [filtrosDropdown, setFiltrosDropdown] = useState({}); 

    const API_URL = 'http://localhost:4000/api'; // Assumindo a mesma URL da sua API
    const SERVER_BASE_URL = API_URL.replace('/api', '');

    const getImageUrl = (path, size = 150) => {
    if (!path || path.startsWith('http') || path.startsWith('blob:')) {
        return path || `https://via.placeholder.com/${size}/CCCCCC/808080?text=NP`;
    }
    return `${SERVER_BASE_URL}${path}`;
}
    
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const buscarComunidades = useCallback(async () => {
        if (authLoading || !token) {
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const params = {};
            
            // 1. ADICIONA O FILTRO DE ESPORTE
            if (esporteSelecionado) {
                params.sport = esporteSelecionado;
            }

            // 2. ADICIONA OUTROS FILTROS (dos dropdowns)
            Object.keys(filtrosDropdown).forEach(key => {
                if (key.toLowerCase() !== 'esportes' && filtrosDropdown[key]) {
                    // Assume que a chave do filtro (ex: sexo) corresponde ao parâmetro da API
                    params[key.toLowerCase()] = filtrosDropdown[key];
                }
            });

            const response = await api.get("/chats/abertos", {
                params: params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setComunidades(response.data);

        } catch (err) {
            const msg = err.response?.data?.msg || 'Falha ao buscar comunidades. Tente novamente.';
            setError(msg);
            console.error('Erro ao buscar comunidades:', err);
        } finally {
            setLoading(false);
        }
    }, [token, authLoading, esporteSelecionado, filtrosDropdown]);

    useEffect(() => {
        buscarComunidades();
    }, [buscarComunidades]);


const handleJoinCommunity = async (chatId, chatName) => {
        if (!token) {
            alert("Você precisa estar logado para entrar em uma comunidade.");
            return;
        }

        try {
            await api.post(`/chats/${chatId}/join`, {}, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });

            // 2. Alerta de sucesso
            alert(`Parabéns! Você entrou na comunidade: ${chatName}`);
            
            // 3. **ADICIONA O ATRASO DE 2 SEGUNDOS ANTES DO REDIRECIONAMENTO**
            setTimeout(() => {
                navigate(`/conversas`);
            }, 2000); // 2000 milissegundos = 2 segundos

            // É recomendável não recarregar a lista se o usuário já está sendo redirecionado.
            // Se fosse ficar na mesma página, chamar buscarComunidades() seria melhor.
            
        } catch (err) {
            const msg = err.response?.data?.msg || 'Falha ao tentar entrar na comunidade.';
            alert(`Erro: ${msg}`);
            console.error('Erro ao entrar na comunidade:', err);
        }
    };

    /**
     * Lógica para lidar com a seleção do filtro de Esporte (dropdown)
     */
    const handleFiltroChange = (event) => {
        const value = event.target.value;
        // Se o valor for vazio (vindo da opção "Todos os Esportes"), seta para null.
        const novoFiltro = value === "" ? null : value; 
        setEsporteSelecionado(novoFiltro);
    };

    if (authLoading) return <UserLayout><div className="pagina-comunidades-status">Verificando autenticação...</div></UserLayout>;
    if (!token) return <UserLayout><div className="pagina-comunidades-status erro">Você precisa estar logado para ver as comunidades.</div></UserLayout>;

    return (
        <UserLayout>
            <div className="pagina-comunidades">
                <div className="header-comunidades">
                    <h1>Comunidades</h1>
                    <p>Conecte-se a pessoas com a mesma vontade que você!</p>
                </div>
                
                <BotaoCriacao to="/comunidades/criar" text="Criar comunidade" />

                <div className="comunidades-layout-principal">
                    <main className="comunidades-principal">
                        
                        
                        {/* NOVO: Filtro Dropdown para Esportes */}
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong>Filtrar por Esporte:</strong>
                            <select 
                                // O valor deve ser "" se for null, para selecionar a opção "Todos"
                                value={esporteSelecionado || ""} 
                                onChange={handleFiltroChange}
                                style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
                            >
                                <option value="">Todos os Esportes</option>
                                {esportesDisponiveis.map(esporte => (
                                    <option key={esporte} value={esporte}>{esporte}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. CONTEÚDO DINÂMICO BASEADO NO ESTADO */}
                        {loading && <p className="comunidades-lista-status">Carregando comunidades...</p>}
                        {error && <p className="comunidades-lista-status erro">Erro: {error}</p>}
                        {!loading && !error && comunidades.length === 0 && (
                            <p className="comunidades-lista-status">
                                Nenhuma comunidade encontrada {esporteSelecionado ? `para "${esporteSelecionado}"` : 'com os filtros selecionados'}.
                            </p>
                        )}

                        {!loading && !error && comunidades.length > 0 && (
                            <div className="comunidades-lista-cards">
                                {/* 3. MAPEAMENTO DOS DADOS DA API PARA OS CARDS */}
                                {comunidades.map((comunidade) => (
                                    <CardComunidade 
                                        key={comunidade._id} 
                                        id={comunidade._id}
                                        nome={comunidade.name}
                                        descricao={comunidade.descricao}
                                        membros={comunidade.numMembers}
                                        imagem={getImageUrl(comunidade.groupImage, 150)}
                                        criador={comunidade.creator}
                                        onJoin={() => handleJoinCommunity(comunidade._id, comunidade.name)} 
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </UserLayout>
    );
};

export default Comunidades;