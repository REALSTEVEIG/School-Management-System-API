const mongoose = require('mongoose');
const School = require('../managers/entities/school/School.mongoModel');

describe('School Manager', () => {
    const mockValidators = {
        school: {
            createSchool: jest.fn().mockResolvedValue(null),
            updateSchool: jest.fn().mockResolvedValue(null)
        }
    };

    const mockMongomodels = {
        School
    };

    const SchoolManager = require('../managers/entities/school/School.manager');
    let schoolManager;

    const superadminAuth = {
        userId: new mongoose.Types.ObjectId(),
        role: 'superadmin'
    };

    beforeEach(() => {
        schoolManager = new SchoolManager({
            validators: mockValidators,
            mongomodels: mockMongomodels
        });
        jest.clearAllMocks();
    });

    describe('createSchool', () => {
        it('should create a new school', async () => {
            const schoolData = {
                __auth: superadminAuth,
                __superadmin: superadminAuth,
                name: 'Test School',
                address: '123 Test Street',
                contactEmail: 'test@school.com',
                contactPhone: '+1234567890'
            };

            const result = await schoolManager.createSchool(schoolData);

            expect(result.name).toBe(schoolData.name);
            expect(result.address).toBe(schoolData.address);
            expect(result.contactEmail).toBe(schoolData.contactEmail);
        });
    });

    describe('getSchool', () => {
        it('should return a school by id', async () => {
            const school = await School.create({
                name: 'Get Test School',
                address: '456 Test Ave',
                contactEmail: 'get@school.com',
                contactPhone: '+0987654321',
                createdBy: superadminAuth.userId
            });

            const result = await schoolManager.getSchool({
                __auth: superadminAuth,
                __superadmin: superadminAuth,
                __query: { schoolId: school._id.toString() }
            });

            expect(result.name).toBe('Get Test School');
        });

        it('should return error for non-existent school', async () => {
            const result = await schoolManager.getSchool({
                __auth: superadminAuth,
                __superadmin: superadminAuth,
                __query: { schoolId: new mongoose.Types.ObjectId().toString() }
            });

            expect(result.error).toBe('School not found');
        });
    });

    describe('getAllSchools', () => {
        it('should return all active schools', async () => {
            await School.create([
                {
                    name: 'School 1',
                    address: 'Address 1',
                    contactEmail: 'school1@test.com',
                    contactPhone: '+1111111111',
                    createdBy: superadminAuth.userId
                },
                {
                    name: 'School 2',
                    address: 'Address 2',
                    contactEmail: 'school2@test.com',
                    contactPhone: '+2222222222',
                    createdBy: superadminAuth.userId
                }
            ]);

            const result = await schoolManager.getAllSchools({
                __auth: superadminAuth,
                __superadmin: superadminAuth
            });

            expect(result.length).toBe(2);
        });
    });

    describe('updateSchool', () => {
        it('should update school details', async () => {
            const school = await School.create({
                name: 'Original Name',
                address: 'Original Address',
                contactEmail: 'original@school.com',
                contactPhone: '+1234567890',
                createdBy: superadminAuth.userId
            });

            const result = await schoolManager.updateSchool({
                __auth: superadminAuth,
                __superadmin: superadminAuth,
                schoolId: school._id.toString(),
                name: 'Updated Name'
            });

            expect(result.name).toBe('Updated Name');
            expect(result.address).toBe('Original Address');
        });
    });

    describe('deleteSchool', () => {
        it('should soft delete a school', async () => {
            const school = await School.create({
                name: 'Delete Test School',
                address: 'Delete Address',
                contactEmail: 'delete@school.com',
                contactPhone: '+1234567890',
                createdBy: superadminAuth.userId
            });

            const result = await schoolManager.deleteSchool({
                __auth: superadminAuth,
                __superadmin: superadminAuth,
                schoolId: school._id.toString()
            });

            expect(result.message).toBe('School deleted successfully');

            const deletedSchool = await School.findById(school._id);
            expect(deletedSchool.isActive).toBe(false);
        });
    });
});
