const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Cadastro
router.post('/register', async (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    try {
        // Checa se existe
        let usuario = await User.findOne({email});
        if(usuario) return res.status(400).json({msg: 'Email já cadastrado'});

        const hashedSenha = await bcrypt.hash(senha, 10);

        usuario = new User({
            nome,
            email,
            senha: hashedSenha,
            tipo: tipo === 'admin' ? 'admin' : 'comum'
        });

        await usuario.save();
        res.status(201).json({msg: 'Usuário criado com sucesso'});
    } catch (e) {
        console.error('Erro no registro:', e);
        res.status(500).json({msg: 'Erro no servidor. Tente novamente mais tarde.'});
    }
});

// login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await User.findOne({email});
        if(!usuario) return res.status(400).json({msg: 'Usuário não encontrado'});
        if(!usuario.ativo) return res.status(400).json({msg: 'Usuário inativo'});

        const ok = await bcrypt.compare(senha, usuario.senha);
        if(!ok) return res.status(400).json({msg: 'Senha incorreta'});

        const token = jwt.sign(
            {id: usuario._id, tipo: usuario.tipo },
            process.env.JWT_SECRET,
            {expiresIn: '12h'}
        );

        res.json({token,usuario: {id: usuario._id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo}});
        
    } catch (e) {
        console.error('Erro no login:', e);
        res.status(500).json({msg: 'Erro no servidor. Tente novamente mais tarde.'});
    }
});


module.exports = router;