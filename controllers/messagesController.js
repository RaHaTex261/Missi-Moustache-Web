const Message = require('../models/Message');
const mongoose = require('mongoose');

const messagesController = {
    // Récupérer tous les messages
    async getAllMessages(req, res) {
        try {
            const messages = await Message.find()
                .sort({ timestamp: -1 })
                .populate('senderId', 'name')
                .populate('receiverId', 'name');
            res.json(messages);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
        }
    },

    // Envoyer un nouveau message
    async sendMessage(req, res) {
        try {
            const { content, type = 'text' } = req.body;
            const message = new Message({
                content,
                type,
                senderId: req.user.id,
                receiverId: req.body.receiverId,
                timestamp: new Date()
            });

            await message.save();
            await message.populate('senderId', 'name').populate('receiverId', 'name');
            
            // Émettre le message via socket.io
            req.app.get('io').emit('new-message', message);
            
            res.status(201).json(message);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
        }
    },

    // Supprimer un message
    async deleteMessage(req, res) {
        try {
            const message = await Message.findById(req.params.id);
            
            if (!message) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }

            await message.deleteOne();
            req.app.get('io').emit('message-deleted', req.params.id);
            
            res.json({ message: 'Message supprimé' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la suppression du message' });
        }
    },

    // Gérer les messages en temps réel via WebSocket
    async handleSocketMessage(socket, data) {
        try {
            // Créer un nouveau message avec les IDs MongoDB
            const message = new Message({
                senderId: new mongoose.Types.ObjectId(),
                receiverId: new mongoose.Types.ObjectId(),
                content: data.message,
                type: 'text',
                timestamp: new Date()
            });

            // Sauvegarder le message dans MongoDB
            await message.save();

            // Émettre le message aux autres utilisateurs
            socket.broadcast.emit('chat-message', {
                id: message._id,
                message: data.message, // Ajout du contenu du message
                name: data.name,
                dateTime: message.timestamp,
                socketId: data.socketId
            });

        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du message:', err);
        }
    },

    // Gérer les messages audio en temps réel
    async handleSocketAudioMessage(socket, data) {
        try {
            // Créer un nouveau message audio avec les IDs MongoDB
            const message = new Message({
                senderId: data.senderId || new mongoose.Types.ObjectId(),
                receiverId: data.receiverId || new mongoose.Types.ObjectId(),
                content: data.audio,
                type: 'audio',
                timestamp: new Date()
            });

            // Sauvegarder le message dans MongoDB
            await message.save();

            // Émettre le message audio aux autres utilisateurs
            socket.broadcast.emit('audio-message', {
                id: message._id,
                audio: data.audio, // Envoi des données audio brutes
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                name: data.name,
                timestamp: message.timestamp,
                type: 'audio',
                socketId: data.socketId
            });

        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du message audio:', err);
            socket.emit('error', { message: 'Erreur lors de l\'envoi du message audio' });
        }
    }
};

module.exports = messagesController;