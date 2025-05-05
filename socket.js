const socketIo = require('socket.io');
const messagesController = require('./controllers/messagesController');
const User = require('./models/User');

class SocketService {
    constructor(server) {
        this.io = socketIo(server);
        this.socketsConnected = new Set();
        this.connectedUsers = new Map();
        this.io.on('connection', this.handleConnection.bind(this));

        // Nettoyage périodique des connexions inactives
        setInterval(() => this.cleanupInactiveConnections(), 30000);
    }

    handleConnection(socket) {
        console.log('Socket connecté', socket.id);
        this.socketsConnected.add(socket.id);
        this.io.emit('clients-total', this.socketsConnected.size);

        socket.on('user_connected', async (userId) => {
            if (!userId) return;
            
            socket.userId = userId;
            
            // Initialiser ou mettre à jour les connexions de l'utilisateur
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(socket.id);

            // Mettre à jour le statut en ligne
            await User.findByIdAndUpdate(userId, { statut: 1 });
            
            // Émettre la mise à jour
            await this.emitUserListUpdate();

            // Garder la connexion active
            socket.emit('keep_alive');
        });

        socket.on('pong', () => {
            if (socket.userId) {
                const userConnections = this.connectedUsers.get(socket.userId);
                if (userConnections) {
                    userConnections.add(socket.id);
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log('Socket déconnecté', socket.id);
            this.socketsConnected.delete(socket.id);
            this.io.emit('clients-total', this.socketsConnected.size);

            if (socket.userId) {
                const userConnections = this.connectedUsers.get(socket.userId);
                if (userConnections) {
                    userConnections.delete(socket.id);
                    
                    // Attendre un court instant avant de vérifier si l'utilisateur est vraiment déconnecté
                    setTimeout(async () => {
                        if (userConnections.size === 0) {
                            this.connectedUsers.delete(socket.userId);
                            await User.findByIdAndUpdate(socket.userId, { statut: 0 });
                            await this.emitUserListUpdate();
                        }
                    }, 2000); // Attendre 2 secondes pour gérer les actualisations
                }
            }
        });

        socket.on('message', async (data) => {
            await messagesController.handleSocketMessage(socket, data);
        });

        socket.on('audio-message', async (data) => {
            await messagesController.handleSocketAudioMessage(socket, data);
        });

        socket.on('feedback', (data) => {
            socket.broadcast.emit('feedback', data);
        });
    }

    async cleanupInactiveConnections() {
        for (const [userId, connections] of this.connectedUsers.entries()) {
            if (connections.size === 0) {
                this.connectedUsers.delete(userId);
                await User.findByIdAndUpdate(userId, { statut: 0 });
                await this.emitUserListUpdate();
            }
        }
    }

    async emitUserListUpdate() {
        try {
            const users = await User.find().select('username nom_complet statut');
            this.io.emit('users_update', users);
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la liste des utilisateurs:', err);
        }
    }
}

module.exports = SocketService;