const mongoose = require('mongoose');
const School = require('../managers/entities/school/School.mongoModel');
const Classroom = require('../managers/entities/classroom/Classroom.mongoModel');
const Student = require('../managers/entities/student/Student.mongoModel');

describe('Student Manager', () => {
    const mockValidators = {
        student: {
            enrollStudent: jest.fn().mockResolvedValue(null),
            updateStudent: jest.fn().mockResolvedValue(null)
        }
    };

    const mockMongomodels = {
        School,
        Classroom,
        Student
    };

    const StudentManager = require('../managers/entities/student/Student.manager');
    let studentManager;
    let testSchool;
    let testClassroom;

    const superadminAuth = {
        userId: new mongoose.Types.ObjectId(),
        role: 'superadmin'
    };

    beforeEach(async () => {
        studentManager = new StudentManager({
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

        testClassroom = await Classroom.create({
            name: 'Test Class',
            schoolId: testSchool._id,
            capacity: 30,
            createdBy: superadminAuth.userId
        });

        jest.clearAllMocks();
    });

    describe('enrollStudent', () => {
        it('should enroll a new student', async () => {
            const studentData = {
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@student.com',
                schoolId: testSchool._id.toString(),
                classroomId: testClassroom._id.toString()
            };

            const result = await studentManager.enrollStudent(studentData);

            expect(result.firstName).toBe('John');
            expect(result.lastName).toBe('Doe');
            expect(result.email).toBe('john.doe@student.com');
        });

        it('should return error for duplicate email', async () => {
            await Student.create({
                firstName: 'Existing',
                lastName: 'Student',
                email: 'duplicate@student.com',
                schoolId: testSchool._id
            });

            const result = await studentManager.enrollStudent({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                firstName: 'New',
                lastName: 'Student',
                email: 'duplicate@student.com',
                schoolId: testSchool._id.toString()
            });

            expect(result.error).toBe('Student with this email already exists');
        });
    });

    describe('getStudent', () => {
        it('should return a student by id', async () => {
            const student = await Student.create({
                firstName: 'Get',
                lastName: 'Test',
                email: 'get.test@student.com',
                schoolId: testSchool._id
            });

            const result = await studentManager.getStudent({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                __query: { studentId: student._id.toString() }
            });

            expect(result.firstName).toBe('Get');
        });
    });

    describe('getStudents', () => {
        it('should return all students for a school', async () => {
            await Student.create([
                {
                    firstName: 'Student',
                    lastName: 'One',
                    email: 'student1@test.com',
                    schoolId: testSchool._id
                },
                {
                    firstName: 'Student',
                    lastName: 'Two',
                    email: 'student2@test.com',
                    schoolId: testSchool._id
                }
            ]);

            const result = await studentManager.getStudents({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                __query: { schoolId: testSchool._id.toString() }
            });

            expect(result.length).toBe(2);
        });

        it('should filter students by classroom', async () => {
            await Student.create([
                {
                    firstName: 'In',
                    lastName: 'Class',
                    email: 'inclass@test.com',
                    schoolId: testSchool._id,
                    classroomId: testClassroom._id
                },
                {
                    firstName: 'No',
                    lastName: 'Class',
                    email: 'noclass@test.com',
                    schoolId: testSchool._id
                }
            ]);

            const result = await studentManager.getStudents({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                __query: {
                    schoolId: testSchool._id.toString(),
                    classroomId: testClassroom._id.toString()
                }
            });

            expect(result.length).toBe(1);
            expect(result[0].firstName).toBe('In');
        });
    });

    describe('updateStudent', () => {
        it('should update student details', async () => {
            const student = await Student.create({
                firstName: 'Original',
                lastName: 'Name',
                email: 'original@student.com',
                schoolId: testSchool._id
            });

            const result = await studentManager.updateStudent({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                studentId: student._id.toString(),
                firstName: 'Updated'
            });

            expect(result.firstName).toBe('Updated');
            expect(result.lastName).toBe('Name');
        });
    });

    describe('transferStudent', () => {
        it('should transfer student to another school', async () => {
            const newSchool = await School.create({
                name: 'New School',
                address: 'New Address',
                contactEmail: 'new@school.com',
                contactPhone: '+9876543210',
                createdBy: superadminAuth.userId
            });

            const student = await Student.create({
                firstName: 'Transfer',
                lastName: 'Student',
                email: 'transfer@student.com',
                schoolId: testSchool._id,
                classroomId: testClassroom._id
            });

            const result = await studentManager.transferStudent({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                studentId: student._id.toString(),
                newSchoolId: newSchool._id.toString()
            });

            expect(result.schoolId.toString()).toBe(newSchool._id.toString());
            expect(result.classroomId).toBeNull();
        });
    });

    describe('removeStudent', () => {
        it('should soft delete a student', async () => {
            const student = await Student.create({
                firstName: 'Remove',
                lastName: 'Student',
                email: 'remove@student.com',
                schoolId: testSchool._id
            });

            const result = await studentManager.removeStudent({
                __auth: superadminAuth,
                __schoolAdmin: superadminAuth,
                studentId: student._id.toString()
            });

            expect(result.message).toBe('Student removed successfully');

            const removedStudent = await Student.findById(student._id);
            expect(removedStudent.isActive).toBe(false);
        });
    });
});
