# Configuration Dockerisée - Ndao Iresaka Chat Application

## Architecture des Conteneurs

L'application est décomposée en plusieurs conteneurs isolés :

1. Backend (ndao-iresaka-backend)
   - Node.js + Express
   - Port : 4000
   - Volumes :
     - ./logs:/usr/src/app/logs
     - ./uploads:/usr/src/app/uploads
     - ./public:/usr/src/app/public

2. Base de Données (ndao-iresaka-mongodb)
   - MongoDB 5.0
   - Port : 27017
   - Volumes :
     - mongodb_data:/data/db (données persistantes)
     - mongodb_config:/data/configdb (configuration)
   - Collection principale : 'utilisateur'

3. Cache (ndao-iresaka-redis)
   - Redis Alpine
   - Port : 6379
   - Volume : redis_data:/data
   - Utilisé pour : sessions et cache

4. Serveur Web/Reverse Proxy (ndao-iresaka-nginx)
   - Nginx Alpine
   - Ports : 80 (HTTP) et 443 (HTTPS)
   - Volumes :
     - ./nginx/nginx.conf:/etc/nginx/nginx.conf
     - ./public:/usr/share/nginx/html
     - ./certbot:/etc/letsencrypt

5. SSL Certificate Manager (ndao-iresaka-certbot)
   - Certbot
   - Volumes :
     - ./certbot/conf:/etc/letsencrypt
     - ./certbot/www:/var/www/certbot

## Réseaux Docker

L'application utilise plusieurs réseaux isolés :
- backend-db : Communication Backend <-> MongoDB
- backend-cache : Communication Backend <-> Redis
- backend-web : Communication Nginx <-> Backend
- web : Réseau externe (Nginx et Certbot)

## Commandes Docker

1. Première installation :
```powershell
docker compose up --build
```

2. Démarrage normal :
```powershell
docker compose up -d
```

3. Arrêt des conteneurs :
```powershell
docker compose down
```

4. Voir les logs :
```powershell
docker compose logs -f
```

## Structure des Données

1. Base MongoDB (admin)
   - Collection : utilisateur
   - Schéma :
     - nom_complet (String)
     - username (String, unique)
     - email (String, unique)
     - password (String, hashé)
     - statut (Number)
     - createdAt (Date)

2. Cache Redis
   - Sessions utilisateurs
   - Cache des messages

## Points d'Accès

- Interface Web : https://localhost
- API REST : https://localhost/api
- WebSocket : wss://localhost/socket.io

## Sécurité

1. Reverse Proxy (Nginx)
   - Redirection HTTP vers HTTPS
   - Certificats SSL/TLS via Let's Encrypt
   - Headers de sécurité HSTS
   - Protection contre les attaques courantes

2. Base de Données
   - Réseau Docker isolé
   - Accessible uniquement depuis le backend
   - Mots de passe hashés avec bcrypt

3. Cache Redis
   - Réseau Docker isolé
   - Persistance des données activée

## Persistance des Données

Les données sont conservées même après un redémarrage grâce aux volumes Docker :
- mongodb_data : Données MongoDB
- mongodb_config : Configuration MongoDB
- redis_data : Données Redis
- ./logs : Logs applicatifs
- ./uploads : Fichiers uploadés
- ./certbot : Certificats SSL

## Monitoring

1. Logs
   - Backend : ./logs/
   - Nginx : ./logs/nginx/
   - MongoDB : via docker compose logs mongodb
   - Redis : via docker compose logs redis

2. Healthchecks
   - Backend : http://localhost:4000/health
   - MongoDB : Ping toutes les 30 secondes
   - Redis : Ping toutes les 30 secondes

## Notes de Configuration

1. Variables d'Environnement
   - JWT_SECRET : Clé pour les tokens JWT
   - NODE_ENV : Environment (production/development)
   - MONGODB_URI : URL de connexion MongoDB
   - SSL_EMAIL : Email pour Let's Encrypt
   - DOMAIN : Nom de domaine pour SSL

2. SSL/HTTPS
   - Certificats auto-générés pour localhost
   - Renouvellement automatique via Certbot
   - Configuration HTTPS moderne dans Nginx
