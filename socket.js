const socketIO = require('socket.io');
const messagesController = require('./controllers/messagesController');

class SocketService {
    constructor(server) {
        this.io = socketIO(server);
        this.socketsConnected = new Set();
        this.initialize();
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log('Socket connecté', socket.id);
            this.socketsConnected.add(socket.id);
            this.io.emit('clients-total', this.socketsConnected.size);

            socket.on('disconnect', () => {
                console.log('Socket déconnecté', socket.id);
                this.socketsConnected.delete(socket.id);
                this.io.emit('clients-total', this.socketsConnected.size);
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
        });
    }
}

module.exports = SocketService;