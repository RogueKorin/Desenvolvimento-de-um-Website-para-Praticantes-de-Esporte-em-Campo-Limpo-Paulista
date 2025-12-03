const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Certifique-se de que a variável 'router' é definida aqui
const router = express.Router();

// Rota para o usuário editar o próprio perfil
router.put('/me', auth(), upload.single('pfp'), async (req, res) => {
    try {
        const { id } = req.user;
        // Os outros campos vêm do req.body (nome, user), a imagem de req.file
        const { nome, user } = req.body; 
        
        // NOVO: Define o novo caminho do arquivo se um arquivo foi enviado
        const newPfpPath = req.file ? `/uploads/${req.file.filename}` : undefined;

        const userToUpdate = await User.findById(id);
        // ... (Verificação de usuário existente)

        userToUpdate.nome = nome || userToUpdate.nome;
        userToUpdate.user = user || userToUpdate.user;
        
        if (newPfpPath) {
            userToUpdate.pfp = newPfpPath;
        }
        
        await userToUpdate.save();

        // Envia de volta o usuário atualizado, mas sem a senha
        const updatedUser = await User.findById(id).select('-senha');
        res.json({ msg: 'Perfil atualizado com sucesso.', user: updatedUser });
    } catch (e) {
        console.error('Erro ao atualizar o próprio perfil:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para buscar os dados do usuário logado (GET /api/usuarios/me)
router.get('/me', auth(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-senha');
        res.json(user);
    } catch (e) {
        console.error('Erro ao buscar dados do usuário:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para listar todos os usuários
// Agora acessível para qualquer usuário autenticado
router.get('/list', auth(), async (req, res) => {
    try {
        const users = await User.find().select('-senha');
        res.json(users);
    } catch (e) {
        console.error('Erro ao listar usuários:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para listar todos os usuários (GET /api/usuarios)
router.get('/', auth(['admin']), async (req, res) => {
    try {
        const users = await User.find().select('-senha');
        res.json(users);
    } catch (e) {
        console.error('Erro ao listar usuários:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para editar um usuário específico (PUT /api/usuarios/:id)
// NOVO: Adicionar o middleware de upload para aceitar o arquivo 'pfp'
router.put('/:id', auth(['admin']), upload.single('pfp'), async (req, res) => {
    try {
        const { id } = req.params;
        // Removido 'pfp' do req.body, pois o arquivo é processado separadamente.
        // Adicionado 'resetPfp' para controle de reset.
        const { nome, email, tipo, resetPfp } = req.body; 
        
        if (req.user.id === id) {
            return res.status(403).json({ msg: 'Você não pode editar sua própria conta através desta rota.' });
        }

        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        // Variável para o novo caminho do PFP (se houver)
        let newPfpPath = undefined;
        
        // 1. NOVO: Se um arquivo foi enviado, define o novo caminho
        if (req.file) {
            newPfpPath = `/uploads/${req.file.filename}`;
        } 
        // 2. NOVO: Se 'resetPfp' for verdadeiro (e não houver novo arquivo), reseta para o default.
        else if (resetPfp === 'true') { // O valor virá como string 'true' de um FormData
            // Usamos o default definido no model User.js
            newPfpPath = userToUpdate.schema.path('pfp').defaultValue; 
        } 
        // 3. NOVO: Se não há novo arquivo e não é para resetar, mantém o PFP atual.
        // A lógica de update abaixo fará isso se 'newPfpPath' for undefined.

        userToUpdate.nome = nome || userToUpdate.nome;
        userToUpdate.email = email || userToUpdate.email;
        userToUpdate.tipo = tipo || userToUpdate.tipo;
        
        // Aplica o novo PFP se newPfpPath foi definido (seja por upload ou reset)
        if (newPfpPath !== undefined) {
             userToUpdate.pfp = newPfpPath;
        }

        // NOVO: Garantir que o email não seja alterado se for undefined ou nulo no body
        if (email && email !== userToUpdate.email) {
            // Se o email mudou, verificar unicidade. (Requer validação adicional no mundo real)
            userToUpdate.email = email;
        }


        await userToUpdate.save();

        // NOVO: Enviar de volta o usuário atualizado SEM a senha
        const updatedUser = await User.findById(id).select('-senha');

        res.json({ msg: 'Usuário atualizado com sucesso.', user: updatedUser });
    } catch (e) {
        console.error('Erro ao atualizar usuário:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

// Rota para deletar um usuário específico (DELETE /api/usuarios/:id)
router.delete('/:id', auth(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.id === id) {
            return res.status(403).json({ msg: 'Você não pode excluir sua própria conta.' });
        }
        
        const userToDelete = await User.findByIdAndDelete(id);

        if (!userToDelete) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }

        res.json({ msg: 'Usuário excluído com sucesso.' });
    } catch (e) {
        console.error('Erro ao deletar usuário:', e);
        res.status(500).json({ msg: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

module.exports = router;