import Report from '../models/Report.js';
import { extractTextFromReport } from '../utils/textExtraction.js';
import { analyzeReport, translateReport, SUPPORTED_LANGUAGES } from '../utils/aiService.js';
import { deleteFromCloudinary } from '../utils/cloudinaryService.js';
import path from 'path';

export const uploadReport = async (req, res) => {
    console.log('--- Report Upload Started ---');
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const file = req.file;

        // Cloudinary stores the secure URL in file.path and public_id in file.filename
        const cloudinaryUrl = file.path;
        const cloudinaryPublicId = file.filename;

        const ext = path.extname(file.originalname).slice(1).toLowerCase();
        let fileTypeCategory;
        if (ext === 'pdf') {
            fileTypeCategory = 'pdf';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            fileTypeCategory = 'image';
        } else {
            fileTypeCategory = 'text';
        }

        let extractedText = '';
        try {
            // Pass Cloudinary URL — textExtraction now handles remote URLs
            extractedText = await extractTextFromReport(cloudinaryUrl, fileTypeCategory);
        } catch (error) {
            // Clean up Cloudinary file on extraction failure
            await deleteFromCloudinary(cloudinaryPublicId, fileTypeCategory === 'image' ? 'image' : 'raw').catch(() => {});
            res.status(500).json({
                message: 'Failed to extract text from file',
                error: error.message,
            });
            return;
        }

        if (!extractedText || extractedText.trim().length === 0) {
            await deleteFromCloudinary(cloudinaryPublicId, fileTypeCategory === 'image' ? 'image' : 'raw').catch(() => {});
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
            // Clean up Cloudinary file on AI failure too
            await deleteFromCloudinary(cloudinaryPublicId, fileTypeCategory === 'image' ? 'image' : 'raw').catch(() => {});
            res.status(500).json({
                message: 'Failed to analyze report with AI',
                error: error.message,
            });
            return;
        }

        const report = await Report.create({
            userId: req.user._id,
            fileName: file.originalname,
            filePath: cloudinaryUrl,       // Cloudinary secure URL
            cloudinaryPublicId,            // Saved for future deletion
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
                fileUrl: report.filePath,
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

export const getUserReports = async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-extractedText');

        res.json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get reports' });
    }
};

export const getReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).select('-extractedText');

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

export const getPendingReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .select('-extractedText');

        res.json({ reports });
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Failed to get pending reports',
        });
    }
};

export const reviewReport = async (req, res) => {
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

export const deleteReport = async (req, res) => {
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

        // Delete from Cloudinary before removing DB record
        if (report.cloudinaryPublicId) {
            const resourceType = report.fileType === 'image' ? 'image' : 'raw';
            await deleteFromCloudinary(report.cloudinaryPublicId, resourceType).catch((err) => {
                console.warn(`Cloudinary delete warning for ${report.cloudinaryPublicId}:`, err.message);
            });
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

/**
 * GET /api/reports/:id/translate?lang=hi
 * Translate an existing report's AI analysis on demand
 */
export const translateReportHandler = async (req, res) => {
    try {
        const { lang } = req.query;

        if (!lang || !SUPPORTED_LANGUAGES[lang]) {
            return res.status(400).json({
                message: `Unsupported language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`,
                supportedLanguages: SUPPORTED_LANGUAGES,
            });
        }

        if (lang === 'en') {
            const report = await Report.findById(req.params.id).select('aiSummary aiAnalysis userId');
            if (!report) return res.status(404).json({ message: 'Report not found' });
            if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'doctor' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied' });
            }
            return res.json({
                language: 'en',
                languageName: 'English',
                translation: {
                    summary: report.aiSummary,
                    abnormalities: report.aiAnalysis?.abnormalities || [],
                    recommendations: report.aiAnalysis?.recommendations || [],
                    plainEnglish: report.aiAnalysis?.plainEnglish || '',
                },
            });
        }

        const report = await Report.findById(req.params.id).select('aiSummary aiAnalysis userId translations');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (
            report.userId.toString() !== req.user._id.toString() &&
            req.user.role !== 'doctor' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Return cached translation if already exists
        if (report.translations && report.translations.get && report.translations.get(lang)) {
            return res.json({
                language: lang,
                languageName: SUPPORTED_LANGUAGES[lang],
                translation: report.translations.get(lang),
                cached: true,
            });
        }

        // Generate translation via Gemini
        const sourceData = {
            summary: report.aiSummary,
            abnormalities: report.aiAnalysis?.abnormalities || [],
            recommendations: report.aiAnalysis?.recommendations || [],
            plainEnglish: report.aiAnalysis?.plainEnglish || '',
        };

        console.log(`Translating report ${req.params.id} to ${lang}...`);
        const translated = await translateReport(sourceData, lang);

        // Cache the translation in the DB
        if (!report.translations) {
            report.translations = new Map();
        }
        report.translations.set(lang, translated);
        await report.save();

        return res.json({
            language: lang,
            languageName: SUPPORTED_LANGUAGES[lang],
            translation: translated,
            cached: false,
        });
    } catch (error) {
        console.error('Translation handler error:', error.message);
        res.status(500).json({ message: error.message || 'Translation failed' });
    }
};

/**
 * GET /api/reports/languages
 * Returns list of supported languages
 */
export const getSupportedLanguages = async (req, res) => {
    res.json({ languages: SUPPORTED_LANGUAGES });
};
