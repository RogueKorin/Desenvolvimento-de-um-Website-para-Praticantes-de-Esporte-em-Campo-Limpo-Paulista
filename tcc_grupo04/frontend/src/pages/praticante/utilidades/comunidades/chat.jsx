import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthProvider';
import "./Chat.css"; // Certifique-se de que o caminho está correto!
import UserLayout from '../../../../componentes/layout/userlayout';

const API_URL = 'http://localhost:4000/api'; // Sua URL base da API
const SERVER_BASE_URL = API_URL.replace('/api', ''); // Resulta em 'http://localhost:4000'

// Lista de esportes para o Select (deve coincidir com o ENUM no backend, se houver)
const SPORT_TYPES = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Natação', 'Outro'];

// ✅ NOVO: Função auxiliar para obter a URL completa da imagem
const getImageUrl = (path) => {
    // Se o caminho for nulo, indefinido, ou já for uma URL completa (http/https ou blob: para preview), retorna o próprio caminho (ou o placeholder).
    if (!path || path.startsWith('http') || path.startsWith('blob:')) {
        // Placeholder com iniciais "NP" (No Picture) para 40x40
        return path || "https://via.placeholder.com/40/CCCCCC/808080?text=NP"; 
    }
    // Concatena a URL base com o caminho relativo (ex: /uploads/...)
    return `${SERVER_BASE_URL}${path}`;
}

