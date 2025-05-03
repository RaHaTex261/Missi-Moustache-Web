const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, messagesController.getAllMessages);
router.post('/', authMiddleware, messagesController.sendMessage);
router.delete('/:id', authMiddleware, messagesController.deleteMessage);

module.exports = router;