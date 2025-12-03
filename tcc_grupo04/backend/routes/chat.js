const express = require('express');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

const router = express.Router();


// Criar um novo chat ou grupo (AGORA COM UPLOAD DE IMAGEM)
router.post('/', auth(), upload.single('groupImage'), async (req, res) => {
    // 1. Desestruturação segura. O req.body pode ser vazio.
    const body = req.body || {}; 
    const { name, members, descricao, esporte } = body; 
    
    // 2. Define isGroup explicitamente como true (já que é uma rota de criação de comunidade)
    // Se o FormData enviar 'isGroup' como string, usamos a string. Se não, forçamos 'true'.
    const isGroup = true; // Forçamos true, pois é a rota de criação de comunidade.

    // ... (restante da lógica da rota)
    
    // Garante que 'members' é um array de IDs.
    // Lembre-se que 'members' vem como uma string JSON do FormData.
    let membersArray;
    try {
        // Tenta fazer o parse da string 'members'
        membersArray = members ? JSON.parse(members) : [];
    } catch (e) {
        console.error("Erro ao fazer parse de 'members':", e);
        return res.status(400).json({ msg: "Formato inválido para a lista de membros." });
    }
    
    const groupImagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const creatorId = req.user.id; 

    try {
        if (!name || membersArray.length < 1) { // ⬅️ Usando membersArray
            return res.status(400).json({ msg: 'Grupos precisam de um nome e pelo menos um membro (além do criador).' });
        }

        const newChat = new Chat({
            isGroup, // ⬅️ Usando o isGroup definido como true
            name,
            members: [creatorId, ...membersArray], // ⬅️ Usando membersArray
            creator: isGroup ? creatorId : undefined,
            descricao,
            groupImage: groupImagePath,
            sportType: esporte, 
        });

        await newChat.save();
        res.status(201).json(newChat);
    } catch (e) {
        console.error('Erro ao criar chat:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para listar TODAS as comunidades (apenas para administradores)
// GET /api/chats/all-admin
router.get('/all-admin', auth('admin'), async (req, res) => {
    try {
        // 1. Encontra todos os documentos que são grupos/comunidades
        const allCommunities = await Chat.find({ isGroup: true });

        // 2. Mapeia os resultados para incluir a contagem de membros (numMembers)
        // e retorna todos os campos relevantes
        const formattedCommunities = allCommunities.map(chat => ({
            _id: chat._id,
            isGroup: chat.isGroup,
            name: chat.name,
            descricao: chat.descricao,
            creator: chat.creator,
            groupImage: chat.groupImage,
            aberto: chat.aberto, // Inclui o status 'aberto' para fins administrativos
            sportType: chat.sportType,
            meetupDetails: chat.meetupDetails,
            // Calcula o número de membros
            numMembers: chat.members.length 
        }));

        res.json(formattedCommunities);
    } catch (e) {
        console.error('Erro ao buscar todas as comunidades para admin:', e);
        res.status(500).json({ msg: 'Erro no servidor ao tentar listar todas as comunidades.' });
    }
});

// Rota para listar todos os Chats/Grupos que estão abertos
// GET /api/chats/abertos
router.get('/abertos', auth(), async (req, res) => {
    // 1. Puxa o parâmetro 'sport' da query, se existir
    const { sport } = req.query; 

    // 2. Monta o objeto de filtro inicial
    const filter = { 
        isGroup: true,
        aberto: true 
    };

    // 3. Adiciona o filtro de esporte se o parâmetro foi passado
    if (sport) {
        // Usa uma expressão regular para uma busca case-insensitive
        filter.sportType = new RegExp(sport, 'i');
    }
    
    try {
        // 4. Aplica o filtro modificado
        const openGroups = await Chat.find(filter)
            // CORREÇÃO 1: Inclui o sub-documento 'meetupDetails' no select
            .select('name groupImage members descricao sportType meetupDetails') 
            // Ordena por data de criação
            .sort({ createdAt: -1 }); 
            
        // 5. Mapeia para incluir o número de membros
        const communitiesList = (openGroups || []).map(group => {
            
            // Acessa o objeto meetupDetails de forma defensiva
            const meetup = group.meetupDetails || {};
            
            // Formata os dias em uma string (ex: "Segunda, Quarta")
            const diasFormatados = meetup.days && Array.isArray(meetup.days)
                                    ? meetup.days.join(', ') 
                                    : 'Não informado';
            
            // Retorna o objeto formatado
            return {
                _id: group._id,
                name: group.name,
                groupImage: group.groupImage,
                descricao: group.descricao,
                sportType: group.sportType,
                
                // CORREÇÃO 2: Acessa as propriedades dentro de meetupDetails
                diasEncontro: diasFormatados, 
                horarioEncontro: meetup.time || 'Não informado', 
                
                numMembers: group.members.length, // Conta o número de membros
            };
        });
            
        res.json(communitiesList);
    } catch (e) {
        console.error('Erro ao listar comunidades abertas:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para um usuário entrar em um grupo aberto
// POST /api/chats/:chatId/join
router.post('/:chatId/join', auth(), async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id; // O ID do usuário que está tentando entrar

    try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ msg: 'Comunidade não encontrada.' });
        }

        if (!chat.isGroup || !chat.aberto) {
            // Verifica se é um grupo E se está marcado como 'aberto'
            return res.status(403).json({ msg: 'Esta comunidade não está aberta para novos membros.' });
        }
        
        // 1. Verifica se o usuário já é membro
        if (chat.members.includes(userId)) {
            return res.status(200).json({ msg: 'Você já é membro desta comunidade.' });
        }

        // 2. Adiciona o usuário à lista de membros
        chat.members.push(userId);
        await chat.save();

        // 3. Resposta de sucesso
        res.status(200).json({ 
            msg: 'Você entrou na comunidade com sucesso!', 
            name: chat.name,
            chatId: chat._id
        });

    } catch (e) {
        console.error('Erro ao entrar na comunidade:', e);
        res.status(500).json({ msg: 'Erro no servidor ao tentar entrar na comunidade. Tente novamente mais tarde.' });
    }
});
// --- ROTA DE ATUALIZAÇÃO DE GRUPO (PUT /api/chats/:chatId) ---
// Agora aceita `multipart/form-data` para a imagem do grupo
router.put('/:chatId', auth(), upload.single('groupImage'), async (req, res) => {
    const { chatId } = req.params;
    
    // Inclui todos os campos do corpo, incluindo sportType, meetupTime, meetupDays e aberto
    const { name, descricao, esporte:sportType, aberto, meetupTime, meetupDays } = req.body;
    
    const userId = req.user.id;
    
    // Define o novo caminho do arquivo se um arquivo foi enviado (lógica da primeira função)
    const newGroupImagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ msg: 'Chat/Comunidade não encontrado.' });
        }

        // VERIFICAÇÃO DE PERMISSÃO: Apenas o criador pode editar
        if (chat.isGroup && chat.creator.toString() !== userId.toString()) {
            return res.status(403).json({ msg: 'Acesso negado. Apenas o criador pode editar as configurações do grupo.' });
        }

        if (chat.isGroup) {
            
            // 1. ATUALIZAÇÕES BÁSICAS: name, descricao
            if (name !== undefined) chat.name = name;
            if (descricao !== undefined) chat.descricao = descricao;
            
            // 2. ATUALIZAÇÃO DO sportType (Recuperado)
            if (sportType !== undefined) {
                chat.sportType = sportType;
            }

            // 3. ATUALIZAÇÃO DO STATUS 'ABERTO' (Público/Privado)
            if (aberto !== undefined) {
                // Lógica adaptada da primeira função para lidar com string ('true'/'false') ou boolean
                chat.aberto = aberto === 'true' || aberto === true;
            }

            // 4. Atualiza o caminho da imagem se um novo arquivo foi enviado (lógica da primeira função)
            if (newGroupImagePath) {
                chat.groupImage = newGroupImagePath;
            }
            
            // 5. Lógica de atualização de Meetup Details (subdocumento) (Recuperado)
            let meetupModified = false;

            if (!chat.meetupDetails) {
                chat.meetupDetails = {}; 
            }

            if (meetupTime !== undefined) {
                chat.meetupDetails.time = meetupTime; 
                meetupModified = true;
            }

            if (meetupDays !== undefined) {
                // Garantir que seja um array ou definir como vazio para limpar/substituir
                const daysToSet = Array.isArray(meetupDays) ? meetupDays : [];
                chat.meetupDetails.days = daysToSet;
                meetupModified = true;
            }
            
            // CHAMADA ESSENCIAL: Notifica o Mongoose sobre a alteração
            if (meetupModified) {
                chat.markModified('meetupDetails'); 
            }

        } else {
            return res.status(403).json({ msg: 'Não é permitido alterar configurações em chats privados.' });
        }
        
        await chat.save();
        
        // Popula o creator e members para retornar dados completos (lógica da primeira função)
        const updatedChat = await Chat.findById(chatId)
            .populate('creator', 'nome pfp')
            .populate('members', 'nome pfp');

        res.status(200).json({ msg: 'Configurações do chat/comunidade atualizadas com sucesso.', chat: updatedChat });

    } catch (e) {
        console.error('Erro ao atualizar chat:', e);
        res.status(500).json({ msg: 'Erro no servidor ao atualizar o chat. Tente novamente mais tarde.' });
    }
});