function ChatApp() {
    const { token, usuario, loading } = useAuth();
    const [chats, setChats] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState(''); 
    const [newGroupName, setNewGroupName] = useState(''); 
    const [users, setUsers] = useState([]); 
    const [selectedMembers, setSelectedMembers] = useState([]); 
    const messagesEndRef = useRef(null); 

    // Estados para edição de grupo
    const [isEditingGroup, setIsEditingGroup] = useState(false); 
    const [groupToEdit, setGroupToEdit] = useState(null); 
    const [editGroupData, setEditGroupData] = useState({
        name: '',
        descricao: '',
        groupImage: '', 
        meetupTime: '',
        meetupDays: [],
        members: [], 
        sportType: 'Outro', 
        aberto: true, 
    }); 
    const [editMessage, setEditMessage] = useState('');
    const [newGroupImageFile, setNewGroupImageFile] = useState(null);

    // ✅ NOVO HANDLER: Lida com a seleção do arquivo
    const handleImageFileChange = (e) => {
        // Pega o primeiro arquivo do input
        const file = e.target.files[0];
        setNewGroupImageFile(file); // Define o arquivo no estado
        
        // Opcional: Para visualização (preview) imediata no frontend 
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            // Atualiza o groupImage do editGroupData temporariamente para exibir o preview
            setEditGroupData(prev => ({
                ...prev,
                groupImage: fileUrl, 
            }));
        }
    };


    // Função para buscar todos os chats do usuário (inalterada)
    const fetchChats = useCallback(async () => {
        if (token) {
            try {
                const res = await axios.get(`${API_URL}/chats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
        
                }); 
                setChats(res.data); 
            } catch (err) {
                console.error('Erro ao buscar chats:', err);
            }
        }
    }, [token]);
    // Função para buscar todos os usuários (inalterada)
    const fetchUsers = useCallback(async () => {
        if (token) {
            try {
                const res = await axios.get(`${API_URL}/usuarios/list`, {
   
                    headers: { 'Authorization': `Bearer ${token}` }
                }); 
                setUsers(res.data); 
            } catch (err) {
                console.error('Erro ao buscar usuários:', err);
           
            } 
        }
    }, [token]);
    // Função para buscar as mensagens de um chat específico (inalterada)
    const fetchMessages = useCallback(async (chatId) => {
        if (token && chatId) {
            try {
                const res = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
          
                }); 
                setMessages(res.data.messages); 
            } catch (err) {
                console.error('Erro ao buscar mensagens:', err);
                setMessages([]);
            }
        }
    }, [token]);
    useEffect(() => {
        fetchChats(); 
        fetchUsers(); 
    }, [fetchChats, fetchUsers]);
    // Auto-scroll para a última mensagem (inalterada)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [messages]);
    // Lida com a seleção de um chat na lista (inalterada)
    const handleSelectChat = (chat) => {
        setSelectedChat(chat); 
        fetchMessages(chat._id); 
        setNewMessage(''); 
    };

    // Função para enviar uma nova mensagem (inalterada)
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return; 

        try {
            await axios.post(`${API_URL}/chats/${selectedChat._id}/messages`, { content: newMessage }, {
                headers: { 'Authorization': `Bearer ${token}` }
            }); 
            fetchMessages(selectedChat._id); 
            setNewMessage(''); 
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err.response?.data || err); 
            alert(`Erro ao enviar mensagem: ${err.response?.data?.msg || 'Erro desconhecido'}`); 
        }
    };
    // Lida com a criação de um novo grupo (inalterada)
    const handleCreateGroup = async (e) => {
        e.preventDefault(); 
        if (!newGroupName.trim() || selectedMembers.length === 0) { 
            alert('O nome do grupo e pelo menos um membro devem ser selecionados.'); 
            return; 
        }
        try { 
            await axios.post(`${API_URL}/chats`, {
                isGroup: true,
                name: newGroupName,
                members: selectedMembers,
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}` }
            }); 

            alert('Grupo criado com sucesso!'); 
            setNewGroupName(''); 
            setSelectedMembers([]); 
            // isCreatingGroup não está definido, presumindo que você não está usando a funcionalidade de criar grupo neste componente
            // setIsCreatingGroup(false); 
            fetchChats(); 
        } catch (err) {
            console.error('Erro ao criar grupo:', err.response?.data || err); 
            alert(`Erro ao criar grupo: ${err.response?.data?.msg || 'Erro desconhecido'}`); 
        }
    };
    // Inicializa o formulário de edição quando um grupo é selecionado (inalterada)
    useEffect(() => {
        if (groupToEdit) { 
            setEditGroupData({
                name: groupToEdit.name || '',
                descricao: groupToEdit.descricao || '',
                groupImage: groupToEdit.groupImage || '',
  
                // Meetup Details
                meetupTime: groupToEdit.meetupDetails?.time || '',
                meetupDays: groupToEdit.meetupDetails?.days || [],
                // Membros (apenas IDs)
                members: groupToEdit.members.map(m => m._id.toString()), 
       
                // NOVO CAMPO: Inicialização de sportType
                sportType: groupToEdit.sportType || 'Outro', 
                // NOVO CAMPO: Inicialização de aberto (booleano)
                aberto: groupToEdit.aberto !== undefined ? groupToEdit.aberto : true, 
            });
      
            setEditMessage(''); 
        }
    }, [groupToEdit]);
    // FUNÇÃO PARA ABRIR O EDITOR (inalterada)
    const handleEditGroup = (chat) => {
        // Verifica se é um grupo E se o usuário logado é o criador
        if (chat.isGroup && chat.creator._id === usuario._id) { 
            setGroupToEdit(chat); 
            setIsEditingGroup(true); 
        } else {
            alert('Você não é o criador deste grupo e não pode editá-lo.'); 
        }
    };
    
    // HANDLERS DE FORMULÁRIO (Simples - inalterados)
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target; 
        // NOVO: Lida com o campo 'aberto' (checkbox)
        if (name === 'aberto' && type === 'checkbox') {
            setEditGroupData(prev => ({
                ...prev,
                [name]: checked 
            })); 
            return; 
        }

        // Lida com outros campos (texto, select)
        setEditGroupData(prev => ({
            ...prev,
            [name]: value
        })); 
    };


    const handleMeetupDayChange = (e) => {
        const day = e.target.value; 
        const isChecked = e.target.checked; 

        setEditGroupData(prevData => {
            // Garante que é um array antes de manipular (para evitar erros)
            const currentDays = prevData.meetupDays || []; 

            let newDays;
            if (isChecked) {
                // Adiciona o dia se ainda não estiver lá
                newDays = Array.from(new Set([...currentDays, day])); 
            } else {
                // Remove o dia da lista
                newDays = currentDays.filter(d => d !== day);
            }

            
            return { 
                ...prevData,
                meetupDays: newDays, // Sempre um array
            };
        });
    }; 

    const handleMeetupDayToggle = handleMeetupDayChange;
    // HANDLER PARA MEMBROS (inalterado)
    const handleToggleMember = (memberId) => {
        // O criador (dono) do grupo não pode ser removido
        const creatorId = groupToEdit.creator._id.toString(); 
        if (creatorId === memberId) return; 

        setEditGroupData(prev => {
            const isSelected = prev.members.includes(memberId); 
            let newMembers;

            if (isSelected) {
                // Remove
                newMembers = prev.members.filter(id => id !== memberId);
            
            } else { 
                // Adiciona
                newMembers = [...prev.members, memberId]; 
            }

            // Garante que o criador esteja sempre na lista
            if (!newMembers.includes(creatorId)) {
                
                newMembers.push(creatorId); 
            }

            return { 
                ...prev,
                members: newMembers
            };
        });
    }; 
    
    // FUNÇÃO PARA ENVIAR AS ATUALIZAÇÕES PARA O BACKEND (inalterada)
