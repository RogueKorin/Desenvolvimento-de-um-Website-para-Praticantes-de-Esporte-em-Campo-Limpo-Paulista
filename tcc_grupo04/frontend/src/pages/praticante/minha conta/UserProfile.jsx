import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { useAuth } from "../../../contexts/AuthProvider"; // Ajuste o caminho se necessário
import { useNavigate } from "react-router-dom";

// Imports de Layout e Ícones
import UserLayout from '../../../componentes/layout/userlayout';
import './UserProfile.css';
import { FaUserCircle, FaPencilAlt } from 'react-icons/fa';
import AuthLayout from '../../../componentes/layout/authlayout';

// URL da API do arquivo original
const API_URL = 'http://localhost:4000/api';
// URL base do servidor de arquivos (onde o Multer salva e o Express serve)
const BACKEND_BASE_URL = 'http://localhost:4000'; 
// URL de fallback padrão
const DEFAULT_PFP = 'https://via.placeholder.com/150'; 

const UserProfile = () => {
    const navigate = useNavigate();
    const { token, usuario, setUsuario, loading } = useAuth();
    
    const [dadosPerfil, setDadosPerfil] = useState({ nome: '', pfp: ''});
    
    // ESTADOS RESTAURADOS PARA O UPLOAD DE ARQUIVO
    const [pfpFile, setPfpFile] = useState(null); 
    
    const [mensagem, setMensagem] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Estados para o Pop-up de Edição da Foto
    const [showEditPhotoPopup, setShowEditPhotoPopup] = useState(false);

    // --------------------------------------------------------
    // FUNÇÃO PARA CONSTRUIR A URL COMPLETA
    // --------------------------------------------------------
    const getFullImageUrl = (pfpPath) => {
        // Se o caminho não existe ou for nulo/padrão, retorna o fallback
        if (!pfpPath || pfpPath === DEFAULT_PFP) {
            return DEFAULT_PFP; 
        }
        
        // Se o caminho for relativo (começa com /uploads/, como salvo pelo backend)
        if (pfpPath.startsWith('/uploads/')) {
            return `${BACKEND_BASE_URL}${pfpPath}`;
        }
        
        // Caso contrário (URL externa), retorna o caminho original
        return pfpPath;
    };
    
    // --------------------------------------------------------
    // EFEITO: Inicializa os estados ao carregar o usuário
    // --------------------------------------------------------
    useEffect(() => {
        if (usuario) {
            const currentPfp = usuario.pfp || '';
            setDadosPerfil({
                nome: usuario.nome || '',
                pfp: currentPfp,
            });
        }
    }, [usuario]);
    
    // --------------------------------------------------------
    // HANDLERS
    // --------------------------------------------------------

    // 1. Alteração do nome
    const handleChange = (e) => {
        setDadosPerfil({
            ...dadosPerfil,
            [e.target.name]: e.target.value
        });
    };

    // 2. Seleção do arquivo (no popup)
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPfpFile(e.target.files[0]);
        } else {
            setPfpFile(null);
        }
    };
    
    // 3. Atualização do NOME (JSON, separada do upload de foto)
    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (isUpdating) return;
        setIsUpdating(true);
        setMensagem('');

        try {
            const res = await axios.put(`${API_URL}/usuarios/me`, { nome: dadosPerfil.nome }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setUsuario(res.data.user);
            localStorage.setItem('usuario', JSON.stringify(res.data.user));
            setMensagem('✅ Nome do perfil atualizado com sucesso!');

        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Erro ao atualizar nome. Tente novamente.';
            setMensagem(`❌ ${errorMsg}`);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // 4. Salvar o arquivo de foto (no popup)
    const handleSavePhotoFile = async () => {
        if (isUpdating || !pfpFile) return;

        setIsUpdating(true);
        setMensagem('');
        setShowEditPhotoPopup(false); // Fecha o popup no início do upload

        const formData = new FormData();
        formData.append('pfp', pfpFile);
        // Adiciona um campo dummy 'nome' (ou qualquer campo obrigatório pelo backend)
        // para garantir que o endpoint PUT /usuarios/me funcione corretamente.
        formData.append('nome', dadosPerfil.nome); 

        try {
            const res = await axios.put(`${API_URL}/usuarios/me`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    // O 'Content-Type': 'multipart/form-data' é setado automaticamente pelo axios/browser
                }
            });

            // Atualiza contexto, localStorage e estados
            setUsuario(res.data.user);
            localStorage.setItem('usuario', JSON.stringify(res.data.user));
            
            setMensagem('✅ Foto de perfil atualizada com sucesso!');
            
            const updatedPfp = res.data.user.pfp || '';
            setDadosPerfil(prev => ({ 
                ...prev, 
                pfp: updatedPfp,
            }));
            
        } catch (err) {
            console.error("Erro ao atualizar foto:", err);
            const errorMsg = err.response?.data?.msg || 'Erro ao atualizar foto. Tente novamente.';
            setMensagem(`❌ ${errorMsg}`);
            // Reabrir o popup se falhar
            setShowEditPhotoPopup(true); 
        } finally {
            setIsUpdating(false);
            setPfpFile(null); // Limpa o arquivo selecionado
        }
    };

    // --------------------------------------------------------
    // RENDERIZAÇÃO
    // --------------------------------------------------------
    if (loading || !usuario) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Carregando perfil...</div>;
    }

    // URL da foto atual para exibição na tela
    const currentPfpUrl = getFullImageUrl(dadosPerfil.pfp);
    // URL para pré-visualização no popup (se um arquivo foi selecionado)
    const previewUrl = pfpFile ? URL.createObjectURL(pfpFile) : currentPfpUrl;


    return (
        <UserLayout>
            <AuthLayout>
                <div className="user-profile-wrapper">
                    <h1 className="profile-title">Minha conta</h1>
                    
                    {/* Exibição de Mensagens (Sucesso/Erro) */}
                    {mensagem && (
                        <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'} mb-4`}>
                            {mensagem}
                        </div>
                    )}

                    <div className="profile-content-grid">
                        <div className="profile-info-column">

                            {/* SEÇÃO DA FOTO DE PERFIL - CLICÁVEL */}
                            <div className="avatar-section">
                                <div 
                                    className="profile-avatar-clickable" 
                                    onClick={() => {
                                        setPfpFile(null); // Garante que não há arquivo selecionado ao abrir
                                        setShowEditPhotoPopup(true);
                                    }}
                                >
                                    <img
                                        src={currentPfpUrl} 
                                        alt="Foto de Perfil"
                                        className="profile-avatar"
                                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = DEFAULT_PFP; }} 
                                    />
                                    
                                    {/* Botão de edição sobre a imagem */}
                                    <button
                                        className="edit-avatar-btn"
                                        title="Editar foto de perfil"
                                        type="button"
                                    >
                                        <FaPencilAlt />
                                    </button>
                                </div>
                            </div>
                            
                            {/* FORMULÁRIO PRINCIPAL (para Nome) */}
                            <form onSubmit={handleUpdateName}> {/* <-- CHAMA SÓ A ATUALIZAÇÃO DE NOME */}

                                {/* NOME COMPLETO (Editável) */}
                                <div className="input-group editable-group">
                                    <label htmlFor="nome">Nome</label>
                                    <input
                                        type="text"
                                        id="nome"
                                        name="nome"
                                        value={dadosPerfil.nome}
                                        onChange={handleChange}
                                        disabled={isUpdating}
                                    />
                                </div>

                                {/* Botão para Salvar Alterações (do campo Nome) */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-4"
                                    disabled={isUpdating}
                                    style={{ padding: '10px 20px', fontWeight: 'bold', fontSize: '1em' }}
                                >
                                    {isUpdating ? 'Salvando Nome...' : 'Salvar Alterações'}
                                </button>
                            </form>
                            
                        </div>
                    </div>
                </div>
            </AuthLayout>

            {/* ---------------------------------------------------- */}
            {/* POP-UP DE EDIÇÃO DA FOTO (AGORA COM INPUT FILE) */}
            {/* ---------------------------------------------------- */}
            {showEditPhotoPopup && (
                <div className="popup-overlay" onClick={() => setShowEditPhotoPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Alterar Foto de Perfil (Arquivo)</h2>
                        
                        <div className="current-avatar-preview">
                            {/* Pré-visualização do Arquivo Selecionado */}
                            <img 
                                src={previewUrl} 
                                alt="Pré-visualização" 
                                className="profile-avatar-large" 
                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = DEFAULT_PFP; }}
                            />
                            <p>Pré-visualização</p>
                        </div>
                        
                        <div className="input-group mb-4">
                            <label htmlFor="pfpFile" className="form-label">Selecione um Arquivo</label>
                            <input 
                                type="file"
                                id="pfpFile"
                                className="form-control" 
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={isUpdating}
                            />
                             {pfpFile && <small className="text-muted mt-1">Arquivo selecionado: {pfpFile.name}</small>}
                        </div>

                        <div className="popup-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={() => {
                                    setPfpFile(null); 
                                    setShowEditPhotoPopup(false);
                                }} 
                                disabled={isUpdating}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="save-btn" 
                                onClick={handleSavePhotoFile} 
                                disabled={isUpdating || !pfpFile}
                            >
                                {isUpdating ? 'Enviando...' : 'Salvar Foto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
};

export default UserProfile;