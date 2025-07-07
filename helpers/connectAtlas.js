const mongoose = require('mongoose');

const atlasURI = process.env.MONGO_ATLAS_URL;

const atlasConnection = mongoose.createConnection(atlasURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

atlasConnection.on('connected', () => {
    console.log('Connected to Hosted Rasa Tracker');
});

atlasConnection.on('error', (err) => {
    console.error('MongoDB Atlas connection error:', err);
});

module.exports = atlasConnection;
