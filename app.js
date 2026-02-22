const config = require('./config/index.config.js');
const Cortex = require('ion-cortex');
const ManagersLoader = require('./loaders/ManagersLoader.js');
const MongoDB = require('./connect/mongo');

const mongoDB = new MongoDB({
    uri: config.dotEnv.MONGO_URI
});

const cache = require('./cache/cache.dbh')({
    prefix: config.dotEnv.CACHE_PREFIX,
    url: config.dotEnv.CACHE_REDIS
});

const cortex = new Cortex({
    prefix: config.dotEnv.CORTEX_PREFIX,
    url: config.dotEnv.CORTEX_REDIS,
    type: config.dotEnv.CORTEX_TYPE,
    state: () => {
        return {};
    },
    activeDelay: "50ms",
    idlDelay: "200ms",
});

mongoDB.connect().then(() => {
    const managersLoader = new ManagersLoader({ config, cache, cortex, mongomodels: mongoDB.models });
    const managers = managersLoader.load();
    managers.userServer.run();
}).catch(err => {
    console.log('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
