module.exports = class Student {
    constructor({ validators, mongomodels }) {
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.httpExposed = [
            'post=enrollStudent',
            'get=getStudent',
            'get=getStudents',
            'put=updateStudent',
            'put=transferStudent',
            'delete=removeStudent'
        ];
    }

    _canAccessSchool(auth, schoolId) {
        if (auth.role === 'superadmin') return true;
        return auth.schoolId && auth.schoolId.toString() === schoolId.toString();
    }

    async enrollStudent({ __auth, __schoolAdmin, firstName, lastName, email, schoolId, classroomId }) {
        const targetSchoolId = __auth.role === 'superadmin' ? schoolId : __auth.schoolId;

        if (!targetSchoolId) return { error: 'School ID is required' };

        if (!this._canAccessSchool(__auth, targetSchoolId)) {
            return { error: 'Access denied to this school' };
        }

        const school = await this.mongomodels.School.findById(targetSchoolId);
        if (!school || !school.isActive) return { error: 'School not found' };

        const data = { firstName, lastName, email };
        const validationResult = await this.validators.student.enrollStudent(data);
        if (validationResult) return { error: validationResult };

        const existingStudent = await this.mongomodels.Student.findOne({ email });
        if (existingStudent) return { error: 'Student with this email already exists' };

        if (classroomId) {
            const classroom = await this.mongomodels.Classroom.findById(classroomId);
            if (!classroom || !classroom.isActive) return { error: 'Classroom not found' };
            if (classroom.schoolId.toString() !== targetSchoolId.toString()) {
                return { error: 'Classroom does not belong to this school' };
            }
        }

        const student = new this.mongomodels.Student({
            firstName,
            lastName,
            email,
            schoolId: targetSchoolId,
            classroomId: classroomId || null
        });

        await student.save();

        return student;
    }

    async getStudent({ __auth, __schoolAdmin, __query }) {
        const { studentId } = __query || {};
        if (!studentId) return { error: 'Student ID is required' };

        const student = await this.mongomodels.Student.findById(studentId);
        if (!student || !student.isActive) return { error: 'Student not found' };

        if (!this._canAccessSchool(__auth, student.schoolId)) {
            return { error: 'Access denied to this student' };
        }

        return student;
    }

    async getStudents({ __auth, __schoolAdmin, __query }) {
        const { schoolId, classroomId } = __query || {};
        const targetSchoolId = __auth.role === 'superadmin' ? schoolId : __auth.schoolId;

        if (!targetSchoolId) return { error: 'School ID is required' };

        if (!this._canAccessSchool(__auth, targetSchoolId)) {
            return { error: 'Access denied to this school' };
        }

        const query = { schoolId: targetSchoolId, isActive: true };
        if (classroomId) query.classroomId = classroomId;

        const students = await this.mongomodels.Student.find(query);

        return students;
    }

    async updateStudent({ __auth, __schoolAdmin, studentId, firstName, lastName, email, classroomId }) {
        if (!studentId) return { error: 'Student ID is required' };

        const student = await this.mongomodels.Student.findById(studentId);
        if (!student || !student.isActive) return { error: 'Student not found' };

        if (!this._canAccessSchool(__auth, student.schoolId)) {
            return { error: 'Access denied to this student' };
        }

        if (classroomId) {
            const classroom = await this.mongomodels.Classroom.findById(classroomId);
            if (!classroom || !classroom.isActive) return { error: 'Classroom not found' };
            if (classroom.schoolId.toString() !== student.schoolId.toString()) {
                return { error: 'Classroom does not belong to this school' };
            }
        }

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (classroomId !== undefined) updateData.classroomId = classroomId;

        const updatedStudent = await this.mongomodels.Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true }
        );

        return updatedStudent;
    }

    async transferStudent({ __auth, __schoolAdmin, studentId, newSchoolId, newClassroomId }) {
        if (!studentId) return { error: 'Student ID is required' };
        if (!newSchoolId) return { error: 'New school ID is required' };

        const student = await this.mongomodels.Student.findById(studentId);
        if (!student || !student.isActive) return { error: 'Student not found' };

        if (!this._canAccessSchool(__auth, student.schoolId)) {
            return { error: 'Access denied to this student' };
        }

        const newSchool = await this.mongomodels.School.findById(newSchoolId);
        if (!newSchool || !newSchool.isActive) return { error: 'New school not found' };

        if (__auth.role !== 'superadmin' && !this._canAccessSchool(__auth, newSchoolId)) {
            return { error: 'Access denied to transfer to this school' };
        }

        const updateData = { schoolId: newSchoolId, classroomId: null };

        if (newClassroomId) {
            const classroom = await this.mongomodels.Classroom.findById(newClassroomId);
            if (!classroom || !classroom.isActive) return { error: 'New classroom not found' };
            if (classroom.schoolId.toString() !== newSchoolId.toString()) {
                return { error: 'Classroom does not belong to the new school' };
            }
            updateData.classroomId = newClassroomId;
        }

        const updatedStudent = await this.mongomodels.Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true }
        );

        return updatedStudent;
    }

    async removeStudent({ __auth, __schoolAdmin, studentId }) {
        if (!studentId) return { error: 'Student ID is required' };

        const student = await this.mongomodels.Student.findById(studentId);
        if (!student || !student.isActive) return { error: 'Student not found' };

        if (!this._canAccessSchool(__auth, student.schoolId)) {
            return { error: 'Access denied to this student' };
        }

        await this.mongomodels.Student.findByIdAndUpdate(studentId, { isActive: false });

        return { message: 'Student removed successfully' };
    }
};
