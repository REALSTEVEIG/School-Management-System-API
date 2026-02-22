const MiddlewaresLoader = require('./MiddlewaresLoader');
const ApiHandler = require("../managers/api/Api.manager");
const UserServer = require('../managers/http/UserServer.manager');
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const VirtualStack = require('../managers/virtual_stack/VirtualStack.manager');
const ValidatorsLoader = require('./ValidatorsLoader');
const ResourceMeshLoader = require('./ResourceMeshLoader');
const utils = require('../libs/utils');

const TokenManager = require('../managers/token/Token.manager');

const AuthManager = require('../managers/entities/auth/Auth.manager');
const SchoolManager = require('../managers/entities/school/School.manager');
const ClassroomManager = require('../managers/entities/classroom/Classroom.manager');
const StudentManager = require('../managers/entities/student/Student.manager');

module.exports = class ManagersLoader {
    constructor({ config, cortex, cache, mongomodels }) {
        this.managers = {};
        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        this.mongomodels = mongomodels;

        this._preload();
        this.injectable = {
            utils,
            cache,
            config,
            cortex,
            managers: this.managers,
            validators: this.validators,
            mongomodels: this.mongomodels,
            resourceNodes: this.resourceNodes,
        };
    }

    _preload() {
        const validatorsLoader = new ValidatorsLoader({
            models: require('../managers/_common/schema.models'),
            customValidators: require('../managers/_common/schema.validators'),
        });
        const resourceMeshLoader = new ResourceMeshLoader({});

        this.validators = validatorsLoader.load();
        this.resourceNodes = resourceMeshLoader.load();
    }

    load() {
        this.managers.responseDispatcher = new ResponseDispatcher();
        const middlewaresLoader = new MiddlewaresLoader(this.injectable);
        const mwsRepo = middlewaresLoader.load();
        this.injectable.mwsRepo = mwsRepo;

        this.managers.token = new TokenManager(this.injectable);

        this.managers.auth = new AuthManager(this.injectable);
        this.managers.school = new SchoolManager(this.injectable);
        this.managers.classroom = new ClassroomManager(this.injectable);
        this.managers.student = new StudentManager(this.injectable);

        this.managers.mwsExec = new VirtualStack({ ...{ preStack: ['__device'] }, ...this.injectable });
        this.managers.userApi = new ApiHandler({ ...this.injectable, ...{ prop: 'httpExposed' } });
        this.managers.userServer = new UserServer({ config: this.config, managers: this.managers });

        return this.managers;
    }
};
