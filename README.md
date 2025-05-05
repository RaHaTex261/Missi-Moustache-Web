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
