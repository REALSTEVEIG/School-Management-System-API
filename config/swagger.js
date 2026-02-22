const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'School Management System API',
            version: '1.0.0',
            description: 'A RESTful API for managing schools, classrooms, and students with role-based access control (RBAC)',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: 'http://localhost:5111',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['superadmin', 'school_admin'] },
                        schoolId: { type: 'string', nullable: true }
                    }
                },
                School: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        address: { type: 'string' },
                        contactEmail: { type: 'string' },
                        contactPhone: { type: 'string' },
                        createdBy: { type: 'string' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Classroom: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        schoolId: { type: 'string' },
                        capacity: { type: 'integer' },
                        resources: { type: 'array', items: { type: 'string' } },
                        createdBy: { type: 'string' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Student: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        schoolId: { type: 'string' },
                        classroomId: { type: 'string', nullable: true },
                        enrollmentDate: { type: 'string', format: 'date-time' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'string' } }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean', example: true },
                        data: { type: 'object' }
                    }
                }
            }
        },
        paths: {
            '/api/auth/register': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['username', 'email', 'password', 'role'],
                                    properties: {
                                        username: { type: 'string', example: 'john_doe' },
                                        email: { type: 'string', example: 'john@example.com' },
                                        password: { type: 'string', example: 'securepassword123' },
                                        role: { type: 'string', enum: ['superadmin', 'school_admin'] },
                                        schoolId: { type: 'string', description: 'Required for school_admin role' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'User registered successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ok: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: { '$ref': '#/components/schemas/User' },
                                                    longToken: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Login user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', example: 'john@example.com' },
                                        password: { type: 'string', example: 'securepassword123' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ok: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: { '$ref': '#/components/schemas/User' },
                                                    longToken: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Invalid credentials' }
                    }
                }
            },
            '/api/school/createSchool': {
                post: {
                    tags: ['Schools'],
                    summary: 'Create a new school (Superadmin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'address', 'contactEmail', 'contactPhone'],
                                    properties: {
                                        name: { type: 'string', example: 'Springfield Elementary' },
                                        address: { type: 'string', example: '123 Main St, Springfield' },
                                        contactEmail: { type: 'string', example: 'info@springfield.edu' },
                                        contactPhone: { type: 'string', example: '+1234567890' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'School created', content: { 'application/json': { schema: { '$ref': '#/components/schemas/School' } } } },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden - Superadmin access required' }
                    }
                }
            },
            '/api/school/getSchool': {
                get: {
                    tags: ['Schools'],
                    summary: 'Get a school by ID (Superadmin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'schoolId', in: 'query', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'School found', content: { 'application/json': { schema: { '$ref': '#/components/schemas/School' } } } },
                        '404': { description: 'School not found' }
                    }
                }
            },
            '/api/school/getAllSchools': {
                get: {
                    tags: ['Schools'],
                    summary: 'Get all schools (Superadmin only)',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': { description: 'List of schools', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/School' } } } } }
                    }
                }
            },
            '/api/school/updateSchool': {
                put: {
                    tags: ['Schools'],
                    summary: 'Update a school (Superadmin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['schoolId'],
                                    properties: {
                                        schoolId: { type: 'string' },
                                        name: { type: 'string' },
                                        address: { type: 'string' },
                                        contactEmail: { type: 'string' },
                                        contactPhone: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'School updated' },
                        '404': { description: 'School not found' }
                    }
                }
            },
            '/api/school/deleteSchool': {
                delete: {
                    tags: ['Schools'],
                    summary: 'Delete a school (Superadmin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['schoolId'],
                                    properties: {
                                        schoolId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'School deleted' },
                        '404': { description: 'School not found' }
                    }
                }
            },
            '/api/classroom/createClassroom': {
                post: {
                    tags: ['Classrooms'],
                    summary: 'Create a new classroom (School Admin)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'capacity'],
                                    properties: {
                                        name: { type: 'string', example: 'Class 1A' },
                                        schoolId: { type: 'string', description: 'Required for superadmin' },
                                        capacity: { type: 'integer', example: 30 },
                                        resources: { type: 'array', items: { type: 'string' }, example: ['projector', 'whiteboard'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Classroom created' },
                        '403': { description: 'Access denied' }
                    }
                }
            },
            '/api/classroom/getClassroom': {
                get: {
                    tags: ['Classrooms'],
                    summary: 'Get a classroom by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'classroomId', in: 'query', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Classroom found' },
                        '404': { description: 'Classroom not found' }
                    }
                }
            },
            '/api/classroom/getClassrooms': {
                get: {
                    tags: ['Classrooms'],
                    summary: 'Get all classrooms for a school',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'schoolId', in: 'query', schema: { type: 'string' }, description: 'Required for superadmin' }],
                    responses: {
                        '200': { description: 'List of classrooms' }
                    }
                }
            },
            '/api/classroom/updateClassroom': {
                put: {
                    tags: ['Classrooms'],
                    summary: 'Update a classroom',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['classroomId'],
                                    properties: {
                                        classroomId: { type: 'string' },
                                        name: { type: 'string' },
                                        capacity: { type: 'integer' },
                                        resources: { type: 'array', items: { type: 'string' } }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Classroom updated' }
                    }
                }
            },
            '/api/classroom/deleteClassroom': {
                delete: {
                    tags: ['Classrooms'],
                    summary: 'Delete a classroom',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['classroomId'],
                                    properties: {
                                        classroomId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Classroom deleted' }
                    }
                }
            },
            '/api/student/enrollStudent': {
                post: {
                    tags: ['Students'],
                    summary: 'Enroll a new student',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['firstName', 'lastName', 'email'],
                                    properties: {
                                        firstName: { type: 'string', example: 'Jane' },
                                        lastName: { type: 'string', example: 'Doe' },
                                        email: { type: 'string', example: 'jane.doe@student.com' },
                                        schoolId: { type: 'string', description: 'Required for superadmin' },
                                        classroomId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Student enrolled' }
                    }
                }
            },
            '/api/student/getStudent': {
                get: {
                    tags: ['Students'],
                    summary: 'Get a student by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'studentId', in: 'query', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Student found' }
                    }
                }
            },
            '/api/student/getStudents': {
                get: {
                    tags: ['Students'],
                    summary: 'Get all students for a school',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'schoolId', in: 'query', schema: { type: 'string' } },
                        { name: 'classroomId', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: {
                        '200': { description: 'List of students' }
                    }
                }
            },
            '/api/student/updateStudent': {
                put: {
                    tags: ['Students'],
                    summary: 'Update a student',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['studentId'],
                                    properties: {
                                        studentId: { type: 'string' },
                                        firstName: { type: 'string' },
                                        lastName: { type: 'string' },
                                        email: { type: 'string' },
                                        classroomId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Student updated' }
                    }
                }
            },
            '/api/student/transferStudent': {
                put: {
                    tags: ['Students'],
                    summary: 'Transfer a student to another school',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['studentId', 'newSchoolId'],
                                    properties: {
                                        studentId: { type: 'string' },
                                        newSchoolId: { type: 'string' },
                                        newClassroomId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Student transferred' }
                    }
                }
            },
            '/api/student/removeStudent': {
                delete: {
                    tags: ['Students'],
                    summary: 'Remove a student',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['studentId'],
                                    properties: {
                                        studentId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Student removed' }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Schools', description: 'School management (Superadmin only)' },
            { name: 'Classrooms', description: 'Classroom management (School Admin)' },
            { name: 'Students', description: 'Student management (School Admin)' }
        ]
    },
    apis: []
};

module.exports = swaggerJsdoc(options);
