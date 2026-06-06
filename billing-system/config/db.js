const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const defaultMongoURI = "mongodb://127.0.0.1:27017/billingSystem";
const mongoURI = process.env.MONGO_URI || defaultMongoURI;
let mongoServer;

async function connect() {
    try {
        await mongoose.connect(mongoURI);
        console.log(`MongoDB connected to ${mongoURI}`);
    } catch (err) {
        if (mongoURI === defaultMongoURI) {
            console.warn("Local MongoDB is unavailable. Starting in-memory MongoDB...");
            mongoServer = await MongoMemoryServer.create();
            const memoryURI = mongoServer.getUri();
            await mongoose.connect(memoryURI);
            console.log("Connected to in-memory MongoDB.");
        } else {
            throw err;
        }
    }
}

async function disconnect() {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
}

const connectPromise = connect();

module.exports = {
    connection: mongoose.connection,
    disconnect,
    connectPromise
};
