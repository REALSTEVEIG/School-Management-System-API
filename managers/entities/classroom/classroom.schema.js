module.exports = {
    createClassroom: [
        {
            path: 'name',
            type: 'string',
            length: { min: 1, max: 100 },
            required: true
        },
        {
            path: 'capacity',
            type: 'number',
            required: true
        },
        {
            path: 'resources',
            type: 'Array',
            items: {
                type: 'string',
                length: { min: 1, max: 100 }
            }
        }
    ],
    updateClassroom: [
        {
            path: 'name',
            type: 'string',
            length: { min: 1, max: 100 }
        },
        {
            path: 'capacity',
            type: 'number'
        },
        {
            path: 'resources',
            type: 'Array',
            items: {
                type: 'string',
                length: { min: 1, max: 100 }
            }
        }
    ]
};
