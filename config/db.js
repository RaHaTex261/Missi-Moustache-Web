const mongoose = require('mongoose');

const connectDB = async () => {    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/admin';
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