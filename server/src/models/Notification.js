import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['report_opened', 'report_commented', 'report_verified', 'report_rejected', 'system'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        reportId: {
            type: Schema.Types.ObjectId,
            ref: 'Report',
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
