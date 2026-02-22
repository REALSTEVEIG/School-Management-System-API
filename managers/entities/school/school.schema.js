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
            path: 'contactEmail',
            type: 'string',
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
            path: 'contactEmail',
            type: 'string'
        },
        {
            path: 'contactPhone',
            type: 'string',
            length: { min: 7, max: 20 }
        }
    ]
};
