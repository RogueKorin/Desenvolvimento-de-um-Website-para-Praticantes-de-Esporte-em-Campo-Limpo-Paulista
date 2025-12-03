const express = require('express');
const Local = require('../models/Local');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// --- ROTA DE CRIAÇÃO (SOMENTE ADMIN) ---
// POST /api/locais
router.post('/', auth(['admin']), upload.single('imagem'), async (req, res) => {
    // NOVO: req.file contém os detalhes do arquivo se o upload for bem-sucedido
    const imagemLocal = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    const criadoPor = req.user.id; 
    // AGORA: O 'nome' e 'endereco' virão em req.body, o arquivo em req.file
    const { nome, endereco } = req.body; 

    if (!nome || !endereco) {
        // Opcional: Se a imagem for obrigatória, adicione a verificação aqui
        return res.status(400).json({ msg: 'Nome e endereço são obrigatórios.' });
    }

    try {
        const novoLocal = new Local({
            nome,
            endereco,
            // ATUALIZADO: Salva o caminho do arquivo
            imagemLocal: imagemLocal, 
            criadoPor, 
        });

        await novoLocal.save();
        res.status(201).json(novoLocal);
    } catch (e) {
        console.error('Erro ao criar local:', e);
        if (e.code === 11000) {
            return res.status(400).json({ msg: 'Um local com este nome já existe.' });
        }
        res.status(500).json({ msg: 'Erro no servidor ao criar local.' });
    }
});


// --- ROTA DE DELEÇÃO (SOMENTE ADMIN) ---
// DELETE /api/locais/:id
router.delete('/:id', auth(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Tenta encontrar e remover o local pelo ID
        const localDeletado = await Local.findByIdAndDelete(id);

        if (!localDeletado) {
            return res.status(404).json({ msg: 'Local não encontrado.' });
        }

        // Se o local foi deletado com sucesso
        res.json({ msg: 'Local removido com sucesso.', id: id });

    } catch (e) {
        // Erro se o ID não for válido no formato MongoDB (ObjectId)
        if (e.kind === 'ObjectId') {
             return res.status(400).json({ msg: 'ID de local inválido.' });
        }
        console.error('Erro ao deletar local:', e);
        res.status(500).json({ msg: 'Erro no servidor ao remover local.' });
    }
});


// --- ROTA DE LISTAGEM (QUALQUER USUÁRIO LOGADO) ---
// GET /api/locais
router.get('/', auth(), async (req, res) => {
    try {
        const locais = await Local.find({})
            .select('-__v') 
            .sort({ nome: 1 }); 

        res.json(locais);
    } catch (e) {
        console.error('Erro ao listar locais:', e);
        res.status(500).json({ msg: 'Erro no servidor ao listar locais.' });
    }
});

module.exports = router;