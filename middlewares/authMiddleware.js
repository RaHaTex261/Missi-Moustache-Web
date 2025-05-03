const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé, token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

module.exports = authMiddleware;