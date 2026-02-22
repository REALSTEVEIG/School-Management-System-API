const mongoose = require('mongoose');
const School = require('../managers/entities/school/School.mongoModel');
const Classroom = require('../managers/entities/classroom/Classroom.mongoModel');

describe('Classroom Manager', () => {
    const mockValidators = {
        classroom: {
            createClassroom: jest.fn().mockResolvedValue(null),
            updateClassroom: jest.fn().mockResolvedValue(null)
        }
    };

    const mockMongomodels = {
        School,
        Classroom
    };

    const ClassroomManager = require('../managers/entities/classroom/Classroom.manager');
    let classroomManager;
    let testSchool;

    const superadminAuth = {
        userId: new mongoose.Types.ObjectId(),
        role: 'superadmin'
    };

    beforeEach(async () => {
        classroomManager = new ClassroomManager({
            validators: mockValidators,
            mongomodels: mockMongomodels
        });

        testSchool = await School.create({
            name: 'Test School',
            address: 'Test Address',
            contactEmail: 'test@school.com',
            contactPhone: '+1234567890',
            createdBy: superadminAuth.userId
        });

        jest.clearAllMocks();
    });

    describe('createClassroom', () => {
        it('should create a new classroom', async () => {
            const classroomData = {
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                name: 'Class 1A',
                schoolId: testSchool._id.toString(),
                capacity: 30,
                resources: ['projector', 'whiteboard']
            };

            const result = await classroomManager.createClassroom(classroomData);

            expect(result.name).toBe('Class 1A');
            expect(result.capacity).toBe(30);
            expect(result.resources).toContain('projector');
        });

        it('should return error for non-existent school', async () => {
            const result = await classroomManager.createClassroom({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                name: 'Class 1B',
                schoolId: new mongoose.Types.ObjectId().toString(),
                capacity: 25
            });

            expect(result.error).toBe('School not found');
        });
    });

    describe('getClassroom', () => {
        it('should return a classroom by id', async () => {
            const classroom = await Classroom.create({
                name: 'Get Test Class',
                schoolId: testSchool._id,
                capacity: 25,
                createdBy: superadminAuth.userId
            });

            const result = await classroomManager.getClassroom({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                classroomId: classroom._id.toString()
            });

            expect(result.name).toBe('Get Test Class');
        });
    });

    describe('getClassrooms', () => {
        it('should return all classrooms for a school', async () => {
            await Classroom.create([
                {
                    name: 'Class A',
                    schoolId: testSchool._id,
                    capacity: 20,
                    createdBy: superadminAuth.userId
                },
                {
                    name: 'Class B',
                    schoolId: testSchool._id,
                    capacity: 25,
                    createdBy: superadminAuth.userId
                }
            ]);

            const result = await classroomManager.getClassrooms({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                schoolId: testSchool._id.toString()
            });

            expect(result.length).toBe(2);
        });
    });

    describe('updateClassroom', () => {
        it('should update classroom details', async () => {
            const classroom = await Classroom.create({
                name: 'Original Class',
                schoolId: testSchool._id,
                capacity: 20,
                createdBy: superadminAuth.userId
            });

            const result = await classroomManager.updateClassroom({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                classroomId: classroom._id.toString(),
                name: 'Updated Class',
                capacity: 35
            });

            expect(result.name).toBe('Updated Class');
            expect(result.capacity).toBe(35);
        });
    });

    describe('deleteClassroom', () => {
        it('should soft delete a classroom', async () => {
            const classroom = await Classroom.create({
                name: 'Delete Test Class',
                schoolId: testSchool._id,
                capacity: 20,
                createdBy: superadminAuth.userId
            });

            const result = await classroomManager.deleteClassroom({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                classroomId: classroom._id.toString()
            });

            expect(result.message).toBe('Classroom deleted successfully');

            const deletedClassroom = await Classroom.findById(classroom._id);
            expect(deletedClassroom.isActive).toBe(false);
        });
    });

    describe('school admin access control', () => {
        it('should allow school admin to access own school classrooms', async () => {
            const schoolAdminAuth = {
                userId: new mongoose.Types.ObjectId(),
                role: 'school_admin',
                schoolId: testSchool._id
            };

            const classroom = await Classroom.create({
                name: 'Admin Test Class',
                schoolId: testSchool._id,
                capacity: 20,
                createdBy: superadminAuth.userId
            });

            const result = await classroomManager.getClassroom({
                __auth: schoolAdminAuth,
                __schoolAdmin: schoolAdminAuth,
                classroomId: classroom._id.toString()
            });

            expect(result.name).toBe('Admin Test Class');
        });

        it('should deny school admin access to other school classrooms', async () => {
            const otherSchool = await School.create({
                name: 'Other School',
                address: 'Other Address',
                contactEmail: 'other@school.com',
                contactPhone: '+9876543210',
                createdBy: superadminAuth.userId
            });

            const classroom = await Classroom.create({
                name: 'Other School Class',
                schoolId: otherSchool._id,
                capacity: 20,
                createdBy: superadminAuth.userId
            });

            const schoolAdminAuth = {
                userId: new mongoose.Types.ObjectId(),
                role: 'school_admin',
                schoolId: testSchool._id
            };

            const result = await classroomManager.getClassroom({
                __auth: schoolAdminAuth,
                __schoolAdmin: schoolAdminAuth,
                classroomId: classroom._id.toString()
            });

            expect(result.error).toBe('Access denied to this classroom');
        });
    });
});
