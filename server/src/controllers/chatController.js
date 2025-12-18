import Report from '../models/Report.js';
import { chatWithAI } from '../utils/aiService.js';

/**
 * Chat with AI about user's reports
 * POST /api/chat
 */
export const chat = async (req, res) => {
    try {
        const { message, reportId } = req.body;

        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }

        let reportContext = '';

        // If reportId is provided, include context from that report
        if (reportId) {
            const report = await Report.findById(reportId);
            if (report && report.userId.toString() === req.user._id.toString()) {
                reportContext = `Report Summary: ${report.aiSummary}\nAbnormalities: ${report.aiAnalysis.abnormalities.join(', ')}\nRecommendations: ${report.aiAnalysis.recommendations.join(', ')}`;
            }
        } else {
            // Get user's recent reports for context
            const recentReports = await Report.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('aiSummary aiAnalysis');

            if (recentReports.length > 0) {
                reportContext = recentReports
                    .map(
                        (r) =>
                            `Report: ${r.aiSummary}\nAbnormalities: ${r.aiAnalysis.abnormalities.join(', ')}`
                    )
                    .join('\n\n');
            }
        }

        // Get AI response
        const aiResponse = await chatWithAI(message, reportContext);

        res.json({
            message: aiResponse,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Chat controller error:', error);
        // Provide more detailed error information
        const errorMessage = error.message || 'Failed to get AI response';
        const statusCode = error.status || 500;
        
        res.status(statusCode).json({
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};
