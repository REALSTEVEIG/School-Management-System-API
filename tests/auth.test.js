const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../managers/entities/user/User.mongoModel');

describe('Auth Manager', () => {
    const mockConfig = {
        dotEnv: {
            LONG_TOKEN_SECRET: 'test_long_secret',
            SHORT_TOKEN_SECRET: 'test_short_secret'
        }
    };

    const mockTokenManager = {
        genLongToken: ({ userId, userKey, role, schoolId }) => {
            return jwt.sign({ userId, userKey, role, schoolId }, mockConfig.dotEnv.LONG_TOKEN_SECRET, { expiresIn: '1h' });
        }
    };

    const mockValidators = {
        auth: {
            register: jest.fn().mockResolvedValue(null),
            login: jest.fn().mockResolvedValue(null)
        }
    };

    const mockMongomodels = {
        User,
        School: {
            findById: jest.fn()
        }
    };

    const AuthManager = require('../managers/entities/auth/Auth.manager');
    let authManager;

    beforeEach(() => {
        authManager = new AuthManager({
            config: mockConfig,
            managers: { token: mockTokenManager },
            mongomodels: mockMongomodels,
            validators: mockValidators
        });
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new superadmin user', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'superadmin'
            };

            const result = await authManager.register(userData);

            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(userData.email);
            expect(result.user.role).toBe('superadmin');
            expect(result.longToken).toBeDefined();
        });

        it('should return error for duplicate email', async () => {
            const userData = {
                username: 'testuser',
                email: 'duplicate@example.com',
                password: 'password123',
                role: 'superadmin'
            };

            await authManager.register(userData);
            const result = await authManager.register(userData);

            expect(result.error).toBe('Email already registered');
        });

        it('should require schoolId for school_admin role', async () => {
            const userData = {
                username: 'adminuser',
                email: 'admin@example.com',
                password: 'password123',
                role: 'school_admin'
            };

            const result = await authManager.register(userData);

            expect(result.error).toBe('School ID is required for school administrators');
        });
    });

    describe('login', () => {
        it('should login with valid credentials', async () => {
            const password = 'password123';
            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                username: 'loginuser',
                email: 'login@example.com',
                password: hashedPassword,
                role: 'superadmin'
            });

            const result = await authManager.login({
                email: 'login@example.com',
                password: password
            });

            expect(result.user).toBeDefined();
            expect(result.user.email).toBe('login@example.com');
            expect(result.longToken).toBeDefined();
        });

        it('should return error for invalid credentials', async () => {
            const result = await authManager.login({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });

            expect(result.error).toBe('Invalid credentials');
        });

        it('should return error for wrong password', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);

            await User.create({
                username: 'wrongpassuser',
                email: 'wrongpass@example.com',
                password: hashedPassword,
                role: 'superadmin'
            });

            const result = await authManager.login({
                email: 'wrongpass@example.com',
                password: 'wrongpassword'
            });

            expect(result.error).toBe('Invalid credentials');
        });
    });
});
