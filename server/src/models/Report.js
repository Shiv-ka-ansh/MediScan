import mongoose, { Schema } from 'mongoose';

const ReportSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
            enum: ['pdf', 'image', 'text'],
        },
        extractedText: {
            type: String,
            default: '',
        },
        aiSummary: {
            type: String,
            default: '',
        },
        aiAnalysis: {
            abnormalities: [String],
            recommendations: [String],
            plainEnglish: String,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        doctorComments: {
            type: String,
            default: '',
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ status: 1 });

export default mongoose.model('Report', ReportSchema);
