const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = class MongoDB {
    constructor({ uri }) {
        this.uri = uri;
        this.models = {};
    }

    async connect() {
        await mongoose.connect(this.uri);
        console.log('MongoDB connected to ' + this.uri);
        this._loadModels();
        this._setupEventHandlers();
    }

    _loadModels() {
        this.models.User = require('../managers/entities/user/User.mongoModel');
        this.models.School = require('../managers/entities/school/School.mongoModel');
        this.models.Classroom = require('../managers/entities/classroom/Classroom.mongoModel');
        this.models.Student = require('../managers/entities/student/Student.mongoModel');
    }

    _setupEventHandlers() {
        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error: ' + err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', () => {
            mongoose.connection.close().then(() => {
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            });
        });
    }
};
