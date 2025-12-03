const jwt = require('jsonwebtoken');

module.exports = (rolesPermitidas = []) => {
    if (typeof rolesPermitidas === 'string') {
        rolesPermitidas = [rolesPermitidas];
    }

    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ msg: 'Token ausente, autorização negada.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Se roles foram especificadas, verifica se o usuário tem a permissão necessária
            if (rolesPermitidas.length > 0 && !rolesPermitidas.includes(req.user.tipo)) {
                return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para este recurso.' });
            }

            next(); // Usuário autenticado e autorizado
        } catch (err) {
            res.status(401).json({ msg: 'Token inválido!' });
        }
    };
};