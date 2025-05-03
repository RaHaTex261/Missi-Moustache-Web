const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const authController = {
    // Inscription d'un nouvel utilisateur
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
            }

            user = new User({ name, email, password });
            await user.save();

            const token = jwt.sign(
                { user: { id: user.id } },
                process.env.JWT_SECRET || 'votre_secret_jwt',
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (err) {
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

            res.json({ token });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
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