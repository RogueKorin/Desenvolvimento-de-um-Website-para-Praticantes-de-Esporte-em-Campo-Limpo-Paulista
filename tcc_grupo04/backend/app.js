require ('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Importa o módulo HTTP
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app); // Cria um servidor HTTP a partir da sua aplicação Express


app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch(err => console.error('Falha ao conectar ao MongoDB:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/chats', require('./routes/chat'));
app.use('/api/locais', require('./routes/locais'));
app.use('/uploads', express.static('uploads'));
app.use('/api/eventos', require('./routes/eventos'));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
