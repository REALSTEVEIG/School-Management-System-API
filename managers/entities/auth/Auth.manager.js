const bcrypt = require('bcrypt');

module.exports = class Auth {
    constructor({ config, managers, mongomodels, validators }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.httpExposed = [
            'post=login',
            'post=register'
        ];
    }

    async register({ username, email, password, role, schoolId }) {
        const data = { username, email, password, role, schoolId };

        const validationResult = await this.validators.auth.register(data);
        if (validationResult) return { error: validationResult };

        const existingUser = await this.mongomodels.User.findOne({ email });
        if (existingUser) return { error: 'Email already registered' };

        if (role === 'school_admin' && !schoolId) {
            return { error: 'School ID is required for school administrators' };
        }

        if (role === 'school_admin' && schoolId) {
            const school = await this.mongomodels.School.findById(schoolId);
            if (!school) return { error: 'School not found' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new this.mongomodels.User({
            username,
            email,
            password: hashedPassword,
            role,
            schoolId: role === 'school_admin' ? schoolId : null
        });

        await user.save();

        const longToken = this.tokenManager.genLongToken({
            userId: user._id,
            userKey: user.email,
            role: user.role,
            schoolId: user.schoolId
        });

        return {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId
            },
            longToken
        };
    }

    async login({ email, password }) {
        const data = { email, password };

        const validationResult = await this.validators.auth.login(data);
        if (validationResult) return { error: validationResult };

        const user = await this.mongomodels.User.findOne({ email, isActive: true });
        if (!user) return { error: 'Invalid credentials' };

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return { error: 'Invalid credentials' };

        const longToken = this.tokenManager.genLongToken({
            userId: user._id,
            userKey: user.email,
            role: user.role,
            schoolId: user.schoolId
        });

        return {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId
            },
            longToken
        };
    }
};
