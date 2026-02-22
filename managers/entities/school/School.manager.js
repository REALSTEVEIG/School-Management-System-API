module.exports = class School {
    constructor({ validators, mongomodels }) {
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.httpExposed = [
            'post=createSchool',
            'get=getSchool',
            'get=getAllSchools',
            'put=updateSchool',
            'delete=deleteSchool'
        ];
    }

    async createSchool({ __auth, __superadmin, name, address, contactEmail, contactPhone }) {
        const data = { name, address, contactEmail, contactPhone };

        const validationResult = await this.validators.school.createSchool(data);
        if (validationResult) return { error: validationResult };

        const school = new this.mongomodels.School({
            name,
            address,
            contactEmail,
            contactPhone,
            createdBy: __auth.userId
        });

        await school.save();

        return school;
    }

    async getSchool({ __auth, __superadmin, schoolId }) {
        if (!schoolId) return { error: 'School ID is required' };

        const school = await this.mongomodels.School.findById(schoolId);
        if (!school) return { error: 'School not found' };

        return school;
    }

    async getAllSchools({ __auth, __superadmin }) {
        const schools = await this.mongomodels.School.find({ isActive: true });
        return schools;
    }

    async updateSchool({ __auth, __superadmin, schoolId, name, address, contactEmail, contactPhone }) {
        if (!schoolId) return { error: 'School ID is required' };

        const school = await this.mongomodels.School.findById(schoolId);
        if (!school) return { error: 'School not found' };

        const updateData = {};
        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (contactEmail) updateData.contactEmail = contactEmail;
        if (contactPhone) updateData.contactPhone = contactPhone;

        const updatedSchool = await this.mongomodels.School.findByIdAndUpdate(
            schoolId,
            updateData,
            { new: true }
        );

        return updatedSchool;
    }

    async deleteSchool({ __auth, __superadmin, schoolId }) {
        if (!schoolId) return { error: 'School ID is required' };

        const school = await this.mongomodels.School.findById(schoolId);
        if (!school) return { error: 'School not found' };

        await this.mongomodels.School.findByIdAndUpdate(schoolId, { isActive: false });

        return { message: 'School deleted successfully' };
    }
};
