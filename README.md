# Ndao Iresaka - Application de Chat en Temps Réel

Application de chat en temps réel avec support des messages vocaux, développée avec Node.js, Express, Socket.IO et MongoDB.

## Fonctionnalités

- Chat en temps réel
- Messages vocaux
- Système d'authentification JWT
- Notifications sonores
- Indicateurs de lecture
- Statut en ligne/hors ligne
- Interface responsive

## Prérequis

- Node.js latest
- MongoDB latest
- npm 

## Installation

1. Cloner le dépôt :
```bash
git clone [url-du-repo]
cd ndao-iresaka
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ndao-iresaka
JWT_SECRET=votre_clé_secrète_jwt
```

## Lancement

### Mode développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000` avec rechargement automatique.

### Mode production
```bash
npm start
```
L'application sera accessible sur `http://localhost:3000`.

## Structure du Projet

```
├── app.js              # Point d'entrée de l'application
├── socket.js           # Configuration Socket.IO
├── config/            
│   ├── db.js          # Configuration MongoDB
│   └── tenor.js       # Configuration API Tenor
├── controllers/        # Contrôleurs
├── middlewares/       # Middlewares Express
├── models/            # Modèles Mongoose
├── public/            # Fichiers statiques
├── routes/            # Routes Express
├── services/          # Services
└── views/             # Templates EJS
```

## Technologies Utilisées

- **Backend** : Node.js, Express
- **Base de données** : MongoDB avec Mongoose
- **Temps réel** : Socket.IO
- **Template Engine** : EJS
- **Authentification** : JWT avec bcrypt
- **Frontend** : JavaScript vanilla, CSS3

## Scripts disponibles

- `npm run dev` : Lance l'application en mode développement avec nodemon
- `npm start` : Lance l'application en mode production
- `npm run lint` : Vérifie le code avec ESLint
- `npm test` : Lance les tests avec Jest

## Endpoints API

### Authentification (`/api/auth`)

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
    "nom_complet": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "motdepasse123"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "motdepasse123"
}
```

#### Déconnexion
```http
POST /api/auth/logout
```

#### Obtenir l'utilisateur courant
```http
GET /api/auth/user
Authorization: Bearer JWT_TOKEN
```

### Messages (`/api/messages`)

#### Récupérer tous les messages
```http
GET /api/messages
Authorization: Bearer JWT_TOKEN
```

#### Récupérer une conversation
```http
GET /api/messages/:recipientId
Authorization: Bearer JWT_TOKEN
```

#### Envoyer un message
```http
POST /api/messages
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
    "receiverId": "id_destinataire",
    "content": "Contenu du message",
    "type": "text" // ou "audio" pour les messages vocaux
}
```

#### Supprimer un message
```http
DELETE /api/messages/:id
Authorization: Bearer JWT_TOKEN
```

#### Marquer les messages comme lus
```http
PUT /api/messages/:recipientId/read
Authorization: Bearer JWT_TOKEN
```

### Utilisateurs (`/api/users`)

#### Liste des utilisateurs
```http
GET /api/users
Authorization: Bearer JWT_TOKEN
```

### Pour tester avec JEST
````
npm test
````
