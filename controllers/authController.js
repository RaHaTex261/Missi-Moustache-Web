const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const authController = {
    // Inscription d'un nouvel utilisateur
    async register(req, res) {
        try {
            const { nom_complet, username, email, password } = req.body;
            
            // Vérifier si l'utilisateur existe déjà (email ou username)
            let userExists = await User.findOne({ 
                $or: [
                    { email },
                    { username }
                ]
            });

            if (userExists) {
                return res.status(400).json({ 
                    message: userExists.email === email 
                        ? 'Cet email est déjà utilisé' 
                        : 'Ce nom d\'utilisateur est déjà pris'
                });
            }

            // Créer le nouvel utilisateur
            const user = new User({ nom_complet, username, email, password });
            await user.save();

            const token = jwt.sign(
                { user: { id: user.id } },
                process.env.JWT_SECRET || 'votre_secret_jwt',
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 heure
            });

            res.json({ success: true });
        } catch (err) {
            console.error('Erreur lors de l\'inscription:', err);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    },

    // Connexion d'un utilisateur
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'Identifiants invalides' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Identifiants invalides' });
            }

            const token = jwt.sign(
                { user: { id: user.id } },
                process.env.JWT_SECRET || 'votre_secret_jwt',
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 heure
            });

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    },

    // Déconnexion
    logout(req, res) {
        res.clearCookie('token');
        res.redirect('/login');
    },

    // Récupération des informations de l'utilisateur
    async getUser(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
};

module.exports = authController;