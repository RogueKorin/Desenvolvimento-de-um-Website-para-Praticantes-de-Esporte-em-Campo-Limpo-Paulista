import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthProvider";
// 1. NOVO: Importar o UserLayout, assim como em home.jsx
import UserLayout from "../../componentes/layout/userlayout"; 

const Usuarios = () => {
    const { usuario, logout } = useAuth();
    
    const [usuarios, setUsuarios] = useState([]);
    const [mensagem, setMensagem] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Estado para o formulário de edição
    const [showEditForm, setShowEditForm] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [dadosEdicao, setDadosEdicao] = useState({ nome: '', email: '', tipo: '' }); 
    const [pfpFile, setPfpFile] = useState(null); // Para o arquivo de upload
    const [resetPfp, setResetPfp] = useState(false); // Para o checkbox de reset

    // Estado para a confirmação de exclusão
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Função para buscar a lista de usuários
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/usuarios", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(res.data);
        } catch (err) {
            console.error("Erro ao carregar usuários:", err.response || err);
            if (err.response && err.response.status === 401) {
                setMensagem("Sessão expirada. Por favor, faça login novamente.");
                logout();
            } else {
                setMensagem("Erro ao carregar usuários.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (usuario && usuario.tipo === 'admin') {
            fetchUsers();
        } else {
            setMensagem("Acesso negado. Você não tem permissão para esta página.");
        }
    }, [usuario]);

    const handleEditClick = (user) => {
        setUsuarioSelecionado(user);
        // NOVO: Não precisamos mais do 'pfp' no dadosEdicao
        setDadosEdicao({ nome: user.nome, email: user.email, tipo: user.tipo });
        setPfpFile(null); // Limpar qualquer arquivo anterior
        setResetPfp(false); // Limpar o estado de reset
        setShowEditForm(true);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirmation(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/usuarios/${userToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMensagem("Usuário excluído com sucesso!");
            setUsuarios(usuarios.filter(user => user._id !== userToDelete._id));
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Erro ao deletar usuário:", err.response || err);
            setMensagem("Erro ao excluir usuário.");
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
        }
    };

// NOVO: Função handleFileChange para lidar com o input de arquivo
    const handleFileChange = (e) => {
        setPfpFile(e.target.files[0]);
        // Se um arquivo for selecionado, desmarque o reset
        if (e.target.files[0]) {
            setResetPfp(false);
        }
    };
    
    const handleResetChange = (e) => {
        setResetPfp(e.target.checked);
        // Se o reset for marcado, limpe o arquivo
        if (e.target.checked) {
            setPfpFile(null);
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // NOVO: Usar FormData para enviar dados misturados (texto + arquivo)
        const formData = new FormData();
        formData.append('nome', dadosEdicao.nome);
        formData.append('email', dadosEdicao.email);
        formData.append('tipo', dadosEdicao.tipo);
        
        // NOVO: Adicionar o arquivo ou o controle de reset
        if (pfpFile) {
            formData.append('pfp', pfpFile); // 'pfp' deve corresponder ao upload.single('pfp')
        }
        if (resetPfp) {
            // Envia um indicador de reset para o backend
            formData.append('resetPfp', 'true'); 
        }
        
        try {
            const token = localStorage.getItem("token");
            await api.put(`/usuarios/${usuarioSelecionado._id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // NOVO: Content-Type é importante para FormData
                    'Content-Type': 'multipart/form-data', 
                },
            });
            setMensagem("Usuário atualizado com sucesso!");
            setShowEditForm(false);
            fetchUsers();
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err.response || err);
            setMensagem("Erro ao atualizar usuário.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="text-center mt-4">Carregando usuários...</p>;
    }

    if (!usuario || usuario.tipo !== 'admin') {
        return <p className="text-center mt-4">{mensagem}</p>;
    }

    // Função auxiliar para obter o URL completo da imagem
    // api.defaults.baseURL deve ser algo como 'http://localhost:3000/api'
    // Se o PFP for '/uploads/foto.jpg', o URL final será 'http://localhost:3000/uploads/foto.jpg'
    const getPfpUrl = (pfpPath) => {
        if (!pfpPath || pfpPath.startsWith('http')) {
            return pfpPath; // Se já for um URL completo ou nulo
        }
        // Remove '/api' se existir no baseURL e concatena o path
        const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : '';
        return `${baseUrl}${pfpPath}`;
    }

    return (
        <UserLayout>
            <div className="container mt-5">
                <h2 className="mb-4">Gerenciamento de Usuários</h2>
                {mensagem && <div className="alert alert-info">{mensagem}</div>}

                {/* INÍCIO DA SEÇÃO DE LISTAGEM DE USUÁRIOS (Antes omitida) */}
                {usuarios.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>PFP</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            {/* Puxa o caminho do PFP do usuário e usa a função auxiliar */}
                                            <img 
                                                src={getPfpUrl(user.pfp)} 
                                                alt={`PFP de ${user.nome}`} 
                                                className="img-thumbnail"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                // O onError serve para mostrar um fallback se a imagem falhar
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    // Define uma imagem padrão ou um ícone de fallback
                                                    e.target.src = "https://via.placeholder.com/50/CCCCCC/808080?text=NP"; 
                                                }}
                                            />
                                        </td>
                                        <td>{user.nome}</td>
                                        <td>{user.email}</td>
                                        <td>{user.tipo}</td>
                                        <td>
                                            {/* Não permite editar ou deletar a própria conta de admin */}
                                            {usuario._id !== user._id && (
                                                <>
                                                    <button 
                                                        className="btn btn-sm btn-primary me-2" 
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger" 
                                                        onClick={() => handleDeleteClick(user)}
                                                    >
                                                        Excluir
                                                    </button>
                                                </>
                                            )}
                                            {usuario._id === user._id && (
                                                <span className="text-muted">Sua conta</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center">Nenhum usuário encontrado (ou você não tem permissão).</p>
                )}
                {/* FIM DA SEÇÃO DE LISTAGEM DE USUÁRIOS */}

                {/* Modais de Edição */}
                {showEditForm && (
                    <div className="modal-backdrop fade show"></div>
                )}
                {showEditForm && (
                    <div className="modal d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Editar Usuário: {usuarioSelecionado?.nome}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditForm(false)}></button>
                                </div>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Nome</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={dadosEdicao.nome}
                                                onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={dadosEdicao.email}
                                                onChange={(e) => setDadosEdicao({ ...dadosEdicao, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Tipo</label>
                                            <select
                                                className="form-control"
                                                value={dadosEdicao.tipo}
                                                onChange={(e) => setDadosEdicao({ ...dadosEdicao, tipo: e.target.value })}
                                            >
                                                <option value="user">Usuário</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        
                                        {/* NOVO: Campo para upload do arquivo PFP */}
                                        <div className="mb-3">
                                            <label className="form-label">Foto de Perfil (Upload)</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                // O input fica desabilitado se o reset estiver marcado
                                                disabled={resetPfp} 
                                            />
                                        </div>
                                        
                                        {/* NOVO: Checkbox para resetar para o padrão */}
                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="resetPfpCheckbox"
                                                checked={resetPfp}
                                                onChange={handleResetChange}
                                                // O reset fica desabilitado se um arquivo tiver sido selecionado
                                                disabled={pfpFile} 
                                            />
                                            <label className="form-check-label" htmlFor="resetPfpCheckbox">
                                                Resetar para foto de perfil padrão
                                            </label>
                                        </div>

                                        {/* NOVO: Pré-visualização com base no usuário original/arquivo selecionado */}
                                        {pfpFile ? (
                                            // Pré-visualização do arquivo recém-selecionado
                                            <img 
                                                src={URL.createObjectURL(pfpFile)} 
                                                alt="Nova Preview" 
                                                className="img-fluid mt-2" 
                                                style={{ maxHeight: '150px' }} 
                                            />
                                        ) : !resetPfp && usuarioSelecionado?.pfp ? (
                                            // Pré-visualização da foto atual (se não for resetar)
                                            <img 
                                                src={getPfpUrl(usuarioSelecionado.pfp)} // Usando a função getPfpUrl
                                                alt="Preview Atual" 
                                                className="img-fluid mt-2" 
                                                style={{ maxHeight: '150px' }} 
                                            />
                                        ) : (
                                            // Mensagem se estiver resetando ou sem foto atual/nova
                                            <p className="mt-2 text-muted">Foto de perfil será a padrão.</p>
                                        )}

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>
                                            Fechar
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            Salvar Alterações
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteConfirmation && (
                    <div className="modal-backdrop fade show"></div>
                )}
                {showDeleteConfirmation && (
                    <div className="modal d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirmar Exclusão</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDeleteConfirmation(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>Tem certeza de que deseja excluir o usuário <strong>{userToDelete?.nome}</strong>?</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirmation(false)}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

export default Usuarios;