module.exports = {
    createSchool: [
        {
            path: 'name',
            type: 'string',
            length: { min: 2, max: 100 },
            required: true
        },
        {
            path: 'address',
            type: 'string',
            length: { min: 5, max: 300 },
            required: true
        },
        {
            model: 'email',
            path: 'contactEmail',
            required: true
        },
        {
            path: 'contactPhone',
            type: 'string',
            length: { min: 7, max: 20 },
            required: true
        }
    ],
    updateSchool: [
        {
            path: 'name',
            type: 'string',
            length: { min: 2, max: 100 }
        },
        {
            path: 'address',
            type: 'string',
            length: { min: 5, max: 300 }
        },
        {
            model: 'email',
            path: 'contactEmail'
        },
        {
            path: 'contactPhone',
            type: 'string',
            length: { min: 7, max: 20 }
        }
    ]
};
