// middleware/upload.js

const multer = require('multer');
const path = require('path');

// 1. Configuração de Storage: Define onde e como o arquivo será salvo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // A pasta 'uploads/' deve existir na raiz do seu projeto
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Cria um nome de arquivo único: [timestamp]-[nome_original].[extensão]
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Cria a instância do Multer
// 'image' é o nome do campo 'name' no formulário (ex: <input type="file" name="image">)
// .single() indica que queremos apenas 1 arquivo
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 20 }, // Limite de 20MB
    fileFilter: (req, file, cb) => {
        // Verifica se é uma imagem
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'), false);
        }
    }
});

// 3. Exporta o middleware para usar nas rotas
module.exports = upload;