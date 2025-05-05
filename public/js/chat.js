// Classe principale de l'application de chat
class ChatApp {
    constructor() {
        // Connexion au serveur WebSocket
        this.socket = io();

        // Initialisation des variables pour l'enregistrement audio
        this.audioChunks = [];
        this.recordedAudioBase64 = null;

        // Initialisation et préchargement du son de notification
        this.messageTone = new Audio("/message-tone.mp3");
        this.messageTone.load(); // Préchargement du son
        this.messageTone.volume = 0.5; // Volume à 50%

        // Test initial de la lecture du son
        document.addEventListener('click', () => {
            // Essayer de jouer le son une fois que l'utilisateur a interagi avec la page
            this.messageTone.play().then(() => {
                this.messageTone.pause();
                this.messageTone.currentTime = 0;
            }).catch(err => console.warn('Autoplay du son bloqué:', err));
        }, { once: true });

        // Initialisation des éléments du DOM
        this.initializeElements();

        // Ajout des écouteurs d'événements
        this.initializeEventListeners();

        // Configuration des écouteurs de socket
        this.initializeSocketListeners();
    }

    // Sélection des éléments du DOM
    initializeElements() {
        this.clientsTotal = document.getElementById("client-total");
        this.messageContainer = document.getElementById("message-container");
        this.nameInput = document.getElementById("name-input");
        this.messageForm = document.getElementById("message-form");
        this.messageInput = document.getElementById("message-input");
        this.micButton = document.getElementById("mic-button");
    }

