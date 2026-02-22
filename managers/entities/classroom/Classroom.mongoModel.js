const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    resources: [{
        type: String,
        trim: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

classroomSchema.index({ schoolId: 1 });
classroomSchema.index({ name: 1, schoolId: 1 });

module.exports = mongoose.model('Classroom', classroomSchema);
