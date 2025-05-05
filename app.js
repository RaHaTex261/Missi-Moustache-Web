const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const SocketService = require('./socket');
const authMiddleware = require('./middlewares/authMiddleware');

// Routes
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');

// Initialisation de l'application
const app = express();
const server = require('http').createServer(app);

// Connexion à la base de données
connectDB();

// Configuration de Socket.io
const socketService = new SocketService(server);
app.set('io', socketService.io);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);

// Route pour la page d'inscription
app.get('/register', (req, res) => {
    res.render('register');
});

// Route pour la page de login
app.get('/login', (req, res) => {
    res.render('login');
});

// Route principale pour le chat (protégée)
app.get('/', authMiddleware, (req, res) => {
    res.render('chat/index', {
        title: 'Ndao-Dresaka - Application de Chat en Temps Réel'
    });
});

// Redirection vers login si non authentifié
app.get('*', (req, res) => {
    res.redirect('/login');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue !' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`💬 Serveur démarré sur le port ${PORT}`);
});