// Encontrar chats de um usuário (CORRIGIDA)
router.get('/', auth(), async (req, res) => {
    try {
        const chats = await Chat.find({ members: req.user.id })
            .populate('members', 'nome pfp') // Popula os membros
            .populate('creator', 'nome pfp') // <-- NOVO: Popula o criador para o frontend
            // .populate('messages.sender', 'nome pfp') <-- REMOVIDO: Linha que causava o StrictPopulateError
            .sort('-messages.timestamp');
        res.json(chats);
    } catch (e) {
        console.error('Erro ao buscar chats:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para administradores (com base no tipo de usuário 'admin') deletarem uma comunidade
// DELETE /api/chats/:chatId
// Usa o middleware auth('admin') para garantir que apenas usuários com tipo 'admin' possam acessar.
router.delete('/:chatId', auth('admin'), async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id; // ID do usuário logado (auth() garante que ele está logado)

    try {
        // 1. Encontrar o chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ msg: 'Comunidade não encontrada.' });
        }

        // 2. Verifica se é um grupo/comunidade
        if (!chat.isGroup) {
            return res.status(403).json({ msg: 'Apenas comunidades (grupos) podem ser excluídas por esta rota.' });
        }
        
        // 3. VERIFICAÇÃO DE PERMISSÃO:
        // O middleware 'auth('admin')' já garantiu que req.user.tipo é 'admin'.
        // Se o usuário não tivesse a role 'admin', ele seria barrado com 403 (Acesso negado) pelo 'auth.js'.

        // 4. Executa a deleção
        await Chat.findByIdAndDelete(chatId);

        // 5. Resposta de sucesso
        res.status(200).json({ msg: 'Comunidade excluída com sucesso.' });

    } catch (e) {
        // Trata erro de ID inválido do Mongoose
        if (e.kind === 'ObjectId') {
             return res.status(400).json({ msg: 'ID do chat inválido.' });
        }
        console.error('Erro ao deletar comunidade:', e);
        res.status(500).json({ msg: 'Erro no servidor ao tentar excluir a comunidade. Tente novamente mais tarde.' });
    }
});

// Rota para buscar as mensagens de um chat específico (GET)
router.get('/:chatId/messages', auth(), async (req, res) => {
    const { chatId } = req.params;
    try {
        // ✅ CORRETO: População Aninhada. 
        // Agora que o campo 'messages' existe no schema, o Mongoose entenderá.
        const chat = await Chat.findById(chatId).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'nome pfp' 
            }
        });
        
        if (!chat) {
            return res.status(404).json({ msg: 'Chat não encontrado.' });
        }
        
        res.json({ messages: chat.messages });
    } catch (e) {
        console.error('Erro ao buscar mensagens:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para enviar uma mensagem para um chat específico (POST) (Nenhuma alteração)
router.post('/:chatId/messages', auth(), async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;
    
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ msg: 'Chat não encontrado.' });
        }

        const newMessage = {
            sender: req.user.id,
            content: content
        };

        chat.messages.push(newMessage);
        await chat.save();
        
        res.status(201).json({ msg: 'Mensagem enviada com sucesso.', message: newMessage });
        
    } catch (e) {
        console.error('Erro ao enviar mensagem:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

module.exports = router;