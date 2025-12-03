// backend/models/Local.js (SIMPLIFICADO)
const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    endereco: {
        type: String,
        required: true,
        trim: true
    },
    imagemLocal: {
        type: String,
        default: 'https://via.placeholder.com/600x400?text=Local+Esportivo' 
    },
    // Campo mantido para rastrear o administrador que criou o local
    criadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Local', LocalSchema);