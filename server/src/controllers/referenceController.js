import { getReferenceData, checkReferenceValue } from '../utils/aiService.js';

export const getDynamicReference = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }
        const data = await getReferenceData(query);
        res.json(data);
    } catch (error) {
        console.error('Reference Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const checkValue = async (req, res) => {
    try {
        const { testName, value } = req.body;
        if (!testName || !value) {
            return res.status(400).json({ message: 'Test name and value are required' });
        }
        const result = await checkReferenceValue(testName, value);
        res.json(result);
    } catch (error) {
        console.error('Check Value Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};
