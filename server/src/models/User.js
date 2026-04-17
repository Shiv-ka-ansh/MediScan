import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient',
        },
        verified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        phone: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', ''],
            default: '',
        },
        bloodGroup: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
