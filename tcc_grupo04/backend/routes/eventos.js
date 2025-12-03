const express = require('express');
const Evento = require('../models/Evento'); // Certifique-se de que o caminho está correto
const auth = require('../middleware/auth'); 

const router = express.Router();

// --- ROTA DE CRIAÇÃO DE EVENTO (Qualquer Usuário Logado) ---
// POST /api/eventos
// Cria um novo evento atrelado a um chat (comunidade) e um local.
router.post('/', auth(), async (req, res) => {
    const { chat, nome, descricao, dataHora, local, esporte } = req.body;

    // 1. Validação de campos obrigatórios
    if (!chat || !nome || !dataHora || !local) {
        return res.status(400).json({ 
            msg: 'Os campos chat, nome, dataHora e local são obrigatórios.' 
        });
    }

    try {
        // NOVO PASSO: 2. Verificar e Excluir Eventos Antigos da Comunidade
        // Isso garante que apenas o novo evento prevaleça.
        // O método deleteMany é usado para garantir a limpeza, caso haja mais de um por algum erro.
        const result = await Evento.deleteMany({ chat: chat });
        
        if (result.deletedCount > 0) {
            console.log(`Evento(s) antigo(s) excluído(s) da comunidade ${chat}: ${result.deletedCount}`);
        }

        // 3. Criação do novo evento
        const novoEvento = new Evento({
            chat,
            nome,
            descricao,
            dataHora,
            local,
            esporte: esporte,
        });

       // 4. Salva no banco de dados
        await novoEvento.save(); // Salva o documento sem popular

        // 5. Popula os dados de referência para a resposta (CORREÇÃO)
        const eventoSalvo = await Evento.findById(novoEvento._id)
            .populate('chat', 'name groupImage descricao')
            .populate('local', 'nome endereco')
            .select('-__v');


        res.status(201).json(eventoSalvo); // Retorna o evento populado
    } catch (e) {
        console.error(e);
        
        // Verifica se é um erro de validação do Mongoose
        if (e.name === 'ValidationError') {
            return res.status(400).json({ 
                msg: `Erro de validação: ${e.message}` 
            });
        }
        
        res.status(500).json({ msg: 'Erro no servidor ao criar evento.' });
    }
});


// --- ROTA DE LISTAGEM DE EVENTOS (Qualquer Usuário Logado) ---
// GET /api/eventos
// Lista todos os eventos, ordenados por data e com as referências populadas.
router.get('/', auth(), async (req, res) => {
    
    // Filtro opcional para buscar eventos a partir de uma data futura
    const { futura } = req.query; // futura=true para listar apenas eventos futuros

    // Condição de busca
    const match = {};

    if (futura === 'true') {
        // Lista apenas eventos cuja dataHora ainda não passou
        match.dataHora = { $gte: new Date() };
    }
    
    try {
        const eventos = await Evento.find(match)
            // Popula o chat (comunidade) e o local (Local)
            .populate('chat', 'name groupImage descricao') // Campos relevantes do Chat
            .populate('local', 'nome endereco') // Campos relevantes do Local
            .select('-__v')
            // Ordena por dataHora ascendente (eventos mais próximos primeiro)
            .sort({ dataHora: 1 }); 

        res.json(eventos);
    } catch (e) {
        console.error('Erro ao listar eventos:', e);
        res.status(500).json({ msg: 'Erro no servidor ao listar eventos.' });
    }
});


module.exports = router;