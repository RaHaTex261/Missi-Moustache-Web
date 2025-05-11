# Ndao Iresaka

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ndao-iresaka&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ndao-iresaka)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=ndao-iresaka&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=ndao-iresaka)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ndao-iresaka&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=ndao-iresaka)

## Description
Application de chat en temps réel avec support de messages texte et vocaux, développée avec Node.js, Express, Socket.IO et MongoDB.

## Documentation
- [Modélisation C4 et Architecture](docs/modelisation.md)
- [Documentation API REST](docs/mission2.md)

## Prérequis
- Node.js >= 18
- MongoDB >= 4.4
- Docker (optionnel)

## Installation

### Sans Docker
```bash
git clone [url-du-repo]
cd ndao-iresaka
npm install
```

### Avec Docker
```bash
# Construire l'image
docker build -t ndao-iresaka-backend .

# Lancer le conteneur
docker run -d --name ndao-iresaka-backend -p 4000:4000 ndao-iresaka-backend
```

## Lancement
```bash
npm run dev  # Mode développement
npm start    # Mode production
```

## Architecture et Technologies

### Frontend
- EJS (Templates)
- Socket.IO Client (Communication temps réel)
- JavaScript vanilla
- CSS3 avec variables pour le thème

### Backend
- Node.js + Express
- Socket.IO (WebSocket)
- MongoDB avec Mongoose
- JWT pour l'authentification

### Sécurité
- JWT (JSON Web Tokens)
- Bcrypt pour le hachage des mots de passe
- Validation des données
- Protection CSRF
- Rate limiting
- Docker avec utilisateur non-root

### Tests
- Jest pour les tests unitaires
- Supertest pour les tests d'API
- Artillery pour les tests de charge

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion

### Messages
- `GET /api/messages` - Récupérer les messages
- `POST /api/messages` - Envoyer un message
- `PUT /api/messages/:id/read` - Marquer comme lu

## Structure du Projet

```
├── config/         # Configuration (MongoDB, API keys)
├── controllers/    # Logique métier
├── docs/          # Documentation (C4, API)
├── middlewares/   # Middlewares Express
├── models/        # Modèles Mongoose
├── public/        # Fichiers statiques
│   ├── css/       # Styles
│   └── js/        # Scripts client
├── routes/        # Routes API
├── services/      # Services métier
├── views/         # Templates EJS
└── tests/         # Tests unitaires et d'intégration
```

## Exemple de test (Postman / Socket.IO Client)

### Test avec Postman
```http
# Inscription
POST http://localhost:3000/api/auth/register
{
    "username": "test",
    "email": "test@example.com",
    "password": "test123"
}

# Connexion
POST http://localhost:3000/api/auth/login
{
    "email": "test@example.com",
    "password": "test123"
}
```

### Test avec Socket.IO Client
```javascript
const socket = io('http://localhost:3000', {
    auth: { token: 'votre_token_jwt' }
});

socket.emit('send_message', {
    receiverId: 'user_id',
    content: 'Hello!',
    type: 'text'
});
```

## Exemple de tests automatisés (Jest)
```bash
# Lancer tous les tests
npm test

# Lancer un fichier de test spécifique
npm test app.test.js
```

Exemple de test:
```javascript
describe('Auth API', () => {
    test('should register new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'test',
                email: 'test@example.com',
                password: 'test123'
            });
        expect(response.status).toBe(201);
    });
});
```

## Démarche TDD appliquée dans le projet

1. **Écriture des tests d'abord**
   - Tests d'authentification
   - Tests de messagerie
   - Tests de connexion Socket.IO

2. **Implémentation du code**
   - Développement des fonctionnalités
   - Validation des tests

3. **Refactoring**
   - Amélioration du code
   - Maintien des tests

## Déploiement

### Variables d'Environnement
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ndao-iresaka
JWT_SECRET=votre_secret_jwt
```

### Docker Compose
```bash
# Lancer l'application avec MongoDB
docker-compose up -d

# Arrêter l'application
docker-compose down
```

### Production
1. Construire l'application :
```bash
npm run build
```

2. Démarrer en production :
```bash
npm start
```

### CI/CD
Le projet utilise GitHub Actions pour :
- Tests automatisés
- Analyse de code
- Construction Docker
- Déploiement automatique
