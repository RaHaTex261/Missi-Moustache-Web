const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'message' // Spécifie la base de données à utiliser
        });
        console.log('📦 MongoDB connectée');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;