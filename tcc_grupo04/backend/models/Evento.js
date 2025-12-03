const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema({
    // Referência à Comunidade (Chat) que está sediando este evento
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        default: ''
    },
    // Data e Hora do Evento
    dataHora: {
        type: Date,
        required: true
    },
    // Referência ao Local do Evento
    local: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local', // Referencia o modelo Local.js que você já tem
        required: true
    },
    esporte: {
        type: String,
        enum: ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Outro'], // Opcional: limita as opções
        default: 'Outro'
    },
}, {
    timestamps: true // Para ordenar por data de criação (createdAt)
});

module.exports = mongoose.model('Evento', EventoSchema);