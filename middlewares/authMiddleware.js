const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Vérifier le token dans le cookie
    const token = req.cookies?.token || req.header('x-auth-token');

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

module.exports = authMiddleware;