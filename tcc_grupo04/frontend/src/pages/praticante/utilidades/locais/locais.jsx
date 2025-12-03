// src/pages/Locais.jsx

import React, { useState, useEffect, useCallback } from "react";
// Importações essenciais
import { useAuth } from "../../../../contexts/AuthProvider"; 
import api from "../../../../api/api"; 

import CardLocal from "../../../../componentes/shared/utilidades/cardlocal";
import UserLayout from "../../../../componentes/layout/userlayout";

import "./locais.css"; 
// 💡 IMPORTANTE: Importar o CSS do botão de criação
import "../../../../componentes/shared/utilidades/botaocriar.css"; 

// URL base da API
const API_BASE_URL = '/locais';
// NOVO: Define a URL base do backend (usa a porta 4000 conforme seu app.js)
const BACKEND_URL = 'http://localhost:4000'; 


// Substitui o alerta por um modal simples (para seguir a regra de evitar alert())
const CustomConfirm = ({ message, onConfirm, onCancel }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
    }}>
        <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', backgroundColor: 'white' }}>
            <p className="lead">{message}</p>
            <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                <button className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
            </div>
        </div>
    </div>
);


const Locais = () => {
    // 1. ESTADOS E AUTENTICAÇÃO
    const { token, usuario, loading: authLoading } = useAuth(); 
    // Checagem de Admin
    const isAdmin = usuario && usuario.tipo === 'admin'; 
    
    // --- ESTADOS DA LISTA DE LOCAIS ---
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true); // Loading da lista
    const [error, setError] = useState(null);

    // --- ESTADOS DO FORMULÁRIO DE CADASTRO ---
    // Controla a visibilidade do formulário
    const [showCreationForm, setShowCreationForm] = useState(false); 
    // ATUALIZADO: Remove 'imagemLocal' do formData, que agora é só texto, e adiciona estado de arquivo
    const [formData, setFormData] = useState({ nome: '', endereco: '' });
    const [imagemFile, setImagemFile] = useState(null); // NOVO: Estado para armazenar o arquivo
    const [formLoading, setFormLoading] = useState(false); // Loading do formulário
    const [formMessage, setFormMessage] = useState('');
    const [isFormError, setIsFormError] = useState(false);
    
    // Estado para o modal de confirmação
    const [confirmAction, setConfirmAction] = useState(null);


    // 2. FUNÇÃO DE BUSCA DOS LOCAIS (fetchLocais) - Lógica original mantida
    const fetchLocais = useCallback(async () => {
        if (authLoading || !token) {
            if (!authLoading && !token) {
                setError("Você precisa estar logado para ver os locais.");
                setLoading(false);
            }
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await api.get(API_BASE_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocais(res.data);
        } catch (err) {
            console.error("Erro ao buscar locais:", err);
            const msg = err.response?.data?.msg || "Falha ao carregar a lista de locais.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [token, authLoading]);

    // 3. EFEITO PARA DISPARAR A BUSCA
    useEffect(() => {
        fetchLocais();
    }, [fetchLocais]);


    // =======================================================
    // FUNÇÃO PARA DELETAR UM LOCAL - Lógica original mantida, mas usando CustomConfirm
    // =======================================================
    const handleDeleteLocal = (localId, localNome) => {
        setConfirmAction({
            message: `Tem certeza que deseja apagar o local: "${localNome}"? Esta ação é irreversível.`,
            onConfirm: async () => {
                setConfirmAction(null); // Fecha o modal
                try {
                    // Usa o token do localStorage
                    const tokenFromStorage = localStorage.getItem('token'); 

                    await api.delete(`${API_BASE_URL}/${localId}`, {
                        headers: { Authorization: `Bearer ${tokenFromStorage || token}` }
                    });

                    // Mensagem de sucesso (usando formMessage temporariamente)
                    setIsFormError(false);
                    setFormMessage(`Local "${localNome}" apagado com sucesso!`);
                    setTimeout(() => setFormMessage(''), 3000); 
                    
                    // Atualiza a lista removendo o local deletado
                    setLocais(locais.filter(local => local._id !== localId));

                } catch (err) {
                    console.error('Erro ao apagar local:', err.response || err);
                    const msg = err.response?.data?.msg || 'Falha ao apagar o local. Verifique sua permissão.';
                    setIsFormError(true);
                    setFormMessage(`Erro ao deletar: ${msg}`);
                    setTimeout(() => setFormMessage(''), 5000); 
                }
            },
            onCancel: () => setConfirmAction(null)
        });
    };
    // =======================================================


    // --- FUNÇÕES DO FORMULÁRIO (ALTERADAS PARA UPLOAD) ---

    // ATUALIZADO: Manipula a mudança em campos de texto E arquivo
    const handleChange = (e) => {
        if (e.target.name === 'imagem') {
            // Se o campo for o de arquivo, salva o objeto File
            setImagemFile(e.target.files[0]);
        } else {
            // Se for campo de texto, atualiza o formData
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    // ATUALIZADO: LÓGICA DE SUBMISSÃO (usa FormData)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nome || !formData.endereco) {
            setIsFormError(true);
            setFormMessage('Nome e endereço são obrigatórios.');
            return;
        }

        setFormLoading(true);
        setFormMessage('');
        setIsFormError(false);
        
        // NOVO: Cria o objeto FormData
        const dataToSend = new FormData();
        dataToSend.append('nome', formData.nome);
        dataToSend.append('endereco', formData.endereco);
        
        // Adiciona o arquivo. O nome do campo deve ser 'imagem' para o Multer no backend
        if (imagemFile) {
            dataToSend.append('imagem', imagemFile);
        }

        try {
            const tokenFromStorage = localStorage.getItem('token'); 
            
            // ATUALIZADO: Envia dataToSend (FormData)
            await api.post(API_BASE_URL, dataToSend, {
                headers: { 
                    Authorization: `Bearer ${tokenFromStorage || token}`,
                    // O Content-Type 'multipart/form-data' é setado automaticamente
                }
            });

            setFormMessage(`Local cadastrado com sucesso!`);
            // Limpa o estado
            setFormData({ nome: '', endereco: '' });
            setImagemFile(null); // Limpa o arquivo
            
            // Ação de Sucesso: Recarrega a lista e fecha o formulário
            setShowCreationForm(false); 
            fetchLocais(); 
            
        } catch (err) {
            console.error('Erro ao cadastrar local:', err.response || err);
            const msg = err.response?.data?.msg || 'Erro desconhecido. Verifique se o nome não está duplicado.';
            setIsFormError(true);
            setFormMessage(`Falha ao cadastrar: ${msg}`);
        } finally {
            setFormLoading(false);
        }
    };

    // Função para Cancelar o Formulário
    const handleCancelForm = () => {
        setShowCreationForm(false);
        setFormMessage('');
        setIsFormError(false);
        // Limpa estados do formulário
        setFormData({ nome: '', endereco: '' }); 
        setImagemFile(null); 
    };

    // 4. LÓGICA DE RENDERIZAÇÃO CONDICIONAL DA LISTA (ALTERADO para a URL local)
    const renderContent = () => {
        if (loading || authLoading) {
            return <div className="text-center my-5"><div className="spinner-border text-primary" role="status"></div><span className="ms-2">Carregando locais...</span></div>;
        }
        if (error) {
            return <div className="alert alert-danger mx-auto my-5" style={{ maxWidth: '600px' }} role="alert"><strong>Erro:</strong> {error}</div>;
        }
        if (locais.length === 0) {
            return <div className="text-center my-5"><p className="lead text-muted">Nenhum local cadastrado ou encontrado.</p></div>;
        }

        return (
            <main className="locais-lista">
                {locais.map((local) => {
                    
                    // NOVO: Constrói a URL completa da imagem para caminhos locais (/uploads/...)
                    let imagemSource = local.imagemLocal;
                    
                    // Se o caminho for relativo (começa com /uploads/), concatena com a URL do backend
                    if (local.imagemLocal && local.imagemLocal.startsWith('/uploads/')) {
                        imagemSource = BACKEND_URL + local.imagemLocal;
                    } 
                    // Se não for relativo, usa o link direto ou placeholder (lógica original mantida)
                    if (!local.imagemLocal) {
                        imagemSource = '/imagens/placeholder.jpg';
                    }

                    return (
                        <CardLocal
                            key={local._id} 
                            id={local._id}
                            nome={local.nome}
                            endereco={local.endereco}
                            comodidadePrincipal={local.comodidadePrincipal || local.comodidades?.[0]?.nome || 'N/A'} 
                            imagemUrl={imagemSource} // Usa a URL construída
                            
                            isAdmin={isAdmin} 
                            onDelete={() => handleDeleteLocal(local._id, local.nome)} 
                        />
                    );
                })}
            </main>
        );
    };
    
    return (
        <UserLayout>
            <div className="pagina-locais">
                <header className="locais-header">
                    <h1>Locais</h1>
                    <p>Saiba mais sobre locais para sua prática esportiva em Campo Limpo Paulista!</p>
                </header>

                {/* BOTÃO DE CRIAÇÃO: Visível Apenas para Admin */}
                {isAdmin && (
                    <button 
                        className="botao-criacao-link" 
                        onClick={() => setShowCreationForm(true)}
                        disabled={showCreationForm}
                    >
                        + Novo Local
                    </button>
                )}
                
                {/* RENDERIZAÇÃO CONDICIONAL: FORMULÁRIO OU LISTA */}
                {showCreationForm ? (
                    // JSX DO FORMULÁRIO (ALTERADO para input type="file")
                    <div className="card shadow-lg p-4 mb-4 bg-light mx-auto" style={{ maxWidth: '600px' }}>
                        <h2 className="text-center text-success mb-3">Cadastrar Novo Local</h2>
                        <form onSubmit={handleSubmit}> 
                            <div className="mb-3">
                                <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do Local (ex: Quadra Central)" required />
                            </div>
                            <div className="mb-3">
                                <input type="text" className="form-control" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço Completo" required />
                            </div>
                            
                            {/* NOVO: Input de Arquivo - substitui o input type="url" */}
                            <div className="mb-3">
                                <label htmlFor="imagem" className="form-label">Imagem do Local (Opcional)</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="imagem"
                                    name="imagem" // IMPORTANTE: O nome do campo para o Multer no backend
                                    onChange={handleChange} 
                                    accept="image/*"
                                />
                                {imagemFile && <p className="text-muted mt-1 small">Arquivo selecionado: {imagemFile.name}</p>}
                            </div>

                            {formMessage && (
                                <div className={`alert ${isFormError ? 'alert-danger' : 'alert-success'} my-3`}>{formMessage}</div>
                            )}

                            <div className="d-flex justify-content-between">
                                <button type="submit" className="btn btn-success" disabled={formLoading}>
                                    {formLoading ? 'Salvando...' : 'Salvar Local'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // RENDERIZA A LISTA QUANDO O FORMULÁRIO ESTÁ FECHADO
                    renderContent()
                )}
                
                {/* RENDERIZA O MODAL DE CONFIRMAÇÃO SE HOUVER UMA AÇÃO PENDENTE */}
                {confirmAction && (
                    <CustomConfirm 
                        message={confirmAction.message}
                        onConfirm={confirmAction.onConfirm}
                        onCancel={confirmAction.onCancel}
                    />
                )}
            </div>
        </UserLayout>
    );
};

export default Locais;
