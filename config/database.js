const mongoose = require('mongoose');

const connectDB = async (callback) => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB Connected...');
        callback();
    } catch (err) {
        console.log('MongoDB Connection Failed...');
        console.log(err);
    }
}

module.exports = connectDB;