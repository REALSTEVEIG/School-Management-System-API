const config = require('./config/index.config.js');
const ManagersLoader = require('./loaders/ManagersLoader.js');
const MongoDB = require('./connect/mongo');

const mongoDB = new MongoDB({
    uri: config.dotEnv.MONGO_URI
});

const cache = null;
const cortex = {
    sub: () => {},
    AsyncEmitToAllOf: () => {}
};

mongoDB.connect().then(() => {
    const managersLoader = new ManagersLoader({ config, cache, cortex, mongomodels: mongoDB.models });
    const managers = managersLoader.load();
    managers.userServer.run();
}).catch(err => {
    console.log('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
