const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const MeetupSchema = new mongoose.Schema({
    days: {
        type: [String], // Array de strings (ex: ['Segunda', 'Quarta', 'Sexta'])
        default: [] // Default: array vazio
    },
    time: {
        type: String, // String para o horário (ex: '19:30')
        default: '' // Default: string vazia
    }
}, { _id: false }); // Não precisa de _id

const ChatSchema = new mongoose.Schema({
    isGroup: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    descricao: {
        type: String,
        default: ''
    },
    // NOVO CAMPO: Para armazenar o ID do criador/dono do grupo
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    groupImage: { 
        type: String, 
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeuMGmMaEphoSfu4sGOW9w0PzwCpfxmo9L1A&s'
    },
    aberto: {
        type: Boolean,
        default: false // Por padrão, o chat é criado como "fechado"
    },
    sportType: {
        type: String,
        enum: ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Outro'], // Opcional: limita as opções
        default: 'Outro'
    },
    meetupDetails: {
        type: MeetupSchema,
    },
    messages: [MessageSchema]
}, { 
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);