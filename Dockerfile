# Étape de construction
FROM node:18-alpine AS builder

# Création et définition du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie des fichiers source
COPY . .

# Étape de production
FROM node:18-alpine AS production

# Installation des utilitaires nécessaires
RUN apk add --no-cache wget curl

# Création d'un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodeapp

# Création et définition du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers depuis l'étape de construction
COPY --from=builder --chown=nodeapp:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /usr/src/app .

# Création des répertoires nécessaires
RUN mkdir -p logs uploads public && \
    chown -R nodeapp:nodejs logs uploads public

# Variables d'environnement
ENV NODE_ENV=production \
    PORT=4000

# Passage à l'utilisateur non-root
USER nodeapp

# Exposition du port
EXPOSE 4000

# Point de contrôle de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Commande de démarrage
CMD ["node", "app.js"]
