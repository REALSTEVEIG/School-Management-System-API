module.exports = {
    enrollStudent: [
        {
            path: 'firstName',
            type: 'string',
            length: { min: 1, max: 50 },
            required: true
        },
        {
            path: 'lastName',
            type: 'string',
            length: { min: 1, max: 50 },
            required: true
        },
        {
            path: 'email',
            type: 'string',
            required: true
        }
    ],
    updateStudent: [
        {
            path: 'firstName',
            type: 'string',
            length: { min: 1, max: 50 }
        },
        {
            path: 'lastName',
            type: 'string',
            length: { min: 1, max: 50 }
        },
        {
            path: 'email',
            type: 'string'
        }
    ]
};
