const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('Connect to MongoDB successfully');
    } catch (error) {
        console.log('Connect to MongoDB failure', error);
    }
};

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB is disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB is connected');
});

module.exports = { connect };
