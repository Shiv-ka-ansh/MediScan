import Report from '../models/Report.js';
import { extractTextFromReport } from '../utils/textExtraction.js';
import { analyzeReport } from '../utils/aiService.js';
import path from 'path';

export const uploadReport = async (
    req,
    res
) => {
    console.log('--- Report Upload Started ---');
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const file = req.file;
        const filePath = file.path;
        const fileType = path.extname(file.originalname).slice(1).toLowerCase();

        let fileTypeCategory;
        if (fileType === 'pdf') {
            fileTypeCategory = 'pdf';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
            fileTypeCategory = 'image';
        } else {
            fileTypeCategory = 'text';
        }

        let extractedText = '';
        try {
            extractedText = await extractTextFromReport(filePath, fileTypeCategory);
        } catch (error) {
            res.status(500).json({
                message: 'Failed to extract text from file',
                error: error.message,
            });
            return;
        }

        if (!extractedText || extractedText.trim().length === 0) {
            res.status(400).json({
                message: 'Could not extract text from file. Please ensure the file contains readable text.',
            });
            return;
        }

        let aiAnalysis;
        try {
            console.log('Starting AI Analysis...');
            aiAnalysis = await analyzeReport(extractedText);
            console.log('AI Analysis Completed Successfully');
        } catch (error) {
            console.error('AI Analysis Error:', error.message);
            res.status(500).json({
                message: 'Failed to analyze report with AI',
                error: error.message,
            });
            return;
        }

        const report = await Report.create({
            userId: req.user._id,
            fileName: file.originalname,
            filePath: filePath,
            fileType: fileTypeCategory,
            extractedText: extractedText,
            aiSummary: aiAnalysis.summary,
            aiAnalysis: {
                abnormalities: aiAnalysis.abnormalities,
                recommendations: aiAnalysis.recommendations,
                plainEnglish: aiAnalysis.plainEnglish,
            },
            status: 'pending',
        });

        res.status(201).json({
            message: 'Report uploaded and analyzed successfully',
            report: {
                id: report._id,
                fileName: report.fileName,
                aiSummary: report.aiSummary,
                aiAnalysis: report.aiAnalysis,
                status: report.status,
                createdAt: report.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to upload report' });
    }
};

export const getUserReports = async (
    req,
    res
) => {
    try {
        const reports = await Report.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-extractedText -filePath');

        res.json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get reports' });
    }
};

export const getReport = async (
    req,
    res
) => {
    try {
        const report = await Report.findById(req.params.id).select(
            '-extractedText -filePath'
        );

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        if (
            report.userId.toString() !== req.user._id.toString() &&
            req.user.role !== 'doctor' &&
            req.user.role !== 'admin'
        ) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        res.json({ report });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get report' });
    }
};

export const getPendingReports = async (
    req,
    res
) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .select('-extractedText -filePath');

        res.json({ reports });
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Failed to get pending reports',
        });
    }
};

export const reviewReport = async (
    req,
    res
) => {
    try {
        const { status, comments } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            res.status(400).json({
                message: 'Status must be either "approved" or "rejected"',
            });
            return;
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        report.status = status;
        report.doctorComments = comments || '';
        report.reviewedBy = req.user._id;
        report.reviewedAt = new Date();

        await report.save();

        res.json({
            message: 'Report reviewed successfully',
            report: {
                id: report._id,
                status: report.status,
                doctorComments: report.doctorComments,
                reviewedAt: report.reviewedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to review report' });
    }
};

export const deleteReport = async (
    req,
    res
) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        if (
            report.userId.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        await Report.findByIdAndDelete(req.params.id);

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete report' });
    }
};

export const getReviewedReports = async (req, res) => {
    try {
        const reports = await Report.find({ reviewedBy: req.user._id })
            .populate('userId', 'name email')
            .sort({ reviewedAt: -1 })
            .select('-extractedText');

        res.json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get reviewed reports' });
    }
};
