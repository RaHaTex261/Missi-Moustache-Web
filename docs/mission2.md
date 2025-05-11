# Mission 2 : API REST - Analyse et Documentation

## 1. Express.js - Structure et Implémentation

### Routes Implémentées
1. **Routes d'Authentification** (`/routes/auth.js`):
- POST `/api/auth/register` - Inscription
- POST `/api/auth/login` - Connexion
- POST `/api/auth/logout` - Déconnexion
- GET `/api/auth/user` - Informations utilisateur

2. **Routes Messages** (`/routes/messages.js`):
- GET `/api/messages` - Liste des messages
- GET `/api/messages/:recipientId` - Conversation spécifique
- POST `/api/messages` - Création message
- DELETE `/api/messages/:id` - Suppression message
- PUT `/api/messages/:recipientId/read` - Marquer comme lu

3. **Routes Utilisateurs** (`/routes/users.js`):
- GET `/api/users` - Liste des utilisateurs

### Contrôleurs
1. **AuthController** (`/controllers/authController.js`):
```javascript
- register() : Inscription avec validation et hachage
- login() : Authentification avec JWT
- logout() : Déconnexion sécurisée
- getUser() : Récupération profil
```

2. **MessagesController** (`/controllers/messagesController.js`):
```javascript
- getAllMessages() : Liste messages
- getConversation() : Messages spécifiques
- sendMessage() : Création message
- deleteMessage() : Suppression message
- markMessagesAsRead() : Marquage lecture
```

3. **UserController** (`/controllers/userController.js`):
```javascript
- getAllUsers() : Liste utilisateurs
```

## 2. Sécurité MongoDB

### Configuration Sécurisée
```javascript
mongoose.connect('mongodb://localhost:27017/ndao-iresaka', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
```

### Middlewares de Sécurité
1. **Authentication** (`/middlewares/authMiddleware.js`):
- Vérification JWT
- Validation session
- Protection routes

2. **Redirection** (`/middlewares/redirectIfAuthenticated.js`):
- Gestion accès authentifié
- Protection routes publiques

## 3. Couverture CRUD

### Utilisateurs (Users)
- **Create**: POST `/api/auth/register`
- **Read**: GET `/api/auth/user`, GET `/api/users`
- **Update**: PUT `/api/auth/user` (via statut)
- **Delete**: Non implémenté (choix fonctionnel)

### Messages
- **Create**: POST `/api/messages`
- **Read**: GET `/api/messages`, GET `/api/messages/:recipientId`
- **Update**: PUT `/api/messages/:recipientId/read`
- **Delete**: DELETE `/api/messages/:id`

## 4. Gestion des Erreurs

### Middleware Global
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue !' });
});
```

### Gestion Spécifique
1. **Authentification**:
- Validation données
- Gestion duplications
- Erreurs JWT

2. **Messages**:
- Validation contenu
- Gestion permissions
- Erreurs WebSocket

## 5. Points d'Amélioration Suggérés

1. **Sécurité**:
- Implémentation rate limiting par route
- Validation plus stricte des entrées
- Headers de sécurité supplémentaires

2. **CRUD**:
- Ajout suppression utilisateur
- Modification profil utilisateur
- Archivage messages

3. **Performance**:
- Pagination messages
- Mise en cache
- Optimisation requêtes

## 6. Tests API

### Tests Implémentés
```javascript
describe('Test d\'authentification', () => {
    it('devrait rediriger un utilisateur non authentifié vers /login', 
    async () => {
        const response = await request(app)
            .get('/')
            .expect(302);
        
        expect(response.headers.location).toBe('/login');
    });
});
```

### Tests à Ajouter
1. **Routes**:
- Tests unitaires par route
- Tests intégration
- Tests charge

2. **Sécurité**:
- Tests injection
- Tests authentification
- Tests validation