const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setEditMessage('');
    
    if (!editGroupData.name || editGroupData.members.length === 0) {
        setEditMessage('O nome do grupo e a lista de membros não podem ser vazios.');
        return;
    }

    try {
        // NOVO: Usando FormData para enviar o arquivo e os campos de texto
        const formData = new FormData();
        
        // 1. Adicionar o arquivo de imagem (se houver um novo arquivo)
        if (newGroupImageFile) {
            formData.append('groupImage', newGroupImageFile);
        } else if (editGroupData.groupImage && !editGroupData.groupImage.startsWith('blob:')) {
            // Não envia a URL existente, o backend deve manter o campo se req.file for undefined.
        }
        
        // 2. Adicionar todos os outros campos de texto/valor
        formData.append('name', editGroupData.name);
        formData.append('descricao', editGroupData.descricao);
        formData.append('aberto', editGroupData.aberto); 
        formData.append('esporte', editGroupData.sportType); 

        // Meetup 
        formData.append('meetupTime', editGroupData.meetupTime); 
        // Envia cada dia como um item de array
        editGroupData.meetupDays.forEach(day => {
             formData.append('meetupDays', day);
        });

        // CHAMADA DE API ATUALIZADA:
        const res = await axios.put(`${API_URL}/chats/${groupToEdit._id}`, formData, { 
            headers: { 
                'Authorization': `Bearer ${token}`,
                // 'Content-Type': 'multipart/form-data' é definido automaticamente pelo axios
            }
        });
        
        setEditMessage('Grupo atualizado com sucesso!');
        // Atualiza a lista de chats e o chat selecionado após a atualização
        fetchChats();
        setSelectedChat(res.data.chat);
        setNewGroupImageFile(null); 

    } catch (err) {
        console.error('Erro ao atualizar grupo:', err.response?.data || err);
        setEditMessage(`Erro: ${err.response?.data?.msg || 'Erro desconhecido'}`);
    }
};
    if (loading || !usuario) { 
        return <div className="text-center mt-5">Carregando...</div>; 
    }

    return (
        <UserLayout>
        <div className="chat-page"> 
            <div className="chat-container"> 
                {/* Sidebar (Lista de Chats) */}
                <div className="chat-sidebar"> 
                    <h3 className="text-center mb-3">Comunidades</h3>
        
                    {/* Lista de Chats */}
                    <ul className="list-unstyled p-0 m-0"> 
                        {chats.map(chat => (
                            <li 
                                key={chat._id} 
                                className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
                                onClick={() => handleSelectChat(chat)}
                            >
                                <div className="d-flex align-items-center"> 
    {/* CORREÇÃO APLICADA: Usa getImageUrl para garantir que a URL seja absoluta */}
    <img 
        src={getImageUrl(
            chat.isGroup && chat.groupImage
                ? chat.groupImage
                : chat.members.find(m => m._id !== usuario._id)?.pfp
        )}
        alt="Ícone" 
        className="rounded-circle me-3" 
        style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
        onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://via.placeholder.com/40/CCCCCC/808080?text=NP"; // Fallback para 40x40
        }} 
    />
    <div>
        <h6 className="m-0"> 
            {chat.isGroup 
                ? chat.name 
                : chat.members.find(m => m._id !== usuario._id)?.nome || 'Chat Privado'} 
        </h6>
        {chat.isGroup && <small className="text-muted">Grupo</small>}
    </div>
</div>
                            </li>
                        ))}
                
                    </ul> 
                </div>

                {/* Janela de Chat */}
                <div className="chat-window"> 
                    {!selectedChat ?
                    ( 
                        <div className="no-chat-selected d-flex flex-column justify-content-center align-items-center h-100"> 
                            <h2>Selecione um chat para começar</h2>
                            <p>Ou crie um novo grupo para sua comunidade.</p>
                        
                        </div> 
                    ) : (
                        <>
                            {/* --- Header da Janela de Chat --- */}
                            <div 
                                className="chat-header d-flex justify-content-between align-items-center" 
                            > 
                                <h4 className="m-0">{selectedChat.name}</h4>
                            
                                {selectedChat.isGroup && selectedChat.creator._id === usuario._id && (
                                    <button 
                                        className="btn btn-sm btn-outline-secondary" 
                                        onClick={() => handleEditGroup(selectedChat)} 
                                    >
                                        <i className="bi bi-gear"></i> Gerenciar
            
                                    </button> 
                                )}
                            </div>
                            
    
                            {/* Container de Mensagens */}
                            <div className="messages-container"> 
                                {messages.map((msg, index) => (
                    
                                    <div 
                                        key={index} 
                                        className={`d-flex p-2 rounded mb-2 shadow-sm message ${msg.sender._id === usuario._id ?
                                            'align-self-end user-message' : 'align-self-start other-message'}`} 
                                        style={{ maxWidth: '70%' }} 
                                    >
                            
                                        <img 
                                            // CORREÇÃO APLICADA: Usa getImageUrl para o PFP do remetente
                                            src={getImageUrl(msg.sender.pfp)} 
                                            alt="PFP" 
                                            className="rounded-circle me-2" 
                                            style={{ width: '40px', height: '40px' }} 
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = "https://via.placeholder.com/40/CCCCCC/808080?text=NP"; // Fallback para 40x40
                                            }} 
                                        /> 
                                        <div>
                                            <small className="fw-bold">{msg.sender.nome}</small>
        
                                            <p className="m-0">{msg.content}</p> 
                                            <small 
                                                className={`d-block text-end ${msg.sender._id === usuario._id ? 'message-time-user' : 'text-muted'}`} 
                                                style={{ fontSize: '0.7em' }} 
                                            >
                                                {new Date(msg.timestamp).toLocaleTimeString()} 
                                            </small>
                                    
                                        </div> 
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
            
                            </div> 
                            
                            {/* Formulário de Envio de Mensagem (inalterado) */}
                            <form onSubmit={sendMessage} className="d-flex"> 
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder="Digite sua mensagem..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                /> 
                                <button type="submit" className="btn btn-success">
                                    Enviar
                                </button> 
                            </form>
                        </>
                    )}
                </div>

                {/* Modal de Edição de Grupo (ATUALIZADO) */}
                {isEditingGroup && groupToEdit && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}> 
                        <div className="modal-dialog modal-lg">
        
                            <div className="modal-content"> 
                                <div className="modal-header"> 
                                    <h5 className="modal-title">Gerenciar Grupo: {groupToEdit.name}</h5> 
                    
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setIsEditingGroup(false)} 
                                    ></button>
                                </div>
            
                                <div className="modal-body"> 
                                    <form onSubmit={handleUpdateGroup}> 
                                        
                
                                        {/* 1. Dados Básicos (inalterados) */}
                                        <h5>Informações do Grupo</h5> 
                                        <div className="mb-3"> 
                                            <label className="form-label">Nome do Grupo</label> 
                                            <input
                                                type="text" 
                                                className="form-control" 
                                                name="name"
                                                value={editGroupData.name} 
                                                onChange={handleEditChange}
                                            /> 
                                        </div>
                                        <div className="mb-3"> 
                                            <label className="form-label">Descrição</label> 
                                            <textarea
                                                className="form-control"
                                                name="descricao" 
                                                value={editGroupData.descricao}
                                                onChange={handleEditChange} 
                                            />
                                        </div> 
                                        <div className="mb-3"> 
                                            <label className="form-label">Tipo de Esporte</label>
                                            <select 
                                                className="form-select"
                                                name="sportType"
                                                value={editGroupData.sportType} 
                                                onChange={handleEditChange}
                                            > 
                                                {SPORT_TYPES.map(sport => (
                                                    <option key={sport} value={sport}>{sport}</option> 
                                                ))}
                                            </select>
                                        </div> 
                                        <div className="form-check mb-4"> 
                                            <input
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id="abertoCheckbox" 
                                                name="aberto" 
                                                checked={editGroupData.aberto} 
                                                onChange={handleEditChange} 
                                            /> 
                                            <label className="form-check-label fw-bold" htmlFor="abertoCheckbox">
                                                Comunidade Aberta (Pública)
                                            </label> 
                                            <small className="d-block text-muted">Se desmarcado, o grupo não aparecerá na lista de comunidades abertas.</small>
                                        </div> 
                                        
                                        {/* Campo: Imagem (AGORA COM INPUT TYPE="FILE") */}
                                        <div className="mb-4">
                                            <label className="form-label">Imagem/Ícone do Grupo</label>
                                            <input 
                                                type="file"
                                                className="form-control"
                                                name="groupImage" 
                                                accept="image/*" 
                                                onChange={handleImageFileChange} 
                                            />

                                            {editGroupData.groupImage && (
                                                <img 
                                                    // CORREÇÃO APLICADA: Usa getImageUrl para o preview
                                                    src={getImageUrl(editGroupData.groupImage)} 
                                                    alt="Preview" 
                                                    className="mt-2 rounded" 
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://via.placeholder.com/50/CCCCCC/808080?text=NP"; // Fallback para 50x50
                                                    }} 
                                                />
                                            )}
                                            <small className="d-block text-muted">Selecione um arquivo de imagem para alterar o ícone.</small>
                                        </div>
                                        
                    
                                        {/* 2. Detalhes do Encontro (inalterados) */}
                                        <hr/> 
                                        <h5>Detalhes do Encontro</h5> 
                                        <div className="mb-3"> 
                                            <label className="form-label">Horário do Encontro</label>
                                            <input
                                                type="time" 
                                                className="form-control"
                                                name="meetupTime" 
                                                value={editGroupData.meetupTime}
                                                onChange={handleEditChange} 
                                            />
                                        </div>
                                        <div className="mb-4"> 
                                            <label className="form-label d-block">Dias da Semana</label> 
                                            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => ( 
                                                <div key={day} className="form-check form-check-inline"> 
                                                    <input
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id={`check-${day}`} 
                                                        checked={editGroupData.meetupDays.includes(day)} 
                                                        onChange={(e) => handleMeetupDayToggle(e)} 
                                                        value={day} 
                                                    /> 
                                                    <label className="form-check-label" htmlFor={`check-${day}`}>{day.substring(0, 3)}</label>
                                                </div> 
                                            ))}
                                        </div>
              
                                        
                                        {/* 3. Gerenciamento de Membros (inalterado) */}
                                        <hr/> 
                                        <h5>Membros ({editGroupData.members.length})</h5> 
                                        <div className="member-list-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}> 
                                            {users.map(user => { 
                                                const isCreator = groupToEdit.creator._id === user._id; 
                                                return ( 
                                                    <div key={user._id} className="d-flex align-items-center justify-content-between p-2 border-bottom"> 
                                                        <span> 
                                                            {user.nome} 
                                                            {isCreator && <span className="badge bg-primary ms-2">Criador</span>} 
                                                        </span>
                                                        <button 
                                                            type="button" 
                                                            className={`btn btn-sm ${editGroupData.members.includes(user._id) ? 'btn-danger' : 'btn-success'}`} 
                                                            onClick={() => handleToggleMember(user._id)} 
                                                            disabled={isCreator} 
                                                        > 
                                                            {isCreator ? 
                                                                'Dono' : editGroupData.members.includes(user._id) ? 'Remover' : 'Adicionar'} 
                                                        </button>
                                                    </div> 
                                                );
                                            })} 
                                        </div>

                                        {/* Mensagem e Botão Salvar (inalterados) */}
                                        {editMessage && <div className={`alert mt-3 ${editMessage.startsWith('Erro') ? 
                                            'alert-danger' : 'alert-info'}`}>{editMessage}</div>} 
                                        
                                        <div className="modal-footer p-0 pt-3"> 
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary" 
                                                onClick={() => setIsEditingGroup(false)}
                                            >
                                                Fechar 
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary" 
                                            >
                                                Salvar Alterações
                                            </button> 
                                        </div>
                                    </form> 
                                </div>
                            </div>
                        </div>
                    </div>
            
                )} 
                {isEditingGroup && <div className="modal-backdrop fade show"></div>} 
                
            </div>
        </div>
        </UserLayout>
    );
}
export default ChatApp;