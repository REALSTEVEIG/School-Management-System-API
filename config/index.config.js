require('dotenv').config()
const pjson                            = require('../package.json');
const utils                            = require('../libs/utils');
const SERVICE_NAME                     = (process.env.SERVICE_NAME)? utils.slugify(process.env.SERVICE_NAME):pjson.name;
const USER_PORT                        = process.env.USER_PORT || 5111;
const ENV                              = process.env.ENV || "development";
const MONGO_URI                        = process.env.MONGO_URI || `mongodb://localhost:27017/${SERVICE_NAME}`;
const config                           = require(`./envs/${ENV}.js`);
const LONG_TOKEN_SECRET                = process.env.LONG_TOKEN_SECRET || null;
const SHORT_TOKEN_SECRET               = process.env.SHORT_TOKEN_SECRET || null;

if(!LONG_TOKEN_SECRET || !SHORT_TOKEN_SECRET) {
    throw Error('missing .env variables: LONG_TOKEN_SECRET and SHORT_TOKEN_SECRET are required');
}

config.dotEnv = {
    SERVICE_NAME,
    ENV,
    MONGO_URI,
    USER_PORT,
    LONG_TOKEN_SECRET,
    SHORT_TOKEN_SECRET,
};

module.exports = config;