    // Ajout des écouteurs d'événements pour les interactions utilisateur
    initializeEventListeners() {
        // Gestion de la soumission du formulaire de message
        this.messageForm.addEventListener("submit", (e) => this.handleSubmit(e));

        // Gestion des événements de saisie pour afficher le feedback
        this.messageInput.addEventListener("focus", () => this.handleTyping());
        this.messageInput.addEventListener("keypress", () => this.handleTyping());
        this.messageInput.addEventListener("blur", () => this.handleStopTyping());

        // Gestion du bouton microphone pour l'enregistrement vocal
        this.micButton.addEventListener("click", () => this.handleMicClick());

        // Gestion de la déconnexion
        document.getElementById('logout-button').addEventListener('click', () => {
            // Appel à la route de déconnexion
            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include' // Pour inclure les cookies
            })
            .then(() => {
                // Redirection vers la page de connexion
                window.location.href = '/login';
            })
            .catch(err => {
                console.error('Erreur lors de la déconnexion:', err);
                // Redirection même en cas d'erreur
                window.location.href = '/login';
            });
        });
    }

    // Configuration des écouteurs de socket pour les événements du serveur
    initializeSocketListeners() {
        // Gestion de la réception des messages texte
        this.socket.on("chat-message", (data) => this.handleIncomingMessage(data));

        // Gestion de la réception des messages audio
        this.socket.on("audio-message", (data) => this.handleIncomingAudio(data));

        // Gestion du feedback de saisie
        this.socket.on("feedback", (data) => this.handleFeedback(data));

        // Mise à jour du nombre total de clients connectés
        this.socket.on("clients-total", (count) => this.updateClientCount(count));
    }

    // Gestion de la soumission du formulaire de message
    handleSubmit(e) {
        e.preventDefault();
        if (this.messageInput.value !== "" && !this.recordedAudioBase64) {
            this.sendTextMessage();
        } else if (this.recordedAudioBase64) {
            this.sendAudioMessage();
        }
    }

    // Fonction d'envoi de message texte
    sendTextMessage() {
        const data = {
            name: this.nameInput.value,
            message: this.messageInput.value,
            dateTime: new Date(),
            socketId: this.socket.id // Ajout de l'ID du socket
        };
        this.socket.emit("message", data);
        this.addMessageToUI(true, data);
        this.messageInput.value = "";
    }

    // Fonction d'envoi de message audio
    sendAudioMessage() {
        const data = {
            name: this.nameInput.value,
            audio: this.recordedAudioBase64,
            dateTime: new Date(),
            socketId: this.socket.id // Ajout de l'ID du socket
        };
        this.socket.emit("audio-message", data);
        this.addAudioMessageToUI(true, data);
        this.recordedAudioBase64 = null;
        this.messageInput.value = "";
        this.messageInput.disabled = false;
    }

    // Gestion du clic sur le bouton microphone
    async handleMicClick() {
        if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.startRecording(stream);
            } catch (err) {
                alert("⚠️ Accès micro refusé !");
                console.error(err);
            }
        } else {
            this.stopRecording();
        }
    }

    // Fonction pour démarrer l'enregistrement vocal
    startRecording(stream) {
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => this.handleRecordingComplete();
        this.mediaRecorder.start();
        this.micButton.innerHTML = '<i class="fas fa-stop"></i>';
    }

    // Fonction pour arrêter l'enregistrement vocal
    stopRecording() {
        this.mediaRecorder.stop();
    }

    // Gestion de la fin de l'enregistrement vocal
    handleRecordingComplete() {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            this.recordedAudioBase64 = reader.result;
            this.messageInput.value = "🎧 Message vocal prêt à envoyer";
            this.messageInput.disabled = true;
        };
        this.micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }

    // Gestion de la réception des messages texte
    handleIncomingMessage(data) {
        try {
            // Jouer le son pour tous les messages entrants, sauf ceux envoyés par cet utilisateur
            if (data.socketId !== this.socket.id) {
                this.messageTone.currentTime = 0;
                this.messageTone.play().catch(err => 
                    console.warn('Erreur lors de la lecture du son:', err)
                );
            }
        } catch (err) {
            console.warn('Erreur avec la notification sonore:', err);
        }
        this.addMessageToUI(false, data);
    }

    // Gestion de la réception des messages audio
    handleIncomingAudio(data) {
        try {
            // Jouer le son de notification pour les messages entrants
            if (data.socketId !== this.socket.id) {
                this.messageTone.currentTime = 0;
                this.messageTone.play().catch(err => 
                    console.warn('Erreur lors de la lecture du son:', err)
                );
            }

            // S'assurer que les données audio sont valides
            if (!data.audio || !data.audio.startsWith('data:audio')) {
                console.error('Format audio invalide:', data);
                return;
            }

            this.addAudioMessageToUI(false, {
                ...data,
                audio: data.audio,  // Utiliser directement les données audio reçues
                name: data.name || 'Utilisateur',
                dateTime: data.timestamp || new Date()
            });
        } catch (err) {
            console.error('Erreur lors de la réception du message audio:', err);
        }
    }

    // Ajout d'un message texte à l'interface utilisateur
    addMessageToUI(isOwnMessage, data) {
        this.clearFeedback();
        const messageText = data.message || data.content || ''; // Ajout d'un fallback
        const element = `
            <li class="${isOwnMessage ? "message-right" : "message-left"}">
                <p class="message">
                    ${messageText}
                    <span>${data.name} ● ${moment(data.dateTime || data.timestamp).fromNow()}</span>
                </p>
            </li>
        `;
        this.messageContainer.innerHTML += element;
        this.scrollToBottom();
    }

    // Ajout d'un message audio à l'interface utilisateur
    addAudioMessageToUI(isOwnMessage, data) {
        this.clearFeedback();
        const element = `
            <li class="${isOwnMessage ? "message-right" : "message-left"}">
                <p class="message">
                    🎧 Message vocal
                    <audio controls controlsList="nodownload">
                        <source src="${data.audio}" type="audio/webm">
                        Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                    <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
                </p>
            </li>
        `;
        this.messageContainer.innerHTML += element;
        this.scrollToBottom();

        // Activer automatiquement les contrôles audio
        const lastAudio = this.messageContainer.querySelector('li:last-child audio');
        if (lastAudio) {
            lastAudio.load();
        }
    }

    // Gestion du feedback de saisie
    handleTyping() {
        this.socket.emit("feedback", {
            feedback: `✍️ ${this.nameInput.value} est en train d'écrire...`
        });
    }

    // Gestion de l'arrêt du feedback de saisie
    handleStopTyping() {
        this.socket.emit("feedback", { feedback: "" });
    }

    // Ajout du feedback à l'interface utilisateur
    handleFeedback(data) {
        this.clearFeedback();
        const element = `
            <li class="message-feedback">
                <p class="feedback" id="feedback">${data.feedback}</p>
            </li>
        `;
        this.messageContainer.innerHTML += element;
    }

    // Suppression du feedback de l'interface utilisateur
    clearFeedback() {
        document.querySelectorAll("li.message-feedback").forEach(el => {
            el.parentNode.removeChild(el);
        });
    }

    // Fonction pour faire défiler automatiquement vers le bas
    scrollToBottom() {
        this.messageContainer.scrollTo(0, this.messageContainer.scrollHeight);
    }

    // Mise à jour du nombre total de clients connectés
    updateClientCount(count) {
        this.clientsTotal.innerText = `Clients connectés: ${count}`;
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});