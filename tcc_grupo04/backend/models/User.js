const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nome: {
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    senha:{
        type:String,
        required:true
    },
    pfp:{
        type:String,
        default: "/uploads/basic-default-pfp-pxi77qv5o0zuz8j3-2006070320.jpg"
    },
    tipo: {
        type: String,
        enum: ['admin', 'comum'],
        default: 'comum',
        required: true
    },
    ativo: {
        type: Boolean,
        default: true
    },    
    dataCriacao: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("User", UserSchema);