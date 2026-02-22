module.exports = {
    register: [
        {
            path: 'username',
            type: 'string',
            length: { min: 3, max: 50 },
            required: true
        },
        {
            path: 'email',
            type: 'string',
            required: true
        },
        {
            path: 'password',
            type: 'string',
            length: { min: 6, max: 100 },
            required: true
        },
        {
            path: 'role',
            type: 'string',
            oneOf: ['superadmin', 'school_admin'],
            required: true
        }
    ],
    login: [
        {
            path: 'email',
            type: 'string',
            required: true
        },
        {
            path: 'password',
            type: 'string',
            required: true
        }
    ]
};
