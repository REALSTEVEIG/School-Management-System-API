const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../../config/swagger');
const app = express();

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.userApi = managers.userApi;
    }

    use(args) {
        app.use(args);
    }

    run() {
        if (this.config.dotEnv.ENV === 'production') {
            app.set('trust proxy', 1);
        }

        app.use(helmet({
            contentSecurityPolicy: false
        }));

        app.use(cors({ origin: '*' }));

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: { ok: false, message: 'Too many requests, please try again later' },
            validate: { xForwardedForHeader: false }
        });
        app.use(limiter);

        app.use(express.json({ limit: '10kb' }));
        app.use(express.urlencoded({ extended: true, limit: '10kb' }));
        app.use('/static', express.static('public'));

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customSiteTitle: 'School Management API'
        }));

        app.get('/health', (req, res) => {
            res.status(200).json({ ok: true, message: 'Server is healthy' });
        });

        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ ok: false, message: 'Internal server error' });
        });

        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
            console.log(`Swagger docs available at /api-docs`);
        });
    }
};
