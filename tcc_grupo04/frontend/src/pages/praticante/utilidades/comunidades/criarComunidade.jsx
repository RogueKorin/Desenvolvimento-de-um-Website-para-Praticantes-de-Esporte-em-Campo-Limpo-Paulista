import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/api';
import { useAuth } from '../../../../contexts/AuthProvider';
import UserLayout from '../../../../componentes/layout/userlayout'; 
import './CriarComunidade.css';

// Lista de esportes (para o campo 'esporte' da comunidade)
const SPORT_TYPES = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Outro'];

export default function CriarComunidade() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    // ESTADOS
    const [users, setUsers] = useState([]); 
    const [selectedMembers, setSelectedMembers] = useState([]); 
    const [newGroupName, setNewGroupName] = useState(''); 
    const [groupImageFile, setGroupImageFile] = useState(null); 
    const [descricao, setDescricao] = useState('');
    const [esporte, setEsporte] = useState(SPORT_TYPES[0]); 
    
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState(null);

    // FUNÇÃO AUXILIAR CORRIGIDA
    // Converte o caminho relativo do PFP em um URL completo para o frontend
    const getPfpUrl = (pfpPath) => {
        if (!pfpPath || pfpPath.startsWith('http')) {
            // Retorna o caminho ou uma imagem padrão se for nulo
            return pfpPath || "https://via.placeholder.com/50/CCCCCC/808080?text=NP"; 
        }
        
        // Remove '/api' se existir no baseURL (assumindo que as imagens são servidas na raiz do servidor)
        const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : '';
        return `${baseUrl}${pfpPath}`;
    }

    // Efeito para buscar todos os usuários (inalterado)
    useEffect(() => {
        const fetchUsers = async () => {
            if (!usuario) {
                setFormLoading(false);
                return;
            }
            try {
                const res = await api.get('/usuarios/list'); 
                setUsers(res.data.filter(u => u._id !== usuario._id));
            } catch (err) {
                console.error('Erro ao buscar usuários:', err.response || err);
                setError(err.response?.data?.msg || 'Erro ao carregar lista de usuários. O backend pode estar fora do ar ou sem permissão (403).');
            } finally {
                setFormLoading(false);
            }
        };

        if (usuario) {
            setFormLoading(true);
            fetchUsers();
        }
    }, [usuario]);
    
    // Manipulação de Checkbox de Membros (inalterado)
    const handleMemberChange = (e) => {
        const userId = e.target.value;
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };
    
    // Submissão do Formulário (inalterado, pois já estava correto com FormData)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFormLoading(true);

        if (!newGroupName.trim() || selectedMembers.length === 0) {
            setError('O nome e pelo menos um membro (além de você) são obrigatórios.');
            setFormLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('isGroup', true);
        formData.append('name', newGroupName.trim());
        formData.append('descricao', descricao);
        formData.append('esporte', esporte);
        
        formData.append('members', JSON.stringify(selectedMembers)); 
        
        if (groupImageFile) {
            formData.append('groupImage', groupImageFile);
        }

        try {
            await api.post('/chats', formData); 
            
            alert('Comunidade criada com sucesso!');
            navigate(`/conversas`); 
            
        } catch (err) {
            console.error('Erro ao criar grupo:', err.response?.data || err);
            setError(err.response?.data?.msg || 'Erro ao criar a comunidade. Tente novamente.');
        } finally {
            setFormLoading(false);
        }
    };

    if (formLoading && users.length === 0 && !error) {
        return <UserLayout><div className="criar-comunidade-loading-text">Carregando dados necessários...</div></UserLayout>;
    }


    return (
        <UserLayout>
            <div className="criar-comunidade-wrapper">
                <div className="criar-comunidade-card">
                    
                    <div className="criar-comunidade-header">
                        <h1>Criar Nova Comunidade</h1>
                        <button 
                            className="criar-comunidade-back-button" 
                            onClick={() => navigate('/comunidades')}
                        >
                            ← Voltar
                        </button>
                    </div>

                    {error && (
                        <div className="criar-comunidade-alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="criar-comunidade-form">
                        
                        {/* Campo Nome (inalterado) */}
                        <div className="form-group">
                            <label className="criar-comunidade-label" htmlFor="groupName">Nome da Comunidade</label>
                            <input 
                                id="groupName"
                                name="groupName"
                                type="text"
                                className="criar-comunidade-input"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Ex: Futeboleiros de Segunda"
                                required
                            />
                        </div>

                        {/* Campo Descrição (inalterado) */}
                        <div className="form-group">
                            <label className="criar-comunidade-label" htmlFor="descricao">Descrição (Opcional)</label>
                            <textarea 
                                id="descricao"
                                name="descricao"
                                className="criar-comunidade-textarea"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Fale um pouco sobre o objetivo do grupo..."
                                rows="3"
                            />
                        </div>

                        {/* Campo Imagem (AGORA É INPUT FILE) - Inalterado */}
                        <div className="form-group">
                            <label className="criar-comunidade-label" htmlFor="groupImage">Imagem da Comunidade (Opcional)</label>
                            <input 
                                id="groupImage"
                                name="groupImage"
                                type="file" 
                                className="criar-comunidade-input"
                                onChange={(e) => setGroupImageFile(e.target.files[0])} 
                                accept="image/*" 
                            />
                        </div>

                        {/* Campo Esporte (inalterado) */}
                        <div className="form-group">
                            <label className="criar-comunidade-label" htmlFor="esporte">Esporte Principal</label>
                            <select 
                                id="esporte"
                                name="esporte"
                                className="criar-comunidade-select"
                                value={esporte}
                                onChange={(e) => setEsporte(e.target.value)}
                            >
                                {SPORT_TYPES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Seleção de Membros - CORRIGIDO ABAIXO */}
                        <div className="form-group">
                            <label className="criar-comunidade-label">Membros (Selecione pelo menos um)</label>
                            <div className="members-list">
                                {users.length === 0 ? (
                                    <p className="text-muted p-2">
                                        {error ? `Erro ao carregar usuários: ${error}` : 'Carregando usuários...'}
                                    </p>
                                ) : (
                                    users.map(user => (
                                        <div key={user._id} className="member-checkbox-item">
                                            <input
                                                type="checkbox"
                                                id={`member-${user._id}`}
                                                value={user._id}
                                                checked={selectedMembers.includes(user._id)}
                                                onChange={handleMemberChange}
                                            />
                                            <label htmlFor={`member-${user._id}`} className="member-label">
                                                {/* CORREÇÃO: Usa getPfpUrl para o src e adiciona onError */}
                                                <img 
                                                     src={getPfpUrl(user.pfp)} 
                                                     alt={user.nome} 
                                                     className="member-pfp" 
                                                     onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://via.placeholder.com/50/CCCCCC/808080?text=NP"; // Fallback
                                                     }}
                                                 />
                                                {user.nome}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button type="submit" className="criar-comunidade-submit" disabled={formLoading || users.length === 0}>
                            {formLoading ? 'Criando Comunidade...' : 'Criar Comunidade'}
                        </button>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
}