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

    // Récupérer les messages d'une conversation privée
    async getConversation(req, res) {
        try {
            const { recipientId } = req.params;
            const messages = await Message.find({
                $or: [
                    { senderId: req.user.id, receiverId: recipientId },
                    { senderId: recipientId, receiverId: req.user.id }
                ]
            }).sort({ timestamp: 1 });
            
            res.json(messages);
        } catch (err) {
            console.error('Erreur lors de la récupération des messages:', err);
            res.status(500).json({ message: 'Erreur serveur' });
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

    // Gérer les messages privés en temps réel via WebSocket
    async handleSocketMessage(socket, data) {
        try {
            // Créer un nouveau message avec l'ID de l'utilisateur connecté
            const message = new Message({
                senderId: socket.userId,
                receiverId: data.receiverId,
                content: data.content,
                type: 'text',
                timestamp: new Date()
            });

            // Sauvegarder le message dans MongoDB
            await message.save();

            // Émettre le message au destinataire
            socket.broadcast.emit('private-message', {
                senderId: socket.userId,
                content: data.content,
                dateTime: message.timestamp
            });

        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du message:', err);
            socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
        }
    },

    // Gérer les messages audio privés en temps réel
    async handleSocketAudioMessage(socket, data) {
        try {
            const message = new Message({
                senderId: socket.userId,
                receiverId: data.receiverId,
                content: data.content || data.audio, // Utiliser content ou audio
                type: 'audio',
                timestamp: new Date()
            });

            await message.save();

            socket.broadcast.emit('private-audio-message', {
                senderId: socket.userId,
                content: message.content,
                dateTime: message.timestamp
            });

        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du message audio:', err);
            socket.emit('error', { message: 'Erreur lors de l\'envoi du message audio' });
        }
    }
};

module.exports = messagesController;