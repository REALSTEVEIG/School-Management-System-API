module.exports = class Classroom {
    constructor({ validators, mongomodels }) {
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.httpExposed = [
            'post=createClassroom',
            'get=getClassroom',
            'get=getClassrooms',
            'put=updateClassroom',
            'delete=deleteClassroom'
        ];
    }

    _canAccessSchool(auth, schoolId) {
        if (auth.role === 'superadmin') return true;
        return auth.schoolId && auth.schoolId.toString() === schoolId.toString();
    }

    async createClassroom({ __auth, __schoolAdmin, name, schoolId, capacity, resources }) {
        const targetSchoolId = __auth.role === 'superadmin' ? schoolId : __auth.schoolId;

        if (!targetSchoolId) return { error: 'School ID is required' };

        if (!this._canAccessSchool(__auth, targetSchoolId)) {
            return { error: 'Access denied to this school' };
        }

        const school = await this.mongomodels.School.findById(targetSchoolId);
        if (!school || !school.isActive) return { error: 'School not found' };

        const data = { name, capacity, resources };
        const validationResult = await this.validators.classroom.createClassroom(data);
        if (validationResult) return { error: validationResult };

        const classroom = new this.mongomodels.Classroom({
            name,
            schoolId: targetSchoolId,
            capacity,
            resources: resources || [],
            createdBy: __auth.userId
        });

        await classroom.save();

        return classroom;
    }

    async getClassroom({ __auth, __schoolAdmin, classroomId }) {
        if (!classroomId) return { error: 'Classroom ID is required' };

        const classroom = await this.mongomodels.Classroom.findById(classroomId);
        if (!classroom || !classroom.isActive) return { error: 'Classroom not found' };

        if (!this._canAccessSchool(__auth, classroom.schoolId)) {
            return { error: 'Access denied to this classroom' };
        }

        return classroom;
    }

    async getClassrooms({ __auth, __schoolAdmin, schoolId }) {
        const targetSchoolId = __auth.role === 'superadmin' ? schoolId : __auth.schoolId;

        if (!targetSchoolId) return { error: 'School ID is required' };

        if (!this._canAccessSchool(__auth, targetSchoolId)) {
            return { error: 'Access denied to this school' };
        }

        const classrooms = await this.mongomodels.Classroom.find({
            schoolId: targetSchoolId,
            isActive: true
        });

        return classrooms;
    }

    async updateClassroom({ __auth, __schoolAdmin, classroomId, name, capacity, resources }) {
        if (!classroomId) return { error: 'Classroom ID is required' };

        const classroom = await this.mongomodels.Classroom.findById(classroomId);
        if (!classroom || !classroom.isActive) return { error: 'Classroom not found' };

        if (!this._canAccessSchool(__auth, classroom.schoolId)) {
            return { error: 'Access denied to this classroom' };
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (capacity) updateData.capacity = capacity;
        if (resources) updateData.resources = resources;

        const updatedClassroom = await this.mongomodels.Classroom.findByIdAndUpdate(
            classroomId,
            updateData,
            { new: true }
        );

        return updatedClassroom;
    }

    async deleteClassroom({ __auth, __schoolAdmin, classroomId }) {
        if (!classroomId) return { error: 'Classroom ID is required' };

        const classroom = await this.mongomodels.Classroom.findById(classroomId);
        if (!classroom || !classroom.isActive) return { error: 'Classroom not found' };

        if (!this._canAccessSchool(__auth, classroom.schoolId)) {
            return { error: 'Access denied to this classroom' };
        }

        await this.mongomodels.Classroom.findByIdAndUpdate(classroomId, { isActive: false });

        return { message: 'Classroom deleted successfully' };
    }
};
