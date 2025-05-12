const mongoose = require('mongoose');

const connectDB = async () => {    try {
        // Utilise localhost pour npm start, mongodb pour Docker
        const mongoUri = process.env.MONGODB_URI || 
            (process.env.NODE_ENV === 'production' ? 'mongodb://mongodb:27017/admin' : 'mongodb://localhost:27017/admin');
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connectée à la base admin');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;